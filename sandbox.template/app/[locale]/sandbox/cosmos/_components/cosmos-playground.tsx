"use client";

import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

import { CosmosMap, KIND_LABELS } from "./cosmos-map";
import {
  GRANT_LABELS,
  HOME_CAPABILITIES,
  INITIAL_STATE,
  LOCAL_ORBIT,
  TRAVEL_BASE_CAPABILITIES,
  WORLDS,
  acceptGuide,
  canTravel,
  coWork,
  depart,
  hasRocket,
  horizonRadius,
  localQuest,
  requestShadow,
  rest,
  returnHome,
  travelCost,
  worldDistance,
  type CosmosState,
} from "./model";

const STORAGE_KEY = "sandbox-cosmos-v1";

// Мини-стор поверх localStorage: совместим с SSR через useSyncExternalStore
let cachedState: CosmosState | null = null;
const listeners = new Set<() => void>();

function getSnapshot(): CosmosState {
  if (cachedState === null) {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      cachedState = raw ? (JSON.parse(raw) as CosmosState) : INITIAL_STATE;
    } catch {
      cachedState = INITIAL_STATE;
    }
  }
  return cachedState;
}

function getServerSnapshot(): CosmosState {
  return INITIAL_STATE;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function dispatch(updater: (s: CosmosState) => CosmosState): void {
  cachedState = updater(getSnapshot());
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cachedState));
  } catch {
    // localStorage недоступен — стор продолжает жить в памяти
  }
  listeners.forEach((l) => l());
}

function Bar({ value, max, className }: { value: number; max: number; className: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-foreground/10">
      <div
        className={`h-full rounded-full transition-all duration-500 ${className}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

export function CosmosPlayground() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const setState = dispatch;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedWorld = WORLDS.find((w) => w.id === selectedId) ?? null;
  const mode = state.mode;
  const travelWorld =
    mode.type === "travel" ? WORLDS.find((w) => w.id === mode.worldId) ?? null : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <div className="space-y-3">
        <CosmosMap state={state} selectedId={selectedId} onSelect={setSelectedId} />
        <p className="text-xs text-muted-foreground">
          Радиус на карте — это когнитивная дистанция, а не километры: она зависит от уровня,
          психотипического различия и доверия. Миры за горизонтом видны как «?». Пунктир —
          местная орбита: за неё нельзя без ракеты (уровень 2).
        </p>
      </div>

      <div className="space-y-4">
        {/* Состояние игрока */}
        <section className="space-y-3 rounded-xl border border-foreground/10 bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">
              Игрок P — уровень {state.level}
              {hasRocket(state) ? " · есть ракета" : ""}
            </h3>
            <span
              className={
                state.mode.type === "home"
                  ? "rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-500"
                  : "rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-500"
              }
            >
              {state.mode.type === "home" ? "дома · волна" : "в пути · частица"}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Когерентность</span>
              <span>{state.coherence}/100</span>
            </div>
            <Bar value={state.coherence} max={100} className="bg-sky-400" />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Опыт</span>
              <span>{state.xp}</span>
            </div>
            <Bar value={state.xp} max={220} className="bg-emerald-400" />
          </div>
          <p className="text-xs text-muted-foreground">
            Горизонт восприятия: {Math.round(horizonRadius(state) * 100)}% — растёт с уровнем,
            сужается при усталости.
          </p>

          {state.mode.type === "home" ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setState(rest)}>
                Отдых (+30 когерентности)
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={state.coherence < 10}
                onClick={() => setState(localQuest)}
              >
                Локальный квест (−10, +18 опыта)
              </Button>
            </div>
          ) : null}
        </section>

        {/* Мембрана: что доступно в текущем режиме */}
        <section className="space-y-2 rounded-xl border border-foreground/10 bg-card p-4">
          <h3 className="text-sm font-semibold">
            {state.mode.type === "home"
              ? "Полная экология (дом)"
              : "Узкая мембрана (путешествие)"}
          </h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            {(state.mode.type === "home" ? HOME_CAPABILITIES : TRAVEL_BASE_CAPABILITIES).map(
              (cap) => (
                <li key={cap}>· {cap}</li>
              )
            )}
            {state.mode.type === "travel"
              ? state.mode.grants.map((g) => (
                  <li key={g} className="text-amber-500">
                    + {GRANT_LABELS[g]} (грант хоста)
                  </li>
                ))
              : null}
          </ul>
        </section>

        {/* Действия в путешествии */}
        {state.mode.type === "travel" && travelWorld ? (
          <section className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
            <h3 className="text-sm font-semibold">Вы на «{travelWorld.name}»</h3>
            <p className="text-xs text-muted-foreground">
              Новые возможности приходят только через законную встречу: гранты хоста, совместную
              работу, доверие. Ваш внутренний мир остался дома.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={state.mode.grants.includes("guide")}
                onClick={() => setState(acceptGuide)}
              >
                Принять гида (−5)
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={state.coherence < 15}
                onClick={() => setState(coWork)}
              >
                Совместная работа (−15, +доверие)
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={state.mode.grants.includes("shadow")}
                onClick={() => setState(requestShadow)}
              >
                Запросить тень хоста
              </Button>
            </div>
            <Button size="sm" onClick={() => setState(returnHome)}>
              Вернуться домой и интегрировать опыт
            </Button>
          </section>
        ) : null}

        {/* Выбранный мир */}
        {selectedWorld ? (
          (() => {
            const dist = worldDistance(state, selectedWorld);
            const inHorizon = dist <= horizonRadius(state);
            const trust = state.trust[selectedWorld.id] ?? 0;
            const check = canTravel(state, selectedWorld);
            return (
              <section className="space-y-3 rounded-xl border border-foreground/10 bg-card p-4">
                <div>
                  <h3 className="text-sm font-semibold">
                    {inHorizon ? selectedWorld.name : "Неопознанный сигнал"}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {inHorizon
                      ? `${KIND_LABELS[selectedWorld.kind]} · ${selectedWorld.blurb}`
                      : "Мир за горизонтом восприятия. Он существует, но вы пока не способны его прочесть."}
                  </p>
                </div>
                {inHorizon ? (
                  <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <dt className="text-muted-foreground">Когнитивная дистанция</dt>
                    <dd>{Math.round(dist * 100)}%</dd>
                    <dt className="text-muted-foreground">Психотипическое различие</dt>
                    <dd>{Math.round(selectedWorld.typeGap * 100)}%</dd>
                    <dt className="text-muted-foreground">Доверие между мирами</dt>
                    <dd>{Math.round(trust * 100)}%</dd>
                    <dt className="text-muted-foreground">Стоимость пути</dt>
                    <dd>{travelCost(dist)} когерентности</dd>
                    <dt className="text-muted-foreground">Требуемый уровень</dt>
                    <dd>{selectedWorld.levelReq}</dd>
                    <dt className="text-muted-foreground">За местной орбитой</dt>
                    <dd>{dist > LOCAL_ORBIT ? "да (нужна ракета)" : "нет"}</dd>
                  </dl>
                ) : null}
                {state.mode.type === "home" ? (
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      disabled={!check.ok}
                      onClick={() => setState((s) => depart(s, selectedWorld))}
                    >
                      Отправиться
                    </Button>
                    {!check.ok ? (
                      <p className="text-xs text-amber-500">{check.reason}</p>
                    ) : null}
                  </div>
                ) : null}
              </section>
            );
          })()
        ) : null}

        {/* Журнал событий */}
        <section className="space-y-2 rounded-xl border border-foreground/10 bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Журнал Дерева</h3>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setState(() => INITIAL_STATE);
                setSelectedId(null);
              }}
            >
              Сброс
            </Button>
          </div>
          <ul className="max-h-56 space-y-1.5 overflow-y-auto text-xs text-muted-foreground">
            {state.log.map((entry, i) => (
              <li key={`${entry.at}-${i}`}>· {entry.text}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

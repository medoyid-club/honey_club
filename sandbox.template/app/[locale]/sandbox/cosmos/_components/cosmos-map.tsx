"use client";

import {
  LOCAL_ORBIT,
  WORLDS,
  hasRocket,
  horizonRadius,
  worldDistance,
  type CosmosState,
  type WorldKind,
} from "./model";

const SIZE = 640;
const CENTER = SIZE / 2;
const MAX_R = 290;
const MIN_R = 70;

const KIND_COLORS: Record<WorldKind, string> = {
  test: "#7dd3fc",
  player: "#fbbf24",
  shared: "#a78bfa",
  expedition: "#fb7185",
};

export const KIND_LABELS: Record<WorldKind, string> = {
  test: "тестовый мир",
  player: "планета игрока",
  shared: "общий мир",
  expedition: "экспедиция",
};

function toRadius(distance: number): number {
  return MIN_R + distance * (MAX_R - MIN_R);
}

function polar(angleDeg: number, radius: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad) };
}

// Детерминированные «звёзды», чтобы фон не мигал при перерисовках
const STARS = Array.from({ length: 90 }, (_, i) => {
  const a = Math.sin(i * 127.1) * 43758.5453;
  const b = Math.sin(i * 311.7) * 12543.897;
  return {
    x: Math.abs(a % 1) * SIZE,
    y: Math.abs(b % 1) * SIZE,
    r: 0.5 + Math.abs((a * b) % 1),
  };
});

type Props = {
  state: CosmosState;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
};

export function CosmosMap({ state, selectedId, onSelect }: Props) {
  const horizonR = toRadius(horizonRadius(state));
  const travellingTo = state.mode.type === "travel" ? state.mode.worldId : null;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-auto w-full rounded-xl border border-foreground/10"
      style={{ background: "radial-gradient(circle at 50% 45%, #101529 0%, #05060f 75%)" }}
      role="img"
      aria-label="Карта условного космоса"
      onClick={() => onSelect(null)}
    >
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#ffffff" opacity={0.28} />
      ))}

      {/* Горизонт восприятия */}
      <circle
        cx={CENTER}
        cy={CENTER}
        r={horizonR}
        fill="rgba(125, 211, 252, 0.04)"
        stroke="#7dd3fc"
        strokeOpacity={0.35}
        strokeWidth={1.5}
      />
      <text
        x={CENTER}
        y={CENTER - horizonR - 8}
        textAnchor="middle"
        fill="#7dd3fc"
        opacity={0.6}
        fontSize={12}
      >
        горизонт восприятия
      </text>

      {/* Местная орбита: предел без ракеты */}
      {!hasRocket(state) ? (
        <circle
          cx={CENTER}
          cy={CENTER}
          r={toRadius(LOCAL_ORBIT)}
          fill="none"
          stroke="#fbbf24"
          strokeOpacity={0.3}
          strokeWidth={1}
          strokeDasharray="6 6"
        />
      ) : null}

      {/* Маршрут путешествия */}
      {travellingTo
        ? (() => {
            const world = WORLDS.find((w) => w.id === travellingTo);
            if (!world) return null;
            const p = polar(world.angle, toRadius(worldDistance(state, world)));
            return (
              <line
                x1={CENTER}
                y1={CENTER}
                x2={p.x}
                y2={p.y}
                stroke="#fbbf24"
                strokeOpacity={0.7}
                strokeWidth={1.5}
                strokeDasharray="4 6"
              />
            );
          })()
        : null}

      {/* Миры */}
      {WORLDS.map((world) => {
        const dist = worldDistance(state, world);
        const inHorizon = dist <= horizonRadius(state);
        const p = polar(world.angle, toRadius(dist));
        const color = KIND_COLORS[world.kind];
        const selected = selectedId === world.id;
        const here = travellingTo === world.id;

        return (
          <g
            key={world.id}
            transform={`translate(${p.x}, ${p.y})`}
            className="cursor-pointer"
            style={{ transition: "transform 700ms ease" }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(world.id);
            }}
          >
            {selected ? (
              <circle r={20} fill="none" stroke={color} strokeOpacity={0.8} strokeWidth={1.5} />
            ) : null}
            {inHorizon ? (
              <>
                <circle r={11} fill={color} opacity={0.25} />
                <circle r={7} fill={color} />
                <text y={26} textAnchor="middle" fill="#e2e8f0" fontSize={11}>
                  {world.name}
                </text>
              </>
            ) : (
              <>
                <circle r={6} fill="#64748b" opacity={0.35} />
                <text y={4} textAnchor="middle" fill="#94a3b8" fontSize={10} opacity={0.8}>
                  ?
                </text>
              </>
            )}
            {here ? (
              <text y={-16} textAnchor="middle" fill="#fbbf24" fontSize={11}>
                вы здесь
              </text>
            ) : null}
          </g>
        );
      })}

      {/* Домашняя планета */}
      <g
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(null);
        }}
      >
        <circle cx={CENTER} cy={CENTER} r={22} fill="#34d399" opacity={0.18}>
          <animate attributeName="r" values="22;28;22" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx={CENTER} cy={CENTER} r={13} fill="#34d399" />
        <text x={CENTER} y={CENTER + 34} textAnchor="middle" fill="#a7f3d0" fontSize={12}>
          {state.mode.type === "home" ? "ваша планета (вы дома)" : "ваша планета"}
        </text>
      </g>
    </svg>
  );
}

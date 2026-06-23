"use client";

import { Lock, RotateCcw, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";

import { TraitBar } from "@/components/personality/trait-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  EMPTY_DEMO_STATE,
  buildAxesFromDemo,
  isLayerUnlocked,
  profileProgressPercent,
  readDemoState,
  writeDemoState,
  type PersonalityDemoState,
} from "@/lib/personality/demo-state";
import { PROFILE_LAYERS } from "@/lib/personality/layers";
import { AXIS_KEYS, type RadicalId } from "@/lib/personality/model";
import {
  QUESTS,
  REWARDS,
  applyAutomaticRewards,
  completeQuest,
  isQuestAvailable,
  isQuestCompleted,
  isRewardUnlocked,
} from "@/lib/personality/rewards";
import {
  BIG_FIVE_QUESTIONS,
  RADICAL_QUESTIONS,
  scoreBigFive,
  scoreRadical,
  type BigFiveQuestionId,
  type LikertAnswer,
  type RadicalQuestionId,
} from "@/lib/personality/tests";
import { cn } from "@/lib/utils";

const LIKERT: LikertAnswer[] = [1, 2, 3, 4, 5];

export function PersonalityPlayground() {
  const t = useTranslations("AdminPersonality.playground");

  const [state, setState] = useState<PersonalityDemoState>(EMPTY_DEMO_STATE);
  const [bfAnswers, setBfAnswers] = useState<Partial<Record<BigFiveQuestionId, LikertAnswer>>>({});
  const [radAnswers, setRadAnswers] = useState<Partial<Record<RadicalQuestionId, string>>>({});
  const [checkin, setCheckin] = useState({ energy: 60, mood: 60, stress: 40 });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(readDemoState());
    setHydrated(true);
  }, []);

  const persist = useCallback((next: PersonalityDemoState) => {
    const withRewards = applyAutomaticRewards(next);
    setState(withRewards);
    writeDemoState(withRewards);
  }, []);

  const axes = useMemo(() => buildAxesFromDemo(state), [state]);
  const progress = profileProgressPercent(state);

  const submitBigFive = () => {
    if (BIG_FIVE_QUESTIONS.some((q) => !bfAnswers[q.id])) return;
    persist({ ...state, bigFive: scoreBigFive(bfAnswers) });
  };

  const submitRadicals = () => {
    if (RADICAL_QUESTIONS.some((q) => !radAnswers[q.id])) return;
    persist({
      ...state,
      radicalId: scoreRadical(radAnswers as Partial<Record<RadicalQuestionId, RadicalId>>),
    });
  };

  const submitCheckin = () => {
    persist({
      ...state,
      checkins: [
        ...state.checkins,
        { ...checkin, at: new Date().toISOString() },
      ],
    });
  };

  const resetDemo = () => {
    setBfAnswers({});
    setRadAnswers({});
    setCheckin({ energy: 60, mood: 60, stress: 40 });
    setState(EMPTY_DEMO_STATE);
    writeDemoState(EMPTY_DEMO_STATE);
  };

  if (!hydrated) {
    return (
      <div className="rounded-xl border border-foreground/10 bg-card p-8 text-sm text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("title")}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={resetDemo}>
          <RotateCcw className="mr-2 size-4" />
          {t("reset")}
        </Button>
      </div>

      <Card className="border-primary/20 honey-glow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("progressTitle")}</CardTitle>
          <CardDescription>{t("progressDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t("profileFill")}</span>
              <span className="font-semibold tabular-nums">{progress}%</span>
            </div>
            <div className="progress-honey">
              <span style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PROFILE_LAYERS.map((layer, index) => {
              const unlocked = isLayerUnlocked(state, layer.id);
              return (
                <div
                  key={layer.id}
                  className={cn(
                    "rounded-lg border px-3 py-3 text-sm transition-colors",
                    unlocked
                      ? "border-primary/30 bg-primary/5"
                      : "border-foreground/10 bg-muted/20 text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {unlocked ? (
                      <Badge className="border-primary/30 bg-primary/10 text-primary">
                        {t("layerOpen")}
                      </Badge>
                    ) : (
                      <Lock className="size-3.5 shrink-0" />
                    )}
                    <span className={cn("font-medium", unlocked && "text-foreground")}>
                      {index + 1}. {t(`layers.${layer.id}`)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {unlocked ? t(`layers.${layer.id}Done`) : t(`layers.${layer.id}Locked`)}
                  </p>
                </div>
              );
            })}
          </div>

          {axes && (
            <div className="border-t border-foreground/10 pt-4">
              <p className="mb-3 text-sm font-medium">{t("computedAxes")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {AXIS_KEYS.map((key) => (
                  <TraitBar key={key} label={t(`axes.${key}`)} value={axes[key]} />
                ))}
              </div>
              {state.radicalId && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {t("dominantRadical", { name: t(`radicals.${state.radicalId}`) })}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("bigFiveTitle")}</CardTitle>
            <CardDescription>{t("bigFiveDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {BIG_FIVE_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2 rounded-lg border border-foreground/10 p-3">
                <p className="text-sm">{t(`bigFive.${q.id}`)}</p>
                <div className="flex flex-wrap gap-1">
                  {LIKERT.map((value) => (
                    <Button
                      key={value}
                      type="button"
                      size="sm"
                      variant={bfAnswers[q.id] === value ? "default" : "outline"}
                      onClick={() => setBfAnswers((prev) => ({ ...prev, [q.id]: value }))}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={BIG_FIVE_QUESTIONS.some((q) => !bfAnswers[q.id])}
              onClick={submitBigFive}
            >
              {state.bigFive ? t("bigFiveRetake") : t("bigFiveSubmit")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("radicalsTitle")}</CardTitle>
            <CardDescription>{t("radicalsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {RADICAL_QUESTIONS.map((q) => (
              <div key={q.id} className="space-y-2 rounded-lg border border-foreground/10 p-3">
                <p className="text-sm">{t(`radicalsQ.${q.id}`)}</p>
                <div className="flex flex-col gap-1">
                  {q.options.map((opt) => (
                    <Button
                      key={opt.radical}
                      type="button"
                      size="sm"
                      variant={radAnswers[q.id] === opt.radical ? "default" : "outline"}
                      className="justify-start"
                      onClick={() =>
                        setRadAnswers((prev) => ({ ...prev, [q.id]: opt.radical }))
                      }
                    >
                      {t(`radicals.${opt.radical}`)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={RADICAL_QUESTIONS.some((q) => !radAnswers[q.id])}
              onClick={submitRadicals}
            >
              {state.radicalId ? t("radicalsRetake") : t("radicalsSubmit")}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("checkinTitle")}</CardTitle>
          <CardDescription>{t("checkinDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(["energy", "mood", "stress"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <Label>{t(`checkin.${key}`)}</Label>
                <span className="tabular-nums text-muted-foreground">{checkin[key]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={checkin[key]}
                onChange={(e) =>
                  setCheckin((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="w-full accent-primary"
              />
            </div>
          ))}
          <Button type="button" variant="secondary" onClick={submitCheckin}>
            {t("checkinSubmit")}
          </Button>
          {state.checkins.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {t("checkinCount", { count: state.checkins.length })}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("questsTitle")}</CardTitle>
            <CardDescription>{t("questsDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {QUESTS.map((quest) => {
              const done = isQuestCompleted(state, quest.id);
              const available = isQuestAvailable(state, quest);
              return (
                <div
                  key={quest.id}
                  className={cn(
                    "rounded-lg border p-4",
                    done
                      ? "border-green-500/30 bg-green-500/5"
                      : available
                        ? "border-primary/25"
                        : "border-foreground/10 opacity-70"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{t(`quests.${quest.id}.title`)}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {t(`quests.${quest.id}.desc`)}
                      </p>
                    </div>
                    {done ? (
                      <Badge className="border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400">
                        {t("questDone")}
                      </Badge>
                    ) : null}
                  </div>
                  {!done && (
                    <Button
                      type="button"
                      size="sm"
                      className="mt-3"
                      disabled={!available}
                      onClick={() => persist(completeQuest(state, quest.id))}
                    >
                      {available ? t("questComplete") : t("questLocked")}
                    </Button>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="size-4 text-primary" />
              {t("rewardsTitle")}
            </CardTitle>
            <CardDescription>{t("rewardsDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2">
              {REWARDS.map((reward) => {
                const unlocked = isRewardUnlocked(state, reward.id);
                return (
                  <div
                    key={reward.id}
                    className={cn(
                      "rounded-lg border px-3 py-3 text-sm",
                      unlocked
                        ? "border-primary/30 bg-primary/5"
                        : "border-foreground/10 bg-muted/20"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {unlocked ? (
                        <Badge variant="secondary">{t(`rewardKinds.${reward.kind}`)}</Badge>
                      ) : (
                        <Lock className="size-3.5 text-muted-foreground" />
                      )}
                      <span className={cn("font-medium", !unlocked && "text-muted-foreground")}>
                        {t(`rewards.${reward.id}`)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t(`rewards.${reward.id}Desc`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

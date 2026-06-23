"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
  PERSONALITY_DEMO_EVENT,
  buildAxesFromDemo,
  readDemoState,
} from "@/lib/personality/demo-state";
import {
  AXIS_KEYS,
  GOAL_IDS,
  GOAL_SYN_KEYS,
  ITEMS,
  RADICALS,
  SYN_KEYS,
  computeStats,
  computeSynergy,
  getItemById,
  getRadicalById,
  type GoalId,
  type ItemId,
  type RadicalId,
  type SynKey,
} from "@/lib/personality/model";
import { cn } from "@/lib/utils";

export function HoneyClubLab() {
  const t = useTranslations("AdminHoneyClub");

  const [classA, setClassA] = useState<RadicalId>("isteroid");
  const [classB, setClassB] = useState<RadicalId>("shizoid");
  const [itemId, setItemId] = useState<ItemId>("none");
  const [goalId, setGoalId] = useState<GoalId>("work");
  const [useMyProfile, setUseMyProfile] = useState(false);
  const [profileAxes, setProfileAxes] = useState<ReturnType<typeof buildAxesFromDemo>>(null);

  useEffect(() => {
    const sync = () => {
      const demo = readDemoState();
      const axes = buildAxesFromDemo(demo);
      setProfileAxes(axes);
      if (useMyProfile && demo.radicalId) {
        setClassA(demo.radicalId);
        if (demo.equippedArtifact !== "none") {
          setItemId(demo.equippedArtifact);
        }
      }
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(PERSONALITY_DEMO_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(PERSONALITY_DEMO_EVENT, sync);
    };
  }, [useMyProfile]);

  const toggleMyProfile = () => {
    const next = !useMyProfile;
    setUseMyProfile(next);
    if (next) {
      const demo = readDemoState();
      if (demo.radicalId) setClassA(demo.radicalId);
      if (demo.equippedArtifact !== "none") setItemId(demo.equippedArtifact);
    }
  };

  const radA = getRadicalById(classA);
  const displayAxes = useMyProfile && profileAxes ? profileAxes : radA.axes;
  const radB = getRadicalById(classB);
  const item = getItemById(itemId);
  const stats = computeStats(displayAxes, item);
  const syn = computeSynergy(displayAxes, radB.axes);
  const goalKeys = GOAL_SYN_KEYS[goalId];

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("labTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("labSubtitle")}</p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="radical-a">{t("radicalLabel")}</Label>
            <select
              id="radical-a"
              value={classA}
              disabled={useMyProfile}
              onChange={(e) => setClassA(e.target.value as RadicalId)}
              className="w-full min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              {RADICALS.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(`radicals.${r.id}.name`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="artifact">{t("artifactLabel")}</Label>
            <select
              id="artifact"
              value={itemId}
              disabled={useMyProfile}
              onChange={(e) => setItemId(e.target.value as ItemId)}
              className="w-full min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              {ITEMS.map((i) => (
                <option key={i.id} value={i.id}>
                  {t(`items.${i.id}`)}
                </option>
              ))}
            </select>
          </div>

          <p className="text-sm italic text-muted-foreground lg:flex-1">
            {t(`radicals.${radA.id}.tagline`)}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            size="sm"
            variant={useMyProfile ? "default" : "outline"}
            disabled={!profileAxes}
            onClick={toggleMyProfile}
          >
            {t("useMyProfile")}
          </Button>
          {!profileAxes && (
            <p className="text-xs text-muted-foreground">{t("useMyProfileHint")}</p>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("axesTitle")}</CardTitle>
              <CardDescription>{t("axesDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {AXIS_KEYS.map((key) => (
                <TraitBar
                  key={key}
                  label={t(`axes.${key}`)}
                  value={displayAxes[key]}
                />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-start justify-between gap-2 space-y-0">
              <div className="space-y-1.5">
                <CardTitle className="text-base">{t("statsTitle")}</CardTitle>
                <CardDescription>{t("statsDesc")}</CardDescription>
              </div>
              {itemId !== "none" ? (
                <Badge variant="secondary">{t(`items.${itemId}`)}</Badge>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.map((stat) => (
                <TraitBar
                  key={stat.id}
                  label={t(`stats.${stat.id}`)}
                  value={stat.value}
                  delta={stat.delta}
                />
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-lg font-semibold">{t("synergyTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("synergySubtitle", {
              name: t(`radicals.${radA.id}.name`),
            })}
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="space-y-2">
            <Label htmlFor="radical-b">{t("partnerLabel")}</Label>
            <select
              id="radical-b"
              value={classB}
              onChange={(e) => setClassB(e.target.value as RadicalId)}
              className="w-full min-w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            >
              {RADICALS.map((r) => (
                <option key={r.id} value={r.id}>
                  {t(`radicals.${r.id}.name`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>{t("goalLabel")}</Label>
            <div className="flex flex-wrap gap-2">
              {GOAL_IDS.map((id) => (
                <Button
                  key={id}
                  type="button"
                  size="sm"
                  variant={goalId === id ? "default" : "outline"}
                  onClick={() => setGoalId(id)}
                >
                  {t(`goals.${id}`)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {t(`radicals.${radA.id}.name`)} × {t(`radicals.${radB.id}.name`)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {SYN_KEYS.map((key) => (
                <TraitBar
                  key={key}
                  label={t(`synergy.${key}`)}
                  value={syn[key]}
                  barClassName={cn(
                    key === "conflict" && "bg-orange-500",
                    key === "complement" && "bg-emerald-600"
                  )}
                />
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {goalKeys.map((key: SynKey) => (
                <div
                  key={key}
                  className="rounded-lg border border-foreground/10 bg-card p-3 text-center"
                >
                  <p className="text-2xl font-semibold tabular-nums">{syn[key]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{t(`synergy.${key}`)}</p>
                </div>
              ))}
            </div>

            <div
              className={cn(
                "rounded-lg border p-4 text-sm",
                syn.conflict >= 60
                  ? "border-orange-500/30 bg-orange-500/5"
                  : "border-foreground/10 bg-muted/30"
              )}
            >
              <p className="font-medium">
                {t("observationTitle", { goal: t(`goals.${goalId}`) })}
              </p>
              <p className="mt-2 text-muted-foreground">
                {t("observationBody", {
                  metrics: goalKeys
                    .map((k) => `${t(`synergy.${k}`)} (${syn[k]})`)
                    .join(", "),
                  conflict: syn.conflict,
                })}
              </p>
              <p className="mt-2 text-xs italic text-muted-foreground">{t("observationDisclaimer")}</p>
            </div>
          </div>
        </div>
      </section>

      <p className="text-xs text-muted-foreground">{t("footnote")}</p>
    </div>
  );
}

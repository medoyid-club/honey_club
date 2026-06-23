import type { ProfileLayerId } from "@/lib/personality/layers";
import {
  type Axes,
  type ItemId,
  type RadicalId,
  clamp,
  getRadicalById,
} from "@/lib/personality/model";
import type { BigFiveScores } from "@/lib/personality/tests";

export const PERSONALITY_DEMO_STORAGE_KEY = "honey-club-personality-demo-v1";

export type StateCheckin = {
  energy: number;
  mood: number;
  stress: number;
  at: string;
};

export type PersonalityDemoState = {
  bigFive: BigFiveScores | null;
  radicalId: RadicalId | null;
  checkins: StateCheckin[];
  completedQuests: string[];
  unlockedRewards: string[];
  equippedArtifact: ItemId;
};

export const EMPTY_DEMO_STATE: PersonalityDemoState = {
  bigFive: null,
  radicalId: null,
  checkins: [],
  completedQuests: [],
  unlockedRewards: [],
  equippedArtifact: "none",
};

export function readDemoState(): PersonalityDemoState {
  if (typeof window === "undefined") return EMPTY_DEMO_STATE;
  try {
    const raw = window.localStorage.getItem(PERSONALITY_DEMO_STORAGE_KEY);
    if (!raw) return EMPTY_DEMO_STATE;
    return { ...EMPTY_DEMO_STATE, ...JSON.parse(raw) };
  } catch {
    return EMPTY_DEMO_STATE;
  }
}

export const PERSONALITY_DEMO_EVENT = "honey-personality-demo-updated";

export function writeDemoState(state: PersonalityDemoState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PERSONALITY_DEMO_STORAGE_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(PERSONALITY_DEMO_EVENT));
}

function blendAxes(a: Axes, b: Axes, weightB: number): Axes {
  const w = weightB;
  return {
    ext: clamp(a.ext * (1 - w) + b.ext * w),
    opn: clamp(a.opn * (1 - w) + b.opn * w),
    con: clamp(a.con * (1 - w) + b.con * w),
    agr: clamp(a.agr * (1 - w) + b.agr * w),
    sta: clamp(a.sta * (1 - w) + b.sta * w),
    dom: clamp(a.dom * (1 - w) + b.dom * w),
    rec: clamp(a.rec * (1 - w) + b.rec * w),
    enr: clamp(a.enr * (1 - w) + b.enr * w),
  };
}

function bigFiveToAxes(scores: BigFiveScores): Axes {
  const sta = clamp(100 - scores.neuroticism);
  return {
    opn: scores.openness,
    con: scores.conscientiousness,
    ext: scores.extraversion,
    agr: scores.agreeableness,
    sta,
    dom: clamp(scores.extraversion * 0.45 + scores.conscientiousness * 0.35 + (100 - sta) * 0.2),
    rec: clamp(scores.extraversion * 0.55 + (100 - sta) * 0.25),
    enr: clamp(scores.extraversion * 0.5 + sta * 0.35 + scores.openness * 0.15),
  };
}

export function buildAxesFromDemo(state: PersonalityDemoState): Axes | null {
  if (!state.bigFive) return null;
  const fromBf = bigFiveToAxes(state.bigFive);
  if (!state.radicalId) return fromBf;
  return blendAxes(fromBf, getRadicalById(state.radicalId).axes, 0.5);
}

export function isLayerUnlocked(state: PersonalityDemoState, layer: ProfileLayerId): boolean {
  switch (layer) {
    case "traits":
      return state.bigFive !== null;
    case "radicals":
      return state.radicalId !== null;
    case "cognitive":
      return state.completedQuests.includes("cognitive_intro");
    case "state":
      return state.checkins.length > 0;
    case "roles":
      return state.completedQuests.includes("social_flashmob");
    default:
      return false;
  }
}

export function profileProgressPercent(state: PersonalityDemoState): number {
  const layers: ProfileLayerId[] = ["traits", "radicals", "cognitive", "state", "roles"];
  const unlocked = layers.filter((l) => isLayerUnlocked(state, l)).length;
  return Math.round((unlocked / layers.length) * 100);
}

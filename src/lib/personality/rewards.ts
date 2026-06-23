import type { PersonalityDemoState } from "@/lib/personality/demo-state";
import type { ItemId } from "@/lib/personality/model";
import type { ProfileLayerId } from "@/lib/personality/layers";

export type RewardId =
  | "badge_bigfive"
  | "badge_radicals"
  | "badge_checkin"
  | "badge_social"
  | "badge_philosopher"
  | "artifact_plato"
  | "artifact_aristotle"
  | "artifact_stoic";

export type RewardKind = "badge" | "artifact";

export type RewardDef = {
  id: RewardId;
  kind: RewardKind;
  artifactId?: ItemId;
};

export const REWARDS: RewardDef[] = [
  { id: "badge_bigfive", kind: "badge" },
  { id: "badge_radicals", kind: "badge" },
  { id: "badge_checkin", kind: "badge" },
  { id: "badge_social", kind: "badge" },
  { id: "badge_philosopher", kind: "badge" },
  { id: "artifact_plato", kind: "artifact", artifactId: "plato" },
  { id: "artifact_aristotle", kind: "artifact", artifactId: "aristotle" },
  { id: "artifact_stoic", kind: "artifact", artifactId: "stoic" },
];

export type QuestId =
  | "traits_intro"
  | "radicals_lesson"
  | "cognitive_intro"
  | "social_flashmob";

export type QuestDef = {
  id: QuestId;
  layer: ProfileLayerId;
  requires: QuestId[];
  requiresBigFive?: boolean;
  requiresRadicals?: boolean;
  rewardIds: RewardId[];
};

export const QUESTS: QuestDef[] = [
  {
    id: "traits_intro",
    layer: "traits",
    requires: [],
    requiresBigFive: true,
    rewardIds: ["badge_bigfive"],
  },
  {
    id: "radicals_lesson",
    layer: "radicals",
    requires: ["traits_intro"],
    requiresRadicals: true,
    rewardIds: ["badge_radicals", "artifact_plato"],
  },
  {
    id: "cognitive_intro",
    layer: "cognitive",
    requires: ["radicals_lesson"],
    rewardIds: ["badge_philosopher", "artifact_aristotle"],
  },
  {
    id: "social_flashmob",
    layer: "roles",
    requires: ["radicals_lesson"],
    rewardIds: ["badge_social", "artifact_stoic"],
  },
];

export function isQuestAvailable(state: PersonalityDemoState, quest: QuestDef): boolean {
  if (state.completedQuests.includes(quest.id)) return false;
  if (quest.requiresBigFive && !state.bigFive) return false;
  if (quest.requiresRadicals && !state.radicalId) return false;
  return quest.requires.every((id) => state.completedQuests.includes(id));
}

export function isQuestCompleted(state: PersonalityDemoState, questId: QuestId): boolean {
  return state.completedQuests.includes(questId);
}

export function completeQuest(state: PersonalityDemoState, questId: QuestId): PersonalityDemoState {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest || !isQuestAvailable(state, quest)) return state;

  const unlocked = new Set(state.unlockedRewards);
  for (const rewardId of quest.rewardIds) unlocked.add(rewardId);

  let equippedArtifact = state.equippedArtifact;
  const artifactReward = quest.rewardIds
    .map((id) => REWARDS.find((r) => r.id === id))
    .find((r) => r?.kind === "artifact");
  if (artifactReward?.artifactId) {
    equippedArtifact = artifactReward.artifactId;
  }

  return {
    ...state,
    completedQuests: [...state.completedQuests, questId],
    unlockedRewards: [...unlocked],
    equippedArtifact,
  };
}

export function applyAutomaticRewards(state: PersonalityDemoState): PersonalityDemoState {
  const unlocked = new Set(state.unlockedRewards);
  if (state.bigFive) unlocked.add("badge_bigfive");
  if (state.radicalId) unlocked.add("badge_radicals");
  if (state.checkins.length > 0) unlocked.add("badge_checkin");
  return { ...state, unlockedRewards: [...unlocked] };
}

export function isRewardUnlocked(state: PersonalityDemoState, rewardId: RewardId): boolean {
  return state.unlockedRewards.includes(rewardId);
}

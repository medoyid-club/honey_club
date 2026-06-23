export type ProfileLayerId = "traits" | "radicals" | "cognitive" | "state" | "roles";

export const PROFILE_LAYERS: {
  id: ProfileLayerId;
  speed: "slow" | "medium" | "fast";
}[] = [
  { id: "traits", speed: "slow" },
  { id: "radicals", speed: "medium" },
  { id: "cognitive", speed: "medium" },
  { id: "state", speed: "fast" },
  { id: "roles", speed: "fast" },
];

export type ParticleLayerId =
  | "quarks"
  | "leptons"
  | "bosons"
  | "fields"
  | "darkMatter"
  | "time";

export const PARTICLE_LAYERS: ParticleLayerId[] = [
  "quarks",
  "leptons",
  "bosons",
  "fields",
  "darkMatter",
  "time",
];

export const PIPELINE_LAYER_IDS = [
  "typology",
  "stats",
  "synergy",
  "context",
  "progression",
  "game",
] as const;

export type PipelineLayerId = (typeof PIPELINE_LAYER_IDS)[number];

export const LIVE_PIPELINE_LAYERS: PipelineLayerId[] = ["stats", "synergy"];

export const HORIZON_IDS = ["learning", "edges", "teams", "events"] as const;

export type HorizonId = (typeof HORIZON_IDS)[number];

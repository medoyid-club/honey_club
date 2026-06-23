import { clamp } from "@/lib/personality/model";
import type { RadicalId } from "@/lib/personality/model";

export type BigFiveTrait =
  | "openness"
  | "conscientiousness"
  | "extraversion"
  | "agreeableness"
  | "neuroticism";

export type BigFiveScores = Record<BigFiveTrait, number>;

export type LikertAnswer = 1 | 2 | 3 | 4 | 5;

export const BIG_FIVE_QUESTION_IDS = [
  "bf_ext_1",
  "bf_ext_2",
  "bf_opn_1",
  "bf_opn_2",
  "bf_con_1",
  "bf_con_2",
  "bf_agr_1",
  "bf_agr_2",
  "bf_neu_1",
  "bf_neu_2",
] as const;

export type BigFiveQuestionId = (typeof BIG_FIVE_QUESTION_IDS)[number];

type BigFiveQuestion = {
  id: BigFiveQuestionId;
  trait: BigFiveTrait;
  positive: boolean;
};

export const BIG_FIVE_QUESTIONS: BigFiveQuestion[] = [
  { id: "bf_ext_1", trait: "extraversion", positive: true },
  { id: "bf_ext_2", trait: "extraversion", positive: false },
  { id: "bf_opn_1", trait: "openness", positive: true },
  { id: "bf_opn_2", trait: "openness", positive: false },
  { id: "bf_con_1", trait: "conscientiousness", positive: true },
  { id: "bf_con_2", trait: "conscientiousness", positive: false },
  { id: "bf_agr_1", trait: "agreeableness", positive: true },
  { id: "bf_agr_2", trait: "agreeableness", positive: false },
  { id: "bf_neu_1", trait: "neuroticism", positive: true },
  { id: "bf_neu_2", trait: "neuroticism", positive: false },
];

export function scoreBigFive(answers: Partial<Record<BigFiveQuestionId, LikertAnswer>>): BigFiveScores {
  const buckets: Record<BigFiveTrait, number[]> = {
    openness: [],
    conscientiousness: [],
    extraversion: [],
    agreeableness: [],
    neuroticism: [],
  };

  for (const q of BIG_FIVE_QUESTIONS) {
    const raw = answers[q.id];
    if (!raw) continue;
    const value = q.positive ? raw : 6 - raw;
    buckets[q.trait].push(((value - 1) / 4) * 100);
  }

  const avg = (values: number[]) =>
    values.length ? clamp(values.reduce((s, v) => s + v, 0) / values.length) : 50;

  return {
    openness: avg(buckets.openness),
    conscientiousness: avg(buckets.conscientiousness),
    extraversion: avg(buckets.extraversion),
    agreeableness: avg(buckets.agreeableness),
    neuroticism: avg(buckets.neuroticism),
  };
}

export const RADICAL_QUESTION_IDS = [
  "rad_q1",
  "rad_q2",
  "rad_q3",
  "rad_q4",
  "rad_q5",
  "rad_q6",
  "rad_q7",
] as const;

export type RadicalQuestionId = (typeof RADICAL_QUESTION_IDS)[number];

type RadicalOption = {
  radical: RadicalId;
  weight: number;
};

export type RadicalQuestion = {
  id: RadicalQuestionId;
  options: RadicalOption[];
};

export const RADICAL_QUESTIONS: RadicalQuestion[] = [
  {
    id: "rad_q1",
    options: [
      { radical: "isteroid", weight: 3 },
      { radical: "gipertim", weight: 1 },
      { radical: "emotiv", weight: 1 },
    ],
  },
  {
    id: "rad_q2",
    options: [
      { radical: "gipertim", weight: 3 },
      { radical: "isteroid", weight: 1 },
      { radical: "paranoyal", weight: 1 },
    ],
  },
  {
    id: "rad_q3",
    options: [
      { radical: "shizoid", weight: 3 },
      { radical: "emotiv", weight: 1 },
      { radical: "trevozhny", weight: 1 },
    ],
  },
  {
    id: "rad_q4",
    options: [
      { radical: "epileptoid", weight: 3 },
      { radical: "paranoyal", weight: 1 },
      { radical: "trevozhny", weight: 1 },
    ],
  },
  {
    id: "rad_q5",
    options: [
      { radical: "paranoyal", weight: 3 },
      { radical: "epileptoid", weight: 1 },
      { radical: "gipertim", weight: 1 },
    ],
  },
  {
    id: "rad_q6",
    options: [
      { radical: "emotiv", weight: 3 },
      { radical: "trevozhny", weight: 1 },
      { radical: "shizoid", weight: 1 },
    ],
  },
  {
    id: "rad_q7",
    options: [
      { radical: "trevozhny", weight: 3 },
      { radical: "epileptoid", weight: 1 },
      { radical: "emotiv", weight: 1 },
    ],
  },
];

export function scoreRadical(
  answers: Partial<Record<RadicalQuestionId, RadicalId>>
): RadicalId {
  const totals = new Map<RadicalId, number>();

  for (const q of RADICAL_QUESTIONS) {
    const picked = answers[q.id];
    if (!picked) continue;
    const opt = q.options.find((o) => o.radical === picked);
    if (!opt) continue;
    totals.set(picked, (totals.get(picked) ?? 0) + opt.weight);
  }

  let best: RadicalId = "gipertim";
  let bestScore = -1;
  for (const [id, score] of totals) {
    if (score > bestScore) {
      best = id;
      bestScore = score;
    }
  }
  return best;
}

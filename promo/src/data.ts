import { colors } from "./theme";

// Real numbers from bench/results/latest.json (commit-message category,
// claude-sonnet-4-6, median of 3 trials).
export type Contender = {
  id: string;
  medianS: number;
  quality: number;
  costUsd: number;
  triggerRate: number;
  color: string;
  badge: string;
};

export const contenders: Contender[] = [
  {
    id: "smart-commit",
    medianS: 16.7,
    quality: 0.75,
    costUsd: 0.0736,
    triggerRate: 0,
    color: colors.cyan,
    badge: "FASTEST",
  },
  {
    id: "baseline",
    medianS: 20.3,
    quality: 0.75,
    costUsd: 0.0781,
    triggerRate: 0,
    color: colors.dim,
    badge: "CONTROL",
  },
  {
    id: "commit-message-generator",
    medianS: 21.3,
    quality: 1,
    costUsd: 0.0826,
    triggerRate: 0,
    color: colors.green,
    badge: "BEST VALUE",
  },
  {
    id: "commit-message",
    medianS: 28.2,
    quality: 1,
    costUsd: 0.1006,
    triggerRate: 1,
    color: colors.pink,
    badge: "TOP QUALITY",
  },
];

export const slowestMedianS = Math.max(...contenders.map((c) => c.medianS));

// Same category raced via `codex exec` (bench/run.ts --agent codex,
// ChatGPT-subscription auth). Medians of 3 trials, June 2026.
export const codexResults: Record<string, { medianS: number; quality: number }> = {
  "smart-commit": { medianS: 40.7, quality: 1 },
  baseline: { medianS: 42.1, quality: 0.75 },
  "commit-message-generator": { medianS: 44.3, quality: 1 },
  "commit-message": { medianS: 45.9, quality: 1 },
};

export const byQuality = [...contenders].sort(
  (a, b) => b.quality - a.quality || a.costUsd - b.costUsd,
);

export const bySpeed = [...contenders].sort((a, b) => a.medianS - b.medianS);

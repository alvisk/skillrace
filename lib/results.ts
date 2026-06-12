import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const RESULTS_DIR = path.join(process.cwd(), "bench", "results");

export type SkillSummary = {
  skillId: string;
  trials: number;
  errors: number;
  medianDurationS: number | null;
  medianTurns: number | null;
  medianCostUsd: number | null;
  medianOutputTokens: number | null;
  triggerRate: number | null;
  medianQuality: number | null;
};

export type TrialChecks = {
  artifactExists: boolean;
  conventionalFormat: boolean;
  keywordCoverage: number;
  didNotCommit: boolean;
  quality: number;
};

export type TrialResult = {
  skillId: string;
  trial: number;
  ok: boolean;
  error?: string;
  durationMs?: number;
  numTurns?: number;
  toolCalls?: number;
  skillInvoked?: boolean;
  costUsd?: number;
  inputTokens?: number;
  outputTokens?: number;
  checks?: TrialChecks;
  artifactText?: string;
};

export type RaceResults = {
  category: string;
  generatedAt: string;
  model: string;
  trialsPerSkill: number;
  summary: SkillSummary[];
  trials: TrialResult[];
};

/** Category ids that have at least one results file on disk. */
export const categoriesWithResults = async (): Promise<string[]> => {
  const files = await readdir(RESULTS_DIR).catch(() => [] as string[]);
  const ids = files
    .map((f) => /^(.+)-\d+\.json$/.exec(f)?.[1])
    .filter((id): id is string => Boolean(id));
  return [...new Set(ids)];
};

/** Newest results file for a category, or null if it has never been raced. */
export const loadResults = async (categoryId: string): Promise<RaceResults | null> => {
  const files = (await readdir(RESULTS_DIR).catch(() => [] as string[]))
    .filter((f) => new RegExp(`^${categoryId}-\\d+\\.json$`).test(f))
    .sort()
    .reverse();
  if (files.length === 0) return null;
  const raw = await readFile(path.join(RESULTS_DIR, files[0]), "utf8");
  return JSON.parse(raw);
};

import type { RaceResults, SkillSummary, TrialResult } from "./results";

export type CheckRates = {
  artifact: number;
  format: number;
  keywords: number;
  noCommit: number;
};

export type ContenderBreakdown = {
  skillId: string;
  control: boolean;
  place: number;
  qualityRank: number;
  medianDurationS: number | null;
  medianCostUsd: number | null;
  medianTurns: number | null;
  medianOutputTokens: number | null;
  triggerRate: number | null;
  medianQuality: number | null;
  trials: number;
  errors: number;
  checkRates: CheckRates;
  sampleFirstLine: string | null;
  pareto: boolean;
  badges: string[];
};

export type Breakdown = {
  contenders: ContenderBreakdown[];
  insights: string[];
};

const okTrialsFor = (trials: TrialResult[], skillId: string) =>
  trials.filter((t) => t.skillId === skillId && t.ok && t.checks);

const passRate = (trials: TrialResult[], pick: (c: NonNullable<TrialResult["checks"]>) => boolean) =>
  trials.length === 0 ? 0 : trials.filter((t) => pick(t.checks!)).length / trials.length;

const isParetoOptimal = (s: SkillSummary, all: SkillSummary[]): boolean =>
  !all.some(
    (o) =>
      o.skillId !== s.skillId &&
      (o.medianQuality ?? 0) >= (s.medianQuality ?? 0) &&
      (o.medianDurationS ?? Infinity) <= (s.medianDurationS ?? Infinity) &&
      ((o.medianQuality ?? 0) > (s.medianQuality ?? 0) ||
        (o.medianDurationS ?? Infinity) < (s.medianDurationS ?? Infinity)),
  );

export const buildBreakdown = (results: RaceResults): Breakdown => {
  const { summary, trials } = results;
  const byDuration = [...summary].sort(
    (a, b) => (a.medianDurationS ?? Infinity) - (b.medianDurationS ?? Infinity),
  );
  const byQuality = [...summary].sort((a, b) => (b.medianQuality ?? 0) - (a.medianQuality ?? 0));
  const baseline = summary.find((s) => s.skillId === "baseline") ?? null;

  const minCost = Math.min(...summary.map((s) => s.medianCostUsd ?? Infinity));
  const bestValue = [...summary].sort(
    (a, b) =>
      (b.medianQuality ?? 0) / (b.medianCostUsd ?? Infinity) -
      (a.medianQuality ?? 0) / (a.medianCostUsd ?? Infinity),
  )[0];

  const contenders: ContenderBreakdown[] = summary.map((s) => {
    const ok = okTrialsFor(trials, s.skillId);
    const control = s.skillId === "baseline";
    const passive =
      !control &&
      (s.triggerRate ?? 0) === 0 &&
      baseline !== null &&
      (s.medianQuality ?? 0) > (baseline.medianQuality ?? 0);

    const badges: string[] = [];
    if (byDuration[0]?.skillId === s.skillId) badges.push("FASTEST");
    if ((s.medianQuality ?? 0) === (byQuality[0]?.medianQuality ?? 0)) badges.push("TOP QUALITY");
    if (Number.isFinite(minCost) && (s.medianCostUsd ?? Infinity) === minCost) badges.push("CHEAPEST");
    if (bestValue?.skillId === s.skillId && bestValue.medianCostUsd != null) badges.push("BEST VALUE");
    if (passive) badges.push("PASSIVE BOOST");
    if (control) badges.push("CONTROL");

    return {
      skillId: s.skillId,
      control,
      place: byDuration.findIndex((d) => d.skillId === s.skillId) + 1,
      qualityRank: byQuality.findIndex((d) => d.skillId === s.skillId) + 1,
      medianDurationS: s.medianDurationS,
      medianCostUsd: s.medianCostUsd,
      medianTurns: s.medianTurns,
      medianOutputTokens: s.medianOutputTokens,
      triggerRate: s.triggerRate,
      medianQuality: s.medianQuality,
      trials: s.trials,
      errors: s.errors,
      checkRates: {
        artifact: passRate(ok, (c) => c.artifactExists),
        format: passRate(ok, (c) => c.conventionalFormat),
        keywords:
          ok.length === 0
            ? 0
            : ok.reduce((sum, t) => sum + (t.checks?.keywordCoverage ?? 0), 0) / ok.length,
        noCommit: passRate(ok, (c) => c.didNotCommit),
      },
      sampleFirstLine: ok[0]?.artifactText?.split("\n")[0] ?? null,
      pareto: isParetoOptimal(s, summary),
      badges,
    };
  });

  const insights: string[] = [];
  const fastest = byDuration[0];
  const topQ = byQuality[0];

  if (fastest && topQ && fastest.skillId !== topQ.skillId) {
    insights.push(
      `${fastest.skillId} took P1 at ${fastest.medianDurationS}s, but ${topQ.skillId} won on quality (${topQ.medianQuality}) — speed and quality diverge here.`,
    );
  }

  const passive = contenders.find((c) => c.badges.includes("PASSIVE BOOST"));
  if (passive) {
    insights.push(
      `${passive.skillId} beat the baseline without ever invoking its skill (0% trigger) — the in-context description alone steered the model.`,
    );
  }

  const topQualityValue = topQ?.medianQuality ?? 0;
  const topTier = summary.filter((s) => (s.medianQuality ?? 0) === topQualityValue);
  if (topTier.length > 1) {
    const sortedByCost = [...topTier].sort(
      (a, b) => (a.medianCostUsd ?? Infinity) - (b.medianCostUsd ?? Infinity),
    );
    const cheap = sortedByCost[0];
    const dear = sortedByCost[sortedByCost.length - 1];
    if (cheap.skillId !== dear.skillId && cheap.medianCostUsd && dear.medianCostUsd) {
      insights.push(
        `${cheap.skillId} matched ${dear.skillId}'s quality at ${Math.round((cheap.medianCostUsd / dear.medianCostUsd) * 100)}% of the cost and ${Math.round(((cheap.medianDurationS ?? 0) / (dear.medianDurationS ?? 1)) * 100)}% of the time.`,
      );
    }
  }

  if (baseline) {
    const duds = contenders.filter(
      (c) => !c.control && (c.medianQuality ?? 0) <= (baseline.medianQuality ?? 0),
    );
    if (duds.length > 0) {
      insights.push(
        `${duds.map((d) => d.skillId).join(", ")} did not beat the no-skill baseline — pure overhead in this category.`,
      );
    }
  }

  return { contenders, insights };
};

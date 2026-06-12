#!/usr/bin/env node
/**
 * SkillRace local runner (hour-0 MVP).
 *
 * Races every skill in a roster category (plus the no-skill baseline) against
 * the same fixture, in isolated temp dirs, via a headless agent CLI — Claude
 * Code (`claude -p`) or OpenAI Codex (`codex exec`, ChatGPT auth). Speed
 * metrics come from the CLIs' JSON telemetry; quality is scored with the
 * category's deterministic checks. Results land in bench/results/.
 *
 * Usage:
 *   node bench/run.ts [category] [--agent claude|codex] [--trials N]
 *                     [--skills a,b] [--model m] [--concurrency N] [--keep]
 *
 * Hermetic trials:
 *   claude → --setting-sources project + --strict-mcp-config (only the
 *            candidate skill in .claude/skills + CLI built-ins load)
 *   codex  → fresh CODEX_HOME/HOME with auth.json copied in (only the
 *            candidate skill in .agents/skills + CLI built-ins load)
 *
 * NOTE: skills run with broad tool permissions in the trial dir — local mode
 * trusts the roster. Untrusted-skill isolation is the Vercel Sandbox step.
 */
import { execFile as execFileCb } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCb);

const BENCH_DIR = path.dirname(fileURLToPath(import.meta.url));
const SKILL_CACHE = path.join(BENCH_DIR, ".skill-cache");
const RESULTS_DIR = path.join(BENCH_DIR, "results");
const EMPTY_MCP_CONFIG = path.join(tmpdir(), "skillrace-empty-mcp.json");
const CLAUDE_ALLOWED_TOOLS = "Bash,Read,Write,Edit,Glob,Grep,Skill,TodoWrite";
const TRIAL_TIMEOUT_MS = 300_000;
const MAX_TURNS = 25;
const CONVENTIONAL_RE =
  /^(feat|fix|docs|chore|refactor|perf|test|build|ci|style|revert)(\([^)]+\))?!?: .+/;

type AgentKind = "claude" | "codex";

/** Where each agent CLI discovers project-level skills. */
const SKILL_DEST: Record<AgentKind, string> = {
  claude: ".claude/skills",
  codex: ".agents/skills",
};

type SkillEntry = {
  id: string;
  install: string | null;
  control?: boolean;
  note?: string;
};

type Category = {
  id: string;
  name: string;
  taskPrompt: string;
  fixture: { type: string; path: string; expectedKeywords?: string[] };
  artifacts: string[];
  skills: SkillEntry[];
};

type Roster = { trialsPerSkill: number; categories: Category[] };

type Checks = {
  artifactExists: boolean;
  conventionalFormat: boolean;
  keywordCoverage: number;
  didNotCommit: boolean;
  quality: number;
};

type RunOutcome = {
  ok: boolean;
  error?: string;
  model?: string;
  durationMs?: number;
  apiDurationMs?: number;
  numTurns?: number;
  toolCalls?: number;
  skillInvoked?: boolean;
  costUsd?: number;
  inputTokens?: number;
  outputTokens?: number;
};

type TrialResult = RunOutcome & {
  skillId: string;
  trial: number;
  checks?: Checks;
  artifactText?: string;
};

type CliArgs = {
  categoryId: string;
  agent: AgentKind;
  trials?: number;
  skills?: string[];
  model?: string;
  concurrency: number;
  keep: boolean;
};

const parseArgs = (argv: string[]): CliArgs => {
  const flagValue = (name: string): string | undefined => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const positional = argv.filter((a, i) => !a.startsWith("--") && !argv[i - 1]?.startsWith("--"));
  const agent = (flagValue("--agent") ?? "claude") as AgentKind;
  if (agent !== "claude" && agent !== "codex") throw new Error(`unknown agent: ${agent}`);
  return {
    categoryId: positional[0] ?? "commit-message",
    agent,
    trials: flagValue("--trials") ? Number(flagValue("--trials")) : undefined,
    skills: flagValue("--skills")?.split(","),
    model: flagValue("--model"),
    concurrency: flagValue("--concurrency") ? Number(flagValue("--concurrency")) : 3,
    keep: argv.includes("--keep"),
  };
};

const git = (cwd: string, ...args: string[]) =>
  execFile("git", ["-c", "user.email=bench@skillrace.dev", "-c", "user.name=SkillRace", ...args], { cwd });

const ensureSkillCached = async (skill: SkillEntry): Promise<string | null> => {
  if (!skill.install) return null;
  const target = path.join(SKILL_CACHE, skill.id);
  const cached = await readdir(target).catch(() => null);
  if (cached && cached.length > 0) return target;

  console.log(`  installing ${skill.install} ...`);
  const work = await mkdtemp(path.join(tmpdir(), "skillrace-install-"));
  await execFile("npx", ["-y", "skills", "add", skill.install, "-y"], {
    cwd: work,
    timeout: 180_000,
  });
  for (const root of [".agents/skills", ".claude/skills"]) {
    const entries = await readdir(path.join(work, root)).catch(() => [] as string[]);
    if (entries.length > 0) {
      await mkdir(SKILL_CACHE, { recursive: true });
      await cp(path.join(work, root, entries[0]), target, { recursive: true });
      await rm(work, { recursive: true, force: true });
      return target;
    }
  }
  throw new Error(`skills add produced no skill directory for ${skill.install}`);
};

const setupTrialDir = async (
  fixtureDir: string,
  cachedSkillDir: string | null,
  skillDest: string,
): Promise<string> => {
  const dir = await mkdtemp(path.join(tmpdir(), "skillrace-trial-"));
  await cp(path.join(fixtureDir, "base"), dir, { recursive: true });
  await git(dir, "init", "-q");
  await git(dir, "add", "-A");
  await git(dir, "commit", "-qm", "initial commit");
  await cp(path.join(fixtureDir, "changes"), dir, { recursive: true, force: true });
  await git(dir, "add", "-A");
  if (cachedSkillDir) {
    const dest = path.join(dir, skillDest, path.basename(cachedSkillDir));
    await cp(cachedSkillDir, dest, { recursive: true });
  }
  return dir;
};

type StreamEvent = Record<string, any>;

const parseJsonl = (stdout: string): StreamEvent[] =>
  stdout
    .split("\n")
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)];
      } catch {
        return [];
      }
    });

/* ---------------- Claude Code backend ---------------- */

const runClaude = async (dir: string, prompt: string, model?: string): Promise<RunOutcome> => {
  const args = [
    "-p", prompt,
    "--output-format", "stream-json",
    "--verbose",
    "--allowedTools", CLAUDE_ALLOWED_TOOLS,
    "--max-turns", String(MAX_TURNS),
    // Hermetic-ish trials: only project-level skills (the candidate) plus CLI
    // built-ins load; user/plugin skills and MCP servers are excluded.
    "--setting-sources", "project",
    "--strict-mcp-config",
    "--mcp-config", EMPTY_MCP_CONFIG,
  ];
  if (model) args.push("--model", model);
  const { stdout } = await execFile("claude", args, {
    cwd: dir,
    timeout: TRIAL_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
  });
  const events = parseJsonl(stdout);
  const result = events.find((e) => e.type === "result");
  if (!result || result.is_error) {
    return { ok: false, error: result?.result ?? "no result event" };
  }
  const init = events.find((e) => e.type === "system" && e.subtype === "init");
  const toolUses = events
    .filter((e) => e.type === "assistant")
    .flatMap((e) => e.message?.content ?? [])
    .filter((b: StreamEvent) => b.type === "tool_use");
  return {
    ok: true,
    model: init?.model,
    durationMs: result.duration_ms,
    apiDurationMs: result.duration_api_ms,
    numTurns: result.num_turns,
    toolCalls: toolUses.length,
    skillInvoked: toolUses.some((b: StreamEvent) => b.name === "Skill"),
    costUsd: result.total_cost_usd,
    inputTokens: result.usage?.input_tokens,
    outputTokens: result.usage?.output_tokens,
  };
};

/* ---------------- OpenAI Codex backend ---------------- */

/** Fresh HOME/CODEX_HOME with only auth copied in — drops user skills/config. */
const prepareCodexHome = async (): Promise<string> => {
  const home = await mkdtemp(path.join(tmpdir(), "skillrace-codex-home-"));
  await cp(path.join(homedir(), ".codex", "auth.json"), path.join(home, "auth.json"));
  return home;
};

const runCodex = async (
  dir: string,
  prompt: string,
  model: string | undefined,
  codexHome: string,
): Promise<RunOutcome> => {
  // Fresh CODEX_HOME has no trust store; trial dirs are throwaway git repos.
  const args = ["exec", "--json", "--sandbox", "workspace-write", "--skip-git-repo-check"];
  if (model) args.push("-m", model);
  args.push(prompt);
  const t0 = performance.now();
  const pending = execFile("codex", args, {
    cwd: dir,
    timeout: TRIAL_TIMEOUT_MS,
    maxBuffer: 64 * 1024 * 1024,
    env: { ...process.env, HOME: codexHome, CODEX_HOME: codexHome },
  });
  // codex exec reads stdin when it isn't a TTY and blocks until EOF — close it
  pending.child.stdin?.end();
  const { stdout } = await pending;
  const wallMs = performance.now() - t0;

  const events = parseJsonl(stdout);
  const turns = events.filter((e) => e.type === "turn.completed");
  if (turns.length === 0) {
    const failed = events.find((e) => e.type === "turn.failed" || e.type === "error");
    return { ok: false, error: JSON.stringify(failed ?? "no turn.completed event").slice(0, 500) };
  }

  const items = events
    .filter((e) => e.type === "item.completed")
    .map((e) => e.item as StreamEvent)
    .filter(Boolean);
  const toolItems = items.filter((i) => i.type !== "agent_message" && i.type !== "reasoning");
  const usage = turns.reduce(
    (acc, e) => ({
      input: acc.input + (e.usage?.input_tokens ?? 0),
      output: acc.output + (e.usage?.output_tokens ?? 0),
    }),
    { input: 0, output: 0 },
  );

  return {
    ok: true,
    model: model ? `codex:${model}` : "codex:default",
    durationMs: Math.round(wallMs),
    numTurns: turns.length,
    toolCalls: toolItems.length,
    // Codex reads SKILL.md from .agents/skills when it engages a skill
    skillInvoked: toolItems.some((i) => {
      const raw = JSON.stringify(i);
      return raw.includes("SKILL.md") || raw.includes(".agents/skills");
    }),
    costUsd: undefined, // ChatGPT-subscription auth: no per-run dollar cost
    inputTokens: usage.input,
    outputTokens: usage.output,
  };
};

/* ---------------- checks, pooling, summary ---------------- */

const runChecks = async (dir: string, category: Category): Promise<Checks & { artifactText?: string }> => {
  const text = await readFile(path.join(dir, category.artifacts[0]), "utf8").catch(() => null);
  const artifactExists = text !== null && text.trim().length > 0;
  const firstLine = text?.trim().split("\n")[0] ?? "";
  const conventionalFormat = CONVENTIONAL_RE.test(firstLine);
  const keywords = category.fixture.expectedKeywords ?? [];
  const matched = keywords.filter((k) => new RegExp(k, "i").test(text ?? ""));
  const keywordCoverage = keywords.length ? matched.length / keywords.length : 1;
  const commits = await git(dir, "rev-list", "--count", "HEAD");
  const didNotCommit = Number(commits.stdout.trim()) === 1;
  const quality = !artifactExists
    ? 0
    : 0.25 +
      (conventionalFormat ? 0.25 : 0) +
      0.35 * keywordCoverage +
      (didNotCommit ? 0.15 : 0);
  return {
    artifactExists,
    conventionalFormat,
    keywordCoverage: Number(keywordCoverage.toFixed(2)),
    didNotCommit,
    quality: Number(quality.toFixed(2)),
    artifactText: text?.trim().slice(0, 2000) ?? undefined,
  };
};

const runTrial = async (
  category: Category,
  fixtureDir: string,
  skill: SkillEntry,
  cachedSkillDir: string | null,
  trial: number,
  args: CliArgs,
  codexHome: string | null,
): Promise<TrialResult> => {
  const dir = await setupTrialDir(fixtureDir, cachedSkillDir, SKILL_DEST[args.agent]);
  try {
    const outcome =
      args.agent === "codex"
        ? await runCodex(dir, category.taskPrompt, args.model, codexHome!)
        : await runClaude(dir, category.taskPrompt, args.model);
    if (!outcome.ok) return { ...outcome, skillId: skill.id, trial };
    const { artifactText, ...checks } = await runChecks(dir, category);
    return { ...outcome, skillId: skill.id, trial, checks, artifactText };
  } catch (err) {
    return { skillId: skill.id, trial, ok: false, error: String(err).slice(0, 500) };
  } finally {
    if (!args.keep) await rm(dir, { recursive: true, force: true });
    else console.log(`  kept trial dir: ${dir}`);
  }
};

const runPool = async <T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> => {
  const results: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

const median = (xs: number[]): number | null => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
};

const summarize = (skillId: string, trials: TrialResult[]) => {
  const ok = trials.filter((t) => t.ok);
  const med = (pick: (t: TrialResult) => number | undefined) =>
    median(ok.map(pick).filter((v): v is number => v !== undefined));
  const medDuration = med((t) => t.durationMs);
  const medCost = med((t) => t.costUsd);
  return {
    skillId,
    trials: trials.length,
    errors: trials.length - ok.length,
    medianDurationS: medDuration !== null ? Number((medDuration / 1000).toFixed(1)) : null,
    medianTurns: med((t) => t.numTurns),
    medianCostUsd: medCost !== null ? Number(medCost.toFixed(4)) : null,
    medianOutputTokens: med((t) => t.outputTokens),
    triggerRate: ok.length ? Number((ok.filter((t) => t.skillInvoked).length / ok.length).toFixed(2)) : null,
    medianQuality: med((t) => t.checks?.quality),
  };
};

const main = async () => {
  const args = parseArgs(process.argv.slice(2));
  await writeFile(EMPTY_MCP_CONFIG, JSON.stringify({ mcpServers: {} }));
  const roster: Roster = JSON.parse(await readFile(path.join(BENCH_DIR, "roster.json"), "utf8"));
  const category = roster.categories.find((c) => c.id === args.categoryId);
  if (!category) throw new Error(`unknown category: ${args.categoryId}`);

  const skills = category.skills.filter((s) => !args.skills || args.skills.includes(s.id));
  const trialsPerSkill = args.trials ?? roster.trialsPerSkill;
  const fixtureDir = path.join(BENCH_DIR, "..", category.fixture.path);
  const codexHome = args.agent === "codex" ? await prepareCodexHome() : null;

  console.log(
    `SkillRace: ${category.name} — ${skills.length} contenders × ${trialsPerSkill} trials (agent: ${args.agent})\n`,
  );

  console.log("Preparing skill cache:");
  const cacheDirs = new Map<string, string | null>();
  for (const skill of skills) cacheDirs.set(skill.id, await ensureSkillCached(skill));

  const jobs = skills.flatMap((skill) =>
    Array.from({ length: trialsPerSkill }, (_, i) => ({ skill, trial: i + 1 })),
  );

  console.log(`\nRunning ${jobs.length} trials (concurrency ${args.concurrency}):`);
  const trials = await runPool(jobs, args.concurrency, async ({ skill, trial }) => {
    const result = await runTrial(
      category, fixtureDir, skill, cacheDirs.get(skill.id) ?? null, trial, args, codexHome,
    );
    const status = result.ok
      ? `${(result.durationMs! / 1000).toFixed(1)}s, quality ${result.checks?.quality}`
      : `ERROR: ${result.error}`;
    console.log(`  ${skill.id} #${trial}: ${status}`);
    return result;
  });

  const summaries = skills
    .map((s) => summarize(s.id, trials.filter((t) => t.skillId === s.id)))
    .sort((a, b) =>
      (b.medianQuality ?? -1) - (a.medianQuality ?? -1) ||
      (a.medianDurationS ?? Infinity) - (b.medianDurationS ?? Infinity),
    );

  const output = {
    category: category.id,
    agent: args.agent,
    generatedAt: new Date().toISOString(),
    model:
      args.agent === "codex"
        ? `codex:${args.model ?? "default"} (chatgpt auth)`
        : (args.model ?? trials.find((t) => t.model)?.model ?? "default"),
    trialsPerSkill,
    summary: summaries,
    trials,
  };
  await mkdir(RESULTS_DIR, { recursive: true });
  const outPath = path.join(RESULTS_DIR, `${category.id}-${Date.now()}.json`);
  await writeFile(outPath, JSON.stringify(output, null, 2));
  await writeFile(path.join(RESULTS_DIR, "latest.json"), JSON.stringify(output, null, 2));

  console.log("\nLeaderboard (quality desc, speed tiebreak):");
  console.table(summaries);
  console.log(`\nResults written to ${outPath}`);

  if (codexHome) await rm(codexHome, { recursive: true, force: true });
};

await main();

---
name: skill-race
description: A/B speed-test and rank competing agent skills on the same task. Use when the user wants to benchmark or race skills against each other (e.g. "/skill-race commit-message", "which changelog skill is fastest", "benchmark these skills"), compare skill speed/quality/cost, or add a new race category. Produces a leaderboard from real headless runs.
---

# SkillRace — race competing skills on the same task

Races every skill in a roster category (plus a no-skill **baseline** control)
against identical fixtures in isolated temp dirs, via a headless agent CLI.
Speed metrics (duration, turns, tokens, cost) come from the CLI's JSON
telemetry; quality comes from deterministic per-category checks. Output is a
leaderboard ranked by quality (speed as tiebreak).

All paths below are relative to this skill's directory.

## Requirements

- Node 24+ (`node bench/run.ts` relies on native TypeScript support)
- A logged-in agent CLI: `claude` (default) or `codex` (`--agent codex`)
- Network access on first run (`npx skills add` installs each contender)

## Run a race

```sh
node bench/run.ts <category> [--agent claude|codex] [--trials N]
                  [--skills a,b] [--model m] [--concurrency N] [--keep]
```

- Categories live in `bench/roster.json`. **`commit-message` is the
  ready-to-run category** (fixture bundled). `changelog`, `pdf-extraction`,
  and `readme` are defined in the roster but need their fixtures created
  first (see "Add a category").
- A full race is N skills × K trials (default 3) and takes several minutes.
  Tell the user this before starting, then run it in the background or with a
  generous timeout (each trial can take up to 5 minutes).
- Quick smoke test: `node bench/run.ts commit-message --skills baseline --trials 1`

⚠️ Trials execute third-party skills with broad tool permissions inside
throwaway temp dirs. The bundled roster is curated, but if the user adds
contenders, remind them that racing a skill means running its code.

## Read the results

Results land in `bench/results/latest.json` (and a timestamped copy) next to
the runner. After a race:

1. Read `latest.json` and present the `summary` array as a leaderboard table:
   skill, median duration, median quality, median cost, trigger rate, errors.
2. Call out the interesting findings, in this order of importance:
   - Did any contender **lose to the baseline** on quality? That skill is
     pure overhead — the headline finding.
   - `triggerRate` < 1.0 means the skill sometimes never fired; a skill only
     helps if the agent actually invokes it.
   - Speed-for-quality tradeoffs, e.g. "X matched Y's quality at 80% of the
     cost".
3. Per-trial details (including a 2000-char artifact sample) are in the
   `trials` array for drill-down.

## How a trial works (for debugging)

temp dir → fixture `base/` copied in, committed → `changes/` overlaid and
staged → exactly one contender skill placed in `.claude/skills/` (or
`.agents/skills/` for codex) → headless run with hermetic flags
(`--setting-sources project --strict-mcp-config`) so ONLY the candidate skill
loads — no user-level skills or MCP servers. The baseline gets no skill.
Without hermetic flags the benchmark is noise: every contender inherits the
user's skills and converges on identical output.

## Add contenders or categories

- **Contender**: find candidates with `npx skills find <topic>`, then add
  `{ "id": "...", "install": "owner/repo@skill-name" }` to the category's
  `skills` array in `bench/roster.json`.
- **Category**: add an entry to `roster.json` with a neutral `taskPrompt`
  (never name any skill — triggering is part of what's measured), a fixture
  directory containing `base/` (initial repo state) and `changes/` (overlaid
  + staged), an `artifacts` list (files the task must produce), and
  `expectedKeywords` for the deterministic quality check.

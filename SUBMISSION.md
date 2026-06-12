# SkillRace — hackathon submission draft

Paste-ready content for https://community.vercel.com/hackathons/built-in-london/submit

## Project name

SkillRace

## Tagline

A benchmark that races agent skills head-to-head on a 3D neon highway — speed × quality, with receipts.

## Form fields (paste-ready)

- **Project name**: SkillRace
- **Description**: skills.sh ranks agent skills by installs — nobody measures if a
  skill is actually fast or good. SkillRace installs competing skills and races them
  headlessly on OpenAI Codex (`codex exec --json`, hermetic fresh `CODEX_HOME`) against
  identical fixtures plus a no-skill control, scoring real telemetry (wall-clock,
  tokens, turns, trigger rate) and deterministic quality checks. The leaderboard is a
  3D synthwave race where each car's speed is its real median benchmark time. Headline
  finding: rankings flip between host agents — a skill that was pure overhead on Claude
  Code was the top performer on Codex. It's for skill authors and agent users, and is
  itself published as a skill: `npx skills add alvisk/skillrace`.
- **Public Deployed URL**: https://skillrace.vercel.app
- **GitHub**: https://github.com/alvisk/skillrace
- **YouTube**: upload `promo/out/skillrace-promo.mp4`, then paste the link
- **Technologies used**: Codex, Vercel, Next.js, react-three-fiber, Remotion,
  skills.sh CLI, Claude Code, TypeScript
- **Team members**: Alvis Kalarikkan

## Links

- Repo: https://github.com/alvisk/skillrace
- Demo: https://skillrace.vercel.app
- Registry: https://skills.sh/alvisk/skillrace/skill-race

## Description

skills.sh ranks agent skills by install count. Nobody measures whether a skill is
actually *fast* or *good*. SkillRace does: it installs competing skills from the open
skills ecosystem, runs each one in an isolated, hermetic trial against identical
fixtures (plus a no-skill control), and scores them on real telemetry — wall-clock,
tokens, turns, cost, trigger rate — and deterministic quality checks.

Then it renders the result as a synthwave race: every contender is a neon car whose
speed is its real median benchmark time. Press START and the benchmark replays at ×4 —
the finish order *is* the speed ranking, a drone camera flies the pack, and the finish
line drops a full RACE ANALYSIS: per-check pass rates, badges (FASTEST / TOP QUALITY /
BEST VALUE / PASSIVE BOOST), sample outputs, and auto-generated insights.

## What we found (real results, in the repo)

- **A skill can win without ever being invoked.** kanopi's commit-message skill hit
  top quality with a 0% trigger rate — its in-context description alone steered the
  model. The benchmark surfaces this as a PASSIVE BOOST badge.
- **Skill rankings are host-agent-dependent.** The same roster raced on Claude Code
  (Sonnet) and OpenAI Codex (`--agent codex`, ChatGPT auth): a skill that was pure
  overhead on Claude (never triggered, didn't beat baseline) was the top performer on
  Codex, where all skills triggered 100%. Install counts can't tell you this.
- **Hermetic trials are everything.** Before isolating trials (Claude:
  `--setting-sources project --strict-mcp-config`; Codex: fresh `CODEX_HOME`), ~60
  user-level skills leaked into context and all contenders tied — the benchmark
  measured noise.

## How it's built

- **Next.js (App Router)** — the leaderboard app; server components read live
  results from disk, category switching via search params.
- **react-three-fiber + bloom postprocessing** — the neon highway: drone flythrough
  camera (orbit → chase → victory lap), surge dynamics with a zero-sum envelope so
  the theatre never falsifies finish times.
- **Bench runner (dependency-free Node/TS)** — installs skills via `npx skills add`,
  isolates each trial in a temp git repo, drives `claude -p` / `codex exec` headless,
  parses their JSON telemetry, scores deterministic checks.
- **Playwright-driven development** — the UI's states (idle/race/finish/breakdown)
  were debugged with DOM assertions and screenshots, catching real bugs (label
  collisions, a panel intercepting sidebar clicks, a runaway clock).
- **Roadmap on the Vercel platform** — Vercel Sandbox for untrusted skill execution
  (skills ship arbitrary scripts), Workflow DevKit for durable multi-minute races,
  AI Gateway for a blind LLM-judge panel on subjective categories.

## Run it

```sh
npm install && npm run dev          # the neon highway on localhost:3000
node bench/run.ts commit-message    # race a category (Claude Code)
node bench/run.ts commit-message --agent codex   # same race on Codex
```

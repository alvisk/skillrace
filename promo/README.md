# SkillRace promo video

A ~43s promo for SkillRace built with [Remotion](https://remotion.dev). The race
scene replays the **real benchmark numbers** from `../bench/results/latest.json`
(commit-message category, median of 3 trials) — same honest-replay principle as
the main UI.

## Scenes

1. **Title** — neon flicker logo + tagline
2. **Problem** — installs ≠ fast, installs ≠ good
3. **How it works** — roster → isolated trials → blind judges → Pareto ranking
4. **The race** — four contenders, car speed = measured wall-clock (×5 compression)
5. **Race analysis** — quality/cost/speed leaderboard with badges
6. **Same race, different agent** — Claude Code vs Codex CLI side by side
   (`bench/run.ts --agent codex`; under Codex every skill triggered and beat
   the baseline, at ~2× Claude's wall-clock)
7. **Product shots** — the neon highway UI
8. **Outro** — `node bench/run.ts commit-message` + stack + CTA

## Commands

> The `:` in the repo directory name breaks npm/npx PATH injection, so call the
> local binaries through `node` directly.

```sh
npm install
node node_modules/.bin/remotion studio                                  # preview
node node_modules/.bin/remotion render SkillRacePromo out/skillrace-promo.mp4
node node_modules/typescript/bin/tsc --noEmit                           # type-check
```

Real data lives in `src/data.ts` — update it after a new benchmark run.

## Voiceover

Seven narration clips live in `public/voiceover/` and are sequenced per scene in
`src/Promo.tsx` (`VoiceoverTrack`).

The current clips are generated with **Microsoft Edge neural TTS**
(`uvx edge-tts`, voice `en-GB-SoniaNeural` — natural British female, free, no
API key). Regenerate a clip with:

```sh
uvx edge-tts --voice en-GB-SoniaNeural --text "..." --write-media public/voiceover/<scene>.mp3
```

Clip 02 uses `--rate=+12%` to fit its scene window. Keep each clip shorter than
the gap to the next clip's start (`sceneStarts` + 12 frames in `src/Promo.tsx`).

ElevenLabs was the original plan but the account is blocked for TTS on the free
tier ("unusual activity"). Once it's upgraded/unblocked, generate with ElevenLabs
instead and re-render:

```sh
ELEVENLABS_API_KEY=sk_... node --experimental-strip-types generate-voiceover.ts
node node_modules/.bin/remotion render SkillRacePromo out/skillrace-promo.mp4
```

Set `ELEVENLABS_VOICE_ID` to change the narrator (default: Charlie; the account
also has a custom "Alvis" voice: `rP1pthbcgSF3sFCwBYw2`). Keep each line within
its scene's `maxSeconds` noted in `generate-voiceover.ts`.

> More `:`-path fallout: Remotion's bundled ffmpeg can't load its dylibs from
> this directory (dyld paths are colon-delimited too). Use the system ffmpeg
> (`/opt/homebrew/bin/ffmpeg`) for any manual audio conversion.

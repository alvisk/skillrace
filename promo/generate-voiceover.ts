import { mkdirSync, writeFileSync } from "node:fs";

// Voice: "Alice - Clear, Engaging Educator" (British female).
// Swap VOICE_ID (e.g. rP1pthbcgSF3sFCwBYw2 = "Alvis") and re-run to change narrator.
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID ?? "Xb7hH8MSUJpSbSDYk0k2";

// Each line must fit inside its scene window in src/Promo.tsx (see maxSeconds).
const scenes = [
  {
    id: "01-title",
    maxSeconds: 4.2,
    text: "This is SkillRace — the speed test for agent skills.",
  },
  {
    id: "02-problem",
    maxSeconds: 4,
    text: "Registries rank by installs — not by what's fast, or good.",
  },
  {
    id: "03-how",
    maxSeconds: 7.5,
    text: "One task. Every skill. Each raced in an isolated sandbox, scored by blind judges.",
  },
  {
    id: "04-race",
    maxSeconds: 9,
    text: "Then the benchmark is replayed — for real. Car speed is measured wall-clock, so the finish order is the true speed ranking.",
  },
  {
    id: "05-leaderboard",
    maxSeconds: 6.5,
    text: "Quality, cost, and speed for every contender — with insights generated straight from the data.",
  },
  {
    id: "06-screens",
    maxSeconds: 6,
    text: "All of it on a neon highway leaderboard, built with Next.js.",
  },
  {
    id: "07-outro",
    maxSeconds: 5.5,
    text: "One command starts a race. SkillRace. Race your skills.",
  },
];

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  throw new Error("Set ELEVENLABS_API_KEY");
}

mkdirSync("public/voiceover", { recursive: true });

for (const scene of scenes) {
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: scene.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.4,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`${scene.id}: ${response.status} ${await response.text()}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  writeFileSync(`public/voiceover/${scene.id}.mp3`, audioBuffer);
  console.log(`wrote public/voiceover/${scene.id}.mp3 (${audioBuffer.length} bytes)`);
}

import { loadFont as loadOrbitron } from "@remotion/google-fonts/Orbitron";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

const orbitronFont = loadOrbitron("normal", {
  weights: ["500", "700", "900"],
  subsets: ["latin"],
});

const monoFont = loadJetBrainsMono("normal", {
  weights: ["400", "700"],
  subsets: ["latin"],
});

export const fonts = {
  display: orbitronFont.fontFamily,
  mono: monoFont.fontFamily,
};

export const colors = {
  bg: "#070312",
  bgDeep: "#03010a",
  pink: "#ff2ec4",
  cyan: "#00e5ff",
  purple: "#7b2ff7",
  green: "#39ff88",
  yellow: "#ffe93c",
  text: "#eae6ff",
  dim: "#8b84b0",
  gridLine: "rgba(123, 47, 247, 0.55)",
};

export const glow = (color: string, intensity = 1): string =>
  [
    `0 0 ${6 * intensity}px ${color}`,
    `0 0 ${18 * intensity}px ${color}`,
    `0 0 ${48 * intensity}px ${color}`,
  ].join(", ");

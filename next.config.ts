import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the leaderboard reads bench data from disk at request time — force-include
  // it in the serverless bundle (dynamic fs paths aren't auto-traced)
  outputFileTracingIncludes: {
    "/": ["./bench/results/**", "./bench/roster.json"],
  },
};

export default nextConfig;

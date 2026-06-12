import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { NeonText } from "../components/NeonText";
import { codexResults, contenders } from "../data";
import { colors, fonts, glow } from "../theme";

const CLAUDE_COLOR = colors.pink;
const CODEX_COLOR = colors.cyan;

const Cell: React.FC<{
  medianS: number;
  quality: number;
  color: string;
}> = ({ medianS, quality, color }) => (
  <div style={{ display: "flex", alignItems: "baseline", gap: 18, width: 330 }}>
    <span
      style={{
        fontFamily: fonts.mono,
        fontWeight: 700,
        fontSize: 27,
        color: colors.text,
      }}
    >
      {medianS.toFixed(1)}s
    </span>
    <span
      style={{
        fontFamily: fonts.mono,
        fontSize: 21,
        color,
        textShadow: glow(color, 0.3),
      }}
    >
      Q {(quality * 100).toFixed(0)}%
    </span>
  </div>
);

const Row: React.FC<{ id: string; index: number }> = ({ id, index }) => {
  const frame = useCurrentFrame();
  const start = 30 + index * 14;
  const progress = interpolate(frame, [start, start + 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const claude = contenders.find((c) => c.id === id)!;
  const codex = codexResults[id];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        width: 1430,
        padding: "24px 40px",
        borderRadius: 14,
        border: `1.5px solid ${colors.purple}66`,
        background: `linear-gradient(90deg, ${colors.bg}f2, ${colors.bgDeep}f2)`,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 40}px)`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 26,
          color: claude.color,
          width: 470,
        }}
      >
        {id}
      </div>
      <Cell medianS={claude.medianS} quality={claude.quality} color={CLAUDE_COLOR} />
      <Cell medianS={codex.medianS} quality={codex.quality} color={CODEX_COLOR} />
    </div>
  );
};

export const ComparisonScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const insightIn = interpolate(frame, [120, 145], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={1.2} dimmed />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 22 }}
      >
        <div style={{ opacity: titleIn, marginBottom: 6 }}>
          <NeonText color={colors.green} fontSize={54}>
            Same race. Different agent.
          </NeonText>
        </div>

        <div
          style={{
            display: "flex",
            gap: 24,
            width: 1430,
            padding: "0 40px",
            opacity: titleIn,
          }}
        >
          <div style={{ width: 470 }} />
          <div
            style={{
              width: 330,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 2,
              color: CLAUDE_COLOR,
              textShadow: glow(CLAUDE_COLOR, 0.4),
            }}
          >
            CLAUDE CODE
          </div>
          <div
            style={{
              width: 330,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 24,
              letterSpacing: 2,
              color: CODEX_COLOR,
              textShadow: glow(CODEX_COLOR, 0.4),
            }}
          >
            CODEX CLI
          </div>
        </div>

        {contenders.map((c, i) => (
          <Row key={c.id} id={c.id} index={i} />
        ))}

        <div
          style={{
            opacity: insightIn,
            transform: `translateY(${(1 - insightIn) * 20}px)`,
            marginTop: 12,
            fontFamily: fonts.mono,
            fontSize: 24,
            color: colors.yellow,
            textShadow: glow(colors.yellow, 0.35),
          }}
        >
          ▸ under Codex every skill triggered and beat the baseline — at ~2×
          Claude&apos;s wall-clock
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

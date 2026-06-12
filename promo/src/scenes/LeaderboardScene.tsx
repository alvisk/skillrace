import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { NeonText } from "../components/NeonText";
import { byQuality, type Contender } from "../data";
import { colors, fonts, glow } from "../theme";

const Row: React.FC<{ contender: Contender; index: number }> = ({
  contender,
  index,
}) => {
  const frame = useCurrentFrame();
  const start = 20 + index * 16;
  const progress = interpolate(frame, [start, start + 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const barWidth = interpolate(frame, [start + 10, start + 40], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 30,
        width: 1480,
        padding: "26px 40px",
        borderRadius: 14,
        border: `1.5px solid ${contender.color}77`,
        background: `linear-gradient(90deg, ${colors.bg}f2, ${colors.bgDeep}f2)`,
        boxShadow: `0 0 18px ${contender.color}33`,
        opacity: progress,
        transform: `translateX(${(1 - progress) * 120}px)`,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: 38,
          color: contender.color,
          textShadow: glow(contender.color, 0.5),
          width: 64,
        }}
      >
        {index + 1}
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 27,
          color: colors.text,
          width: 460,
        }}
      >
        {contender.id}
      </div>
      <div style={{ width: 320 }}>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 17,
            color: colors.dim,
            marginBottom: 7,
          }}
        >
          QUALITY {(contender.quality * 100).toFixed(0)}%
        </div>
        <div
          style={{
            height: 12,
            borderRadius: 6,
            background: "rgba(123, 47, 247, 0.2)",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${barWidth * contender.quality * 100}%`,
              borderRadius: 6,
              background: contender.color,
              boxShadow: `0 0 12px ${contender.color}`,
            }}
          />
        </div>
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 24,
          color: colors.text,
          width: 150,
        }}
      >
        {contender.medianS.toFixed(1)}s
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 24,
          color: colors.text,
          width: 170,
        }}
      >
        ${contender.costUsd.toFixed(3)}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 19,
          letterSpacing: 2,
          color: contender.color,
          border: `1.5px solid ${contender.color}`,
          borderRadius: 8,
          padding: "8px 16px",
          textShadow: glow(contender.color, 0.4),
          whiteSpace: "nowrap",
        }}
      >
        {contender.badge}
      </div>
    </div>
  );
};

export const LeaderboardScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const insightIn = interpolate(frame, [110, 135], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={1.2} dimmed />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 26 }}
      >
        <div style={{ opacity: titleIn, marginBottom: 14 }}>
          <NeonText color={colors.pink} fontSize={56}>
            Race analysis
          </NeonText>
        </div>
        {byQuality.map((c, i) => (
          <Row key={c.id} contender={c} index={i} />
        ))}
        <div
          style={{
            opacity: insightIn,
            transform: `translateY(${(1 - insightIn) * 20}px)`,
            marginTop: 18,
            fontFamily: fonts.mono,
            fontSize: 26,
            color: colors.yellow,
            textShadow: glow(colors.yellow, 0.35),
            letterSpacing: 1,
          }}
        >
          ▸ commit-message-generator matched top quality at 82% of the cost —
          in 76% of the time
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

import React from "react";
import {
  AbsoluteFill,
  Easing,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { NeonText } from "../components/NeonText";
import { colors, fonts } from "../theme";

const Line: React.FC<{
  children: React.ReactNode;
  color?: string;
  fontSize?: number;
}> = ({ children, color = colors.dim, fontSize = 44 }) => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        fontFamily: fonts.mono,
        fontSize,
        color,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 30}px)`,
        letterSpacing: 2,
      }}
    >
      {children}
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={1.2} dimmed />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 44,
        }}
      >
        <Sequence from={0} layout="none">
          <Line color={colors.text}>
            skills.sh ranks skills by{" "}
            <span style={{ color: colors.yellow }}>install count</span>.
          </Line>
        </Sequence>
        <Sequence from={28} layout="none">
          <Line>Installs don&apos;t tell you what&apos;s fast.</Line>
        </Sequence>
        <Sequence from={50} layout="none">
          <Line>Or what&apos;s actually good.</Line>
        </Sequence>
        <Sequence from={82} layout="none">
          <NeonText color={colors.pink} fontSize={72}>
            Nobody benchmarks skills.
          </NeonText>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

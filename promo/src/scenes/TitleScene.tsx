import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { NeonText, OutlineText } from "../components/NeonText";
import { colors, fonts } from "../theme";

export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Neon-tube flicker on, then steady.
  const flicker = interpolate(
    frame,
    [0, 3, 6, 9, 12, 16, 20],
    [0, 0.9, 0.2, 1, 0.4, 1, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const rise = interpolate(frame, [0, 1 * fps], [40, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const taglineIn = interpolate(frame, [25, 50], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={2.2} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          gap: 30,
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 18,
            opacity: flicker,
            transform: `translateY(${rise}px)`,
          }}
        >
          <NeonText color={colors.pink} fontSize={140} letterSpacing={10}>
            Skill
          </NeonText>
          <OutlineText color={colors.cyan} fontSize={140} letterSpacing={10}>
            Race
          </OutlineText>
        </div>
        <div
          style={{
            opacity: taglineIn,
            transform: `translateY(${(1 - taglineIn) * 24}px)`,
            fontFamily: fonts.mono,
            fontSize: 34,
            color: colors.text,
            letterSpacing: 6,
          }}
        >
          A/B SPEED-TEST &amp; RANK AGENT SKILLS
        </div>
        <div
          style={{
            opacity: interpolate(frame, [45, 70], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            fontFamily: fonts.mono,
            fontSize: 24,
            color: colors.dim,
            letterSpacing: 3,
          }}
        >
          Lighthouse for agent skills · built on Vercel
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

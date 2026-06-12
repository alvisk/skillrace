import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { colors, fonts } from "../theme";

const Shot: React.FC<{
  src: string;
  caption: string;
  from: number;
  to: number;
  accent: string;
}> = ({ src, caption, from, to, accent }) => {
  const frame = useCurrentFrame();
  const opacity =
    interpolate(frame, [from, from + 14], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }) -
    interpolate(frame, [to - 14, to], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
  // Slow Ken Burns push-in across the shot's lifetime.
  const scale = interpolate(frame, [from, to], [1, 1.07], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (frame < from || frame > to) {
    return null;
  }

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        opacity,
        gap: 34,
      }}
    >
      <div
        style={{
          borderRadius: 18,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 40px ${accent}66`,
          overflow: "hidden",
          width: 1150,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            display: "block",
            transform: `scale(${scale})`,
          }}
        />
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 26,
          color: colors.text,
          letterSpacing: 2,
        }}
      >
        {caption}
      </div>
    </AbsoluteFill>
  );
};

export const ScreensScene: React.FC = () => {
  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={1.4} dimmed />
      <Shot
        src="skillrace-ui.png"
        caption="The neon highway leaderboard — every contender on its own lane"
        from={0}
        to={97}
        accent={colors.pink}
      />
      <Shot
        src="skillrace-finish.png"
        caption="Race analysis — checks, badges & auto-generated insights"
        from={97}
        to={195}
        accent={colors.cyan}
      />
    </AbsoluteFill>
  );
};

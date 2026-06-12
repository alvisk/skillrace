import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { colors } from "../theme";

const GRID = 90;
const STAR_COUNT = 70;

export const SynthwaveBackground: React.FC<{
  speed?: number;
  dimmed?: boolean;
}> = ({ speed = 1.6, dimmed = false }) => {
  const frame = useCurrentFrame();
  const offset = (frame * speed) % GRID;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgDeep} 0%, ${colors.bg} 45%, #14062b 60%)`,
        overflow: "hidden",
      }}
    >
      {Array.from({ length: STAR_COUNT }, (_, i) => {
        const x = random(`star-x-${i}`) * 100;
        const y = random(`star-y-${i}`) * 50;
        const size = 1 + random(`star-s-${i}`) * 2;
        const twinkle =
          0.3 + 0.7 * Math.abs(Math.sin(frame / 20 + i * 1.7));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: colors.text,
              opacity: twinkle * 0.8,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "58%",
          width: 1400,
          height: 500,
          transform: "translate(-50%, -50%)",
          background: `radial-gradient(ellipse at center, ${colors.purple}44 0%, ${colors.pink}22 35%, transparent 70%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: "-50%",
          right: "-50%",
          top: "56%",
          height: "130%",
          transform: "perspective(700px) rotateX(62deg)",
          transformOrigin: "50% 0%",
          backgroundImage: `linear-gradient(${colors.gridLine} 3px, transparent 3px), linear-gradient(90deg, ${colors.gridLine} 3px, transparent 3px)`,
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundPosition: `0px ${offset}px`,
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "52%",
          height: "18%",
          background: `linear-gradient(180deg, transparent 0%, ${colors.bg}cc 40%, transparent 100%)`,
        }}
      />

      {dimmed ? (
        <AbsoluteFill style={{ backgroundColor: "rgba(5, 2, 14, 0.6)" }} />
      ) : null}
    </AbsoluteFill>
  );
};

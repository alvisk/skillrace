import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { NeonText, OutlineText } from "../components/NeonText";
import { colors, fonts, glow } from "../theme";

const COMMAND = "node bench/run.ts commit-message";
const TYPE_START = 30;
const CHARS_PER_FRAME = 0.55;

const stack = ["VERCEL SANDBOX", "WORKFLOW DEVKIT", "AI GATEWAY", "NEXT.JS"];

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();

  const logoIn = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const typedChars = Math.min(
    Math.max(Math.floor((frame - TYPE_START) * CHARS_PER_FRAME), 0),
    COMMAND.length,
  );
  const typed = COMMAND.slice(0, typedChars);
  const cursorOn = Math.floor(frame / 12) % 2 === 0;

  const ctaIn = interpolate(frame, [110, 132], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={2.2} />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 44 }}
      >
        <div
          style={{
            display: "flex",
            gap: 14,
            opacity: logoIn,
            transform: `translateY(${(1 - logoIn) * 30}px)`,
          }}
        >
          <NeonText color={colors.pink} fontSize={96} letterSpacing={8}>
            Skill
          </NeonText>
          <OutlineText color={colors.cyan} fontSize={96} letterSpacing={8}>
            Race
          </OutlineText>
        </div>

        <div
          style={{
            opacity: interpolate(frame, [20, 36], [0, 1], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            }),
            width: 980,
            borderRadius: 14,
            border: `1.5px solid ${colors.purple}`,
            background: `${colors.bgDeep}f5`,
            boxShadow: `0 0 30px ${colors.purple}44`,
            padding: "30px 38px",
            fontFamily: fonts.mono,
            fontSize: 30,
            color: colors.text,
            textAlign: "left",
          }}
        >
          <span style={{ color: colors.green }}>$ </span>
          {typed}
          <span
            style={{
              opacity: cursorOn ? 1 : 0,
              color: colors.cyan,
            }}
          >
            ▍
          </span>
        </div>

        <div style={{ display: "flex", gap: 22, marginTop: 8 }}>
          {stack.map((item, i) => {
            const itemIn = interpolate(
              frame,
              [70 + i * 8, 84 + i * 8],
              [0, 1],
              {
                easing: Easing.bezier(0.16, 1, 0.3, 1),
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              },
            );
            return (
              <div
                key={item}
                style={{
                  opacity: itemIn,
                  transform: `translateY(${(1 - itemIn) * 16}px)`,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fontSize: 21,
                  letterSpacing: 2,
                  color: colors.text,
                  border: `1.5px solid ${colors.cyan}88`,
                  borderRadius: 10,
                  padding: "12px 22px",
                  boxShadow: `0 0 14px ${colors.cyan}33`,
                }}
              >
                {item}
              </div>
            );
          })}
        </div>

        <div
          style={{
            opacity: ctaIn,
            transform: `translateY(${(1 - ctaIn) * 20}px)`,
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: 44,
            letterSpacing: 5,
            color: colors.text,
            textShadow: glow(colors.green, 0.8),
            textTransform: "uppercase",
          }}
        >
          Race your skills.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

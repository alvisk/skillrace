import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { NeonText } from "../components/NeonText";
import { colors, fonts, glow } from "../theme";

type Step = { n: string; title: string; desc: string; color: string };

const steps: Step[] = [
  {
    n: "01",
    title: "Resolve the roster",
    desc: "Every competing skill for the task, pulled from skills.sh",
    color: colors.cyan,
  },
  {
    n: "02",
    title: "Race in isolation",
    desc: "Each trial runs hermetically — exactly one skill in context",
    color: colors.green,
  },
  {
    n: "03",
    title: "Blind judge panel",
    desc: "Anonymized outputs scored on correctness, completeness, format",
    color: colors.yellow,
  },
  {
    n: "04",
    title: "Rank honestly",
    desc: "Speed × quality Pareto frontier — vs a no-skill control run",
    color: colors.pink,
  },
];

const StepCard: React.FC<{ step: Step; index: number }> = ({ step, index }) => {
  const frame = useCurrentFrame();
  const start = 18 + index * 28;
  const progress = interpolate(frame, [start, start + 22], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: 390,
        padding: "34px 30px",
        borderRadius: 16,
        border: `2px solid ${step.color}`,
        background: `linear-gradient(180deg, ${colors.bg}ee, ${colors.bgDeep}ee)`,
        boxShadow: `0 0 24px ${step.color}55`,
        opacity: progress,
        transform: `translateY(${(1 - progress) * 60}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 900,
          fontSize: 54,
          color: step.color,
          textShadow: glow(step.color, 0.5),
        }}
      >
        {step.n}
      </div>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 28,
          color: colors.text,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {step.title}
      </div>
      <div
        style={{
          fontFamily: fonts.mono,
          fontSize: 19,
          lineHeight: 1.5,
          color: colors.dim,
        }}
      >
        {step.desc}
      </div>
    </div>
  );
};

export const HowItWorksScene: React.FC = () => {
  const frame = useCurrentFrame();
  const titleIn = interpolate(frame, [0, 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={1.4} dimmed />
      <AbsoluteFill
        style={{ justifyContent: "center", alignItems: "center", gap: 60 }}
      >
        <div style={{ opacity: titleIn }}>
          <NeonText color={colors.cyan} fontSize={56}>
            Same task. Every skill. Head to head.
          </NeonText>
        </div>
        <div style={{ display: "flex", gap: 36 }}>
          {steps.map((step, i) => (
            <StepCard key={step.n} step={step} index={i} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

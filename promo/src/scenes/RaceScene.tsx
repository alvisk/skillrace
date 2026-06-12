import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
} from "remotion";
import { SynthwaveBackground } from "../components/SynthwaveBackground";
import { NeonText } from "../components/NeonText";
import { contenders, slowestMedianS, bySpeed, type Contender } from "../data";
import { colors, fonts, glow } from "../theme";

const RACE_START = 40;
const RACE_FRAMES = 165; // slowest car takes 5.5s of screen time (~×5 compression)
const START_X = 180;
const FINISH_X = 1610;
const LANE_TOP = 360;
const LANE_HEIGHT = 150;

// Shuffled lane order so the finish order isn't just top-to-bottom.
const laneOrder = [2, 0, 3, 1];

const finishFrame = (c: Contender) =>
  RACE_START + (c.medianS / slowestMedianS) * RACE_FRAMES;

const Car: React.FC<{ contender: Contender; lane: number }> = ({
  contender,
  lane,
}) => {
  const frame = useCurrentFrame();
  const done = finishFrame(contender);

  const progress = interpolate(frame, [RACE_START, done], [0, 1], {
    easing: Easing.bezier(0.3, 0, 0.8, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(progress, [0, 1], [START_X, FINISH_X]);
  // Pure theatre — fades to zero at the line so finish order stays honest.
  const wobble =
    Math.sin(frame / 6 + lane * 1.9) * 10 * Math.sin(Math.PI * progress);
  const racing = frame >= RACE_START && progress < 1;
  const finished = progress >= 1;
  const rank = bySpeed.findIndex((c) => c.id === contender.id) + 1;

  const tagIn = interpolate(frame, [done, done + 10], [0, 1], {
    easing: Easing.bezier(0.34, 1.56, 0.64, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const y = LANE_TOP + lane * LANE_HEIGHT;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x + wobble,
          top: y,
          transform: "translate(-50%, -50%)",
        }}
      >
        {racing ? (
          <div
            style={{
              position: "absolute",
              right: 110,
              top: "50%",
              transform: "translateY(-50%)",
              width: 160,
              height: 10,
              borderRadius: 5,
              background: `linear-gradient(90deg, transparent, ${contender.color})`,
              opacity: 0.8,
            }}
          />
        ) : null}
        <div
          style={{
            width: 124,
            height: 52,
            borderRadius: 14,
            background: `linear-gradient(180deg, ${contender.color}, ${contender.color}88)`,
            boxShadow: `0 0 18px ${contender.color}, 0 0 48px ${contender.color}66`,
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 16,
              top: 9,
              width: 34,
              height: 16,
              borderRadius: 6,
              background: "rgba(8, 2, 20, 0.75)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: -38,
            transform: "translateX(-50%)",
            fontFamily: fonts.mono,
            fontSize: 21,
            fontWeight: 700,
            color: contender.color,
            whiteSpace: "nowrap",
            textShadow: `0 0 12px ${contender.color}`,
          }}
        >
          {contender.id}
        </div>
      </div>

      {finished ? (
        <div
          style={{
            position: "absolute",
            left: FINISH_X + 64,
            top: y,
            transform: `translateY(-50%) scale(${tagIn})`,
            fontFamily: fonts.display,
            fontWeight: 900,
            fontSize: 30,
            color: contender.color,
            textShadow: glow(contender.color, 0.7),
            whiteSpace: "nowrap",
          }}
        >
          P{rank}
          <span
            style={{
              fontFamily: fonts.mono,
              fontWeight: 400,
              fontSize: 22,
              color: colors.text,
              marginLeft: 14,
            }}
          >
            {contender.medianS.toFixed(1)}s
          </span>
        </div>
      ) : null}
    </>
  );
};

export const RaceScene: React.FC = () => {
  const frame = useCurrentFrame();

  const headerIn = interpolate(frame, [0, 20], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const benchTime = Math.min(
    Math.max(((frame - RACE_START) / RACE_FRAMES) * slowestMedianS, 0),
    slowestMedianS,
  );

  const goOpacity = interpolate(
    frame,
    [RACE_START - 14, RACE_START, RACE_START + 18, RACE_START + 30],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const verdictIn = interpolate(
    frame,
    [RACE_START + RACE_FRAMES + 15, RACE_START + RACE_FRAMES + 35],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill>
      <SynthwaveBackground speed={3.2} />

      <div
        style={{
          position: "absolute",
          top: 70,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: headerIn,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 18,
        }}
      >
        <NeonText color={colors.cyan} fontSize={52}>
          Replaying the real benchmark
        </NeonText>
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 22,
            color: colors.dim,
            letterSpacing: 2,
          }}
        >
          commit-message · claude-sonnet-4-6 · median of 3 trials · ×5 time
          compression
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 78,
          right: 90,
          fontFamily: fonts.mono,
          fontSize: 34,
          fontWeight: 700,
          color: colors.yellow,
          textShadow: glow(colors.yellow, 0.5),
        }}
      >
        T+{benchTime.toFixed(1)}s
      </div>

      {laneOrder.map((contenderIndex, lane) => (
        <div
          key={contenders[contenderIndex].id}
          style={{
            position: "absolute",
            left: 100,
            right: 100,
            top: LANE_TOP + lane * LANE_HEIGHT,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${colors.purple}88, transparent)`,
          }}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: FINISH_X + 30,
          top: LANE_TOP - 70,
          height: LANE_HEIGHT * 3 + 140,
          width: 14,
          backgroundImage: `repeating-linear-gradient(0deg, ${colors.text} 0 14px, ${colors.bgDeep} 14px 28px)`,
          boxShadow: `0 0 22px ${colors.cyan}aa`,
        }}
      />

      {laneOrder.map((contenderIndex, lane) => (
        <Car
          key={contenders[contenderIndex].id}
          contender={contenders[contenderIndex]}
          lane={lane}
        />
      ))}

      <div
        style={{
          position: "absolute",
          top: 250,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: goOpacity,
        }}
      >
        <NeonText color={colors.green} fontSize={88} style={{ display: "inline-block" }}>
          GO
        </NeonText>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 60,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: verdictIn,
          fontFamily: fonts.mono,
          fontSize: 28,
          color: colors.text,
          letterSpacing: 2,
        }}
      >
        Car speed = measured wall-clock. The finish order{" "}
        <span style={{ color: colors.green, fontWeight: 700 }}>
          is the speed ranking
        </span>
        .
      </div>
    </AbsoluteFill>
  );
};

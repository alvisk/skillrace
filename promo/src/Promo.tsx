import React from "react";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Audio } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { TitleScene } from "./scenes/TitleScene";
import { ProblemScene } from "./scenes/ProblemScene";
import { HowItWorksScene } from "./scenes/HowItWorksScene";
import { RaceScene } from "./scenes/RaceScene";
import { LeaderboardScene } from "./scenes/LeaderboardScene";
import { ComparisonScene } from "./scenes/ComparisonScene";
import { ScreensScene } from "./scenes/ScreensScene";
import { OutroScene } from "./scenes/OutroScene";

const T = 15;

export const sceneDurations = [135, 135, 240, 285, 210, 225, 195, 180];
export const transitionCount = 7;
export const totalDuration =
  sceneDurations.reduce((a, b) => a + b, 0) - transitionCount * T;

const sceneStarts = sceneDurations.map(
  (_, i) => sceneDurations.slice(0, i).reduce((a, b) => a + b, 0) - i * T,
);

const voiceoverFiles = [
  "01-title",
  "02-problem",
  "03-how",
  "04-race",
  "05-leaderboard",
  "06-compare",
  "06-screens",
  "07-outro",
];

const VoiceoverTrack: React.FC = () => (
  <>
    {voiceoverFiles.map((file, i) => (
      <Sequence key={file} from={sceneStarts[i] + (i === 0 ? 5 : 12)}>
        <Audio src={staticFile(`voiceover/${file}.mp3`)} />
      </Sequence>
    ))}
  </>
);

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill>
      <PromoScenes />
      <VoiceoverTrack />
    </AbsoluteFill>
  );
};

const PromoScenes: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={sceneDurations[0]}>
        <TitleScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneDurations[1]}>
        <ProblemScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneDurations[2]}>
        <HowItWorksScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneDurations[3]}>
        <RaceScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneDurations[4]}>
        <LeaderboardScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneDurations[5]}>
        <ComparisonScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneDurations[6]}>
        <ScreensScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: T })}
      />
      <TransitionSeries.Sequence durationInFrames={sceneDurations[7]}>
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};

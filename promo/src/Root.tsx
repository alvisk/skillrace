import React from "react";
import "./index.css";
import { Composition } from "remotion";
import { Promo, totalDuration } from "./Promo";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="SkillRacePromo"
      component={Promo}
      durationInFrames={totalDuration}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};

"use client";

import { useEffect, useRef, useState } from "react";
import type { Breakdown } from "@/lib/breakdown";
import { TIME_SCALE, type RacePhase } from "@/lib/race";
import type { SkillSummary } from "@/lib/results";
import { BreakdownPanel } from "./breakdown-panel";
import { SceneLoader } from "./scene-loader";

type RaceStageProps = {
  summary: SkillSummary[];
  breakdown: Breakdown | null;
};

const toggleLabel = (phase: RacePhase): string =>
  phase === "running" ? "■ STOP" : phase === "paused" ? "▶ RESUME" : phase === "finished" ? "▶ REPLAY" : "▶ START";

export const RaceStage = ({ summary, breakdown }: RaceStageProps) => {
  const [phase, setPhase] = useState<RacePhase>("idle");
  const [analysisOpen, setAnalysisOpen] = useState(true);
  const raceTime = useRef(0);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (phase === "finished") setAnalysisOpen(true);
  }, [phase]);

  const hasData = summary.length > 0;
  const slowestS = Math.max(...summary.map((s) => s.medianDurationS ?? 30), 1);

  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => {
      // auto-finish once the slowest car has crossed; clamp the clock to its time
      if (raceTime.current * TIME_SCALE >= slowestS) {
        raceTime.current = slowestS / TIME_SCALE;
        setPhase("finished");
        return;
      }
      setTick((t) => t + 1);
    }, 100);
    return () => clearInterval(id);
  }, [phase, slowestS]);

  const toggle = () => {
    if (phase === "running") {
      setPhase("paused");
      return;
    }
    if (phase === "finished") raceTime.current = 0; // replay from the grid
    setPhase("running");
  };

  const reset = () => {
    raceTime.current = 0;
    setPhase("idle");
  };

  const running = phase === "running";
  const benchTime = raceTime.current * TIME_SCALE;

  return (
    <>
      <SceneLoader summary={summary} phase={phase} raceTime={raceTime} />
      {phase === "finished" && breakdown && analysisOpen && (
        <BreakdownPanel breakdown={breakdown} onClose={() => setAnalysisOpen(false)} />
      )}
      <div className="hud hud-controls">
        <div className="race-clock">
          <span className="race-clock-time">T+{benchTime.toFixed(1)}s</span>
          <span className="race-clock-note">bench time · ×{TIME_SCALE} replay</span>
        </div>
        <button
          type="button"
          className={running ? "btn btn-stop" : "btn btn-start"}
          onClick={toggle}
          disabled={!hasData}
          data-testid="race-toggle"
        >
          {toggleLabel(phase)}
        </button>
        <button
          type="button"
          className="btn btn-reset"
          onClick={reset}
          disabled={phase === "idle" && raceTime.current === 0}
          data-testid="race-reset"
        >
          ⟲ RESET
        </button>
      </div>
    </>
  );
};

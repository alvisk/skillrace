export type RacePhase = "idle" | "running" | "paused" | "finished";

/** Replay speed: 1s of wall clock = TIME_SCALE seconds of benchmark time. */
export const TIME_SCALE = 4;

/** World-units from start line to finish line. */
export const TRACK_LENGTH = 32;

/** z position of the start line. */
export const START_Z = -6;

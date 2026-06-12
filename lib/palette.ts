export const LANE_COLORS = ["#00f0ff", "#ff00e5", "#ffe600", "#00ff85", "#ff6b00", "#8a7dff"];

export const laneColor = (index: number): string => LANE_COLORS[index % LANE_COLORS.length];

import type { CSSProperties } from "react";
import { laneColor } from "@/lib/palette";
import type { RaceResults } from "@/lib/results";

const formatTrigger = (rate: number | null): string =>
  rate === null ? "—" : `${Math.round(rate * 100)}%`;

export const Hud = ({ results }: { results: RaceResults }) => (
  <aside className="hud hud-board">
    <h2>LEADERBOARD · QUALITY</h2>
    <ol>
      {results.summary.map((s, i) => (
        <li key={s.skillId} style={{ "--lane": laneColor(i) } as CSSProperties}>
          <span className="rank">{String(i + 1).padStart(2, "0")}</span>
          <div className="meta">
            <strong>
              {s.skillId}
              {i === 0 && <em className="winner-chip">WINNER</em>}
            </strong>
            <div className="quality-bar">
              <i style={{ width: `${(s.medianQuality ?? 0) * 100}%` }} />
            </div>
            <small>
              {s.medianDurationS ?? "?"}s · ${s.medianCostUsd?.toFixed(3) ?? "?"} ·{" "}
              {s.medianOutputTokens ?? "?"} tok · trigger {formatTrigger(s.triggerRate)}
            </small>
          </div>
          <span className="quality">{(s.medianQuality ?? 0).toFixed(2)}</span>
        </li>
      ))}
    </ol>
    <footer>
      <span>{results.model}</span>
      <span>{results.trialsPerSkill}× trials</span>
      <span>{new Date(results.generatedAt).toLocaleString()}</span>
    </footer>
  </aside>
);

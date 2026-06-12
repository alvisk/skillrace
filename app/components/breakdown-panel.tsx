"use client";

import type { CSSProperties } from "react";
import type { Breakdown } from "@/lib/breakdown";
import { laneColor } from "@/lib/palette";

const pct = (n: number) => `${Math.round(n * 100)}%`;

type BreakdownPanelProps = {
  breakdown: Breakdown;
  onClose: () => void;
};

export const BreakdownPanel = ({ breakdown, onClose }: BreakdownPanelProps) => (
  <section className="hud hud-breakdown" data-testid="breakdown">
    <button type="button" className="bd-close" onClick={onClose} data-testid="breakdown-close">
      ✕
    </button>
    <h2>RACE ANALYSIS</h2>

    <div className="bd-grid bd-head">
      <span>CONTENDER</span>
      <span>SPEED</span>
      <span>QUALITY</span>
      <span>COST</span>
      <span>TOKENS</span>
      <span>TURNS</span>
      <span>TRIGGER</span>
      <span>CHECKS</span>
    </div>

    {breakdown.contenders.map((c, i) => (
      <div className="bd-row" key={c.skillId} style={{ "--lane": laneColor(i) } as CSSProperties}>
        <div className="bd-grid">
          <span className="bd-name">
            {c.skillId}
            <span className="bd-badges">
              {c.badges.map((b) => (
                <em key={b}>{b}</em>
              ))}
            </span>
          </span>
          <span>
            P{c.place} · {c.medianDurationS ?? "?"}s
          </span>
          <span>
            #{c.qualityRank} · {(c.medianQuality ?? 0).toFixed(2)}
          </span>
          <span>${c.medianCostUsd?.toFixed(3) ?? "?"}</span>
          <span>{c.medianOutputTokens ?? "?"}</span>
          <span>{c.medianTurns ?? "?"}</span>
          <span>{c.triggerRate === null ? "—" : pct(c.triggerRate)}</span>
          <span className="bd-checks" title="artifact / format / keywords / no-commit">
            A {pct(c.checkRates.artifact)} · F {pct(c.checkRates.format)} · K{" "}
            {pct(c.checkRates.keywords)} · G {pct(c.checkRates.noCommit)}
          </span>
        </div>
        {c.sampleFirstLine && <p className="bd-sample">“{c.sampleFirstLine}”</p>}
      </div>
    ))}

    <ul className="bd-insights">
      {breakdown.insights.map((line) => (
        <li key={line}>{line}</li>
      ))}
    </ul>

    <p className="bd-hint">▶ REPLAY to race again · ⟲ RESET to return to the grid</p>
  </section>
);

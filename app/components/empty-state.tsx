import type { RosterCategory } from "@/lib/roster";

export const EmptyState = ({ category }: { category: RosterCategory }) => (
  <div className="hud hud-empty" data-testid="empty-state">
    <h2>NO TELEMETRY</h2>
    <p>
      <strong>{category.name}</strong> hasn&apos;t been raced yet. Run the bench, then refresh:
    </p>
    <code>node bench/run.ts {category.id} --model claude-sonnet-4-6</code>
  </div>
);

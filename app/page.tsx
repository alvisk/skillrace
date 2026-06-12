import { buildBreakdown } from "@/lib/breakdown";
import { categoriesWithResults, loadResults } from "@/lib/results";
import { loadRoster } from "@/lib/roster";
import { EmptyState } from "./components/empty-state";
import { Hud } from "./components/hud";
import { RaceStage } from "./components/race-stage";
import { Sidebar } from "./components/sidebar";

export const dynamic = "force-dynamic";

const Page = async ({ searchParams }: { searchParams: Promise<{ category?: string }> }) => {
  const { category } = await searchParams;
  const [roster, withResults] = await Promise.all([loadRoster(), categoriesWithResults()]);

  const activeId =
    category && roster.categories.some((c) => c.id === category)
      ? category
      : (withResults[0] ?? roster.categories[0].id);
  const active = roster.categories.find((c) => c.id === activeId)!;

  const results = await loadResults(activeId);
  const breakdown = results ? buildBreakdown(results) : null;

  return (
    <main className="stage">
      <RaceStage summary={results?.summary ?? []} breakdown={breakdown} />
      <Sidebar roster={roster} active={active} withResults={withResults} />
      {results ? <Hud results={results} /> : <EmptyState category={active} />}
    </main>
  );
};

export default Page;

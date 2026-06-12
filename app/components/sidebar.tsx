import Link from "next/link";
import { formatInstalls, type Roster, type RosterCategory } from "@/lib/roster";

type SidebarProps = {
  roster: Roster;
  active: RosterCategory;
  withResults: string[];
};

export const Sidebar = ({ roster, active, withResults }: SidebarProps) => (
  <nav className="hud hud-side" data-testid="sidebar">
    <h1>
      SKILL<span>RACE</span>
    </h1>
    <p className="side-sub">neon highway skill benchmark</p>

    <h3>RACE CATEGORIES</h3>
    <ul className="cat-list">
      {roster.categories.map((c) => {
        const raced = withResults.includes(c.id);
        return (
          <li key={c.id}>
            <Link
              href={`/?category=${c.id}`}
              className={c.id === active.id ? "cat cat-active" : "cat"}
              data-testid={`cat-${c.id}`}
            >
              <span className="cat-name">{c.name}</span>
              <span className={raced ? "cat-meta cat-raced" : "cat-meta"}>
                {c.skills.filter((s) => s.install).length} skills · {raced ? "● raced" : "○ no data"}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>

    <h3>CONTENDERS</h3>
    <ul className="chip-list">
      {active.skills.map((s) => (
        <li key={s.id} className={s.control ? "chip chip-control" : "chip"} title={s.install ?? "no-skill control run"}>
          {s.id}
          {s.installs !== undefined && <em>{formatInstalls(s.installs)}</em>}
        </li>
      ))}
    </ul>

    <p className="side-hint">
      find more: <code>npx skills find &lt;topic&gt;</code>
      <br />
      then add to <code>bench/roster.json</code>
    </p>
  </nav>
);

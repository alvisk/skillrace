import { readFile } from "node:fs/promises";
import path from "node:path";

export type RosterSkill = {
  id: string;
  install: string | null;
  installs?: number;
  control?: boolean;
  note?: string;
};

export type RosterCategory = {
  id: string;
  name: string;
  taskPrompt: string;
  skills: RosterSkill[];
};

export type Roster = {
  trialsPerSkill: number;
  categories: RosterCategory[];
};

export const loadRoster = async (): Promise<Roster> => {
  const raw = await readFile(path.join(process.cwd(), "bench", "roster.json"), "utf8");
  return JSON.parse(raw);
};

export const formatInstalls = (n?: number): string =>
  n === undefined ? "" : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

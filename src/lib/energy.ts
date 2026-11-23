// The site's live energy budget, from /api/energy.
//
// The API answers with aggregate numbers only (no infrastructure details):
//   { budgetWh, usedWh, leftWh, visits, joulesPerVisit, state, windowStart, measuredAt }
// A POST counts this page view (one per visitor per day, server side).

export interface Energy {
  budgetWh: number;
  usedWh: number;
  leftWh: number;
  visits: number;
  joulesPerVisit: number | null;
  state: "awake" | "low" | "asleep";
  windowStart: string;
  measuredAt: string | null;
}

/** Formats watt-hours with a unit that keeps 2-3 significant digits. */
export function formatWh(wh: number): string {
  if (!Number.isFinite(wh)) return "…";
  if (wh >= 1) return `${parseFloat(wh.toPrecision(3))} Wh`;
  return `${parseFloat((wh * 1000).toPrecision(3))} mWh`;
}

/** Formats joules; small values in millijoules. */
export function formatJ(j: number | null): string {
  if (j === null || !Number.isFinite(j)) return "…";
  if (j >= 1) return `${parseFloat(j.toPrecision(3))} J`;
  return `${Math.round(j * 1000)} mJ`;
}

const listeners: Array<(e: Energy) => void> = [];

/** Subscribes to every budget update (and to the last one, if any). */
export function onEnergy(fn: (e: Energy) => void): void {
  listeners.push(fn);
  if (last) fn(last);
}

let last: Energy | null = null;
let simulating = false;

/** Applies a budget to the page: light, sleep state and every [data-energy] field. */
export function apply(e: Energy, fromSimulation = false): void {
  if (simulating && !fromSimulation) return;
  const root = document.documentElement;
  const level = e.budgetWh > 0 ? Math.max(0, Math.min(1, e.leftWh / e.budgetWh)) : 1;
  root.style.setProperty("--energy", level.toFixed(3));
  root.classList.toggle("asleep", e.state === "asleep");
  const fields: Record<string, string> = {
    left: formatWh(e.leftWh),
    used: formatWh(e.usedWh),
    budget: formatWh(e.budgetWh),
    visits: e.visits.toLocaleString("en-US"),
    perVisit: formatJ(e.joulesPerVisit),
    state: e.state,
  };
  document.querySelectorAll<HTMLElement>("[data-energy]").forEach((el) => {
    const v = fields[el.dataset.energy ?? ""];
    if (v !== undefined) el.textContent = v;
  });
  document.querySelectorAll<HTMLElement>("[data-energy-footer], [data-energy-ready]").forEach((el) => (el.hidden = false));
  listeners.forEach((fn) => fn(e));
}

/** Lets the "play the day" demo drive the page; live updates pause meanwhile. */
export function setSimulating(on: boolean): void {
  simulating = on;
  if (!on && last) apply(last);
}

async function load(count: boolean): Promise<void> {
  try {
    const res = await fetch("/api/energy", { method: count ? "POST" : "GET", cache: "no-store" });
    if (!res.ok) return;
    last = (await res.json()) as Energy;
    apply(last);
  } catch {
    // offline or API asleep: the page stays fully lit and readable
  }
}

export function startEnergy(): void {
  void load(true);
  setInterval(() => {
    if (document.visibilityState === "visible") void load(false);
  }, 60_000);
}

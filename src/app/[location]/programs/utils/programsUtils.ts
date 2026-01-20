/**
 * Programs feature helpers (DRY)
 * - No API response transformation: these helpers only normalize inputs for requests/UI.
 */

export type ProgramTypeUi = "PRIVATE" | "GROUP";
export type ProgramTypeApi = 1 | 2;

export type ProgramStatusUi = "active" | "inactive";
export type ProgramStatusApi = 0 | 1;

export function programTypeUiToApi(type: ProgramTypeUi): ProgramTypeApi {
  return type === "PRIVATE" ? 1 : 2;
}

export function programStatusUiToApi(status: ProgramStatusUi): ProgramStatusApi {
  return status === "active" ? 1 : 0;
}

export function programStatusApiToUi(status: number | null | undefined): ProgramStatusUi {
  return status === 1 ? "active" : "inactive";
}

export function parseRateInputToNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

export function formatRateForDisplay(rate: string): string {
  const n = Number.parseFloat(rate);
  return Number.isFinite(n) ? `$${n.toFixed(2)}` : "-";
}

export function buildProgramsActiveFlags(activeFilter: string | undefined): {
  showActive?: boolean;
  showInActive?: boolean;
} {
  const showActive = activeFilter === "active" ? true : activeFilter === "inactive" ? false : undefined;
  const showInActive = activeFilter === "inactive" ? true : activeFilter === "active" ? false : undefined;
  return { showActive, showInActive };
}



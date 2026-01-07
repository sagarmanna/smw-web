/**
 * Fallback Tax Types
 *
 * We don't currently have an API endpoint to fetch tax types in this project.
 * To avoid scattered hardcoding, keep the mapping centralized here.
 */

export interface TaxType {
  id: number;
  name: string;
}

export const FALLBACK_TAX_TYPES: TaxType[] = [
  { id: 1, name: "HST" },
  { id: 2, name: "GST" },
  { id: 3, name: "NO TAX" },
];

const normalizeNameKey = (value: string): string => value.trim().toLowerCase().replace(/\s+/g, " ");

export function getTaxTypeIdByName(name: string | undefined | null): number | undefined {
  if (!name) return undefined;
  const key = normalizeNameKey(name);
  const match = FALLBACK_TAX_TYPES.find((t) => normalizeNameKey(t.name) === key);
  return match?.id;
}

export function getTaxTypeNameOptions(): string[] {
  return FALLBACK_TAX_TYPES.map((t) => t.name);
}



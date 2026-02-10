// Centralised item-related domain constants and mappings.
// Keep this file in sync with the backend enum / config.

export const TAX_STATUS_OPTIONS = ["Default", "No Tax", "GST Only"] as const;
export type TaxStatusLabel = (typeof TAX_STATUS_OPTIONS)[number];

export const STATUS_OPTIONS = ["Enable", "Disable"] as const;
export type StatusLabel = (typeof STATUS_OPTIONS)[number];

// NOTE: These IDs must match the backend tax status configuration.
// If backend values change, update this map instead of scattering numbers.
export const TAX_STATUS_ID_MAP: Record<TaxStatusLabel, number> = {
  Default: 1,
  "No Tax": 2,
  "GST Only": 3,
};


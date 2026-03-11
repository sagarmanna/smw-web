import type { InvoiceItem } from "../types";

export interface TotalsCalculationResult {
  discounts: number;
  subtotal: number;
  tax: number;
  total: number;
  paid: number;
  balance: number;
}

/**
 * Calculates total tax from invoice items (sum of all item taxes)
 * @param items - Array of invoice items
 * @returns Total tax amount
 */
export function calculateTaxFromItems(items: InvoiceItem[]): number {
  return items.reduce((sum, item) => sum + (item.tax || 0), 0);
}

/**
 * Recalculates invoice totals based on item values and paid amount.
 * Tax is derived from the sum of line item tax values.
 * @param items - Array of invoice items
 * @param paid - Amount already paid
 * @returns Calculated totals object
 */
export function recalculateTotals(
  items: InvoiceItem[],
  paid: number
): TotalsCalculationResult {
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const discounts = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const tax = calculateTaxFromItems(items);
  const total = subtotal + tax;
  const balance = total - paid;

  return {
    discounts,
    subtotal,
    tax,
    total,
    paid,
    balance,
  };
}


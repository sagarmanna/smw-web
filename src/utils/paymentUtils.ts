// utils/paymentUtils.ts
import { formatCurrency } from './formatCurrency';

/**
 * Parse currency string to number
 * Removes all non-numeric characters except decimal point and negative sign
 * @param value - Currency string (e.g., "$1,234.56" or "1234.56")
 * @returns Parsed number or 0 if invalid
 * @example
 * parseCurrency("$1,234.56") // returns 1234.56
 * parseCurrency("1234.56") // returns 1234.56
 * parseCurrency("invalid") // returns 0
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0;
}

/**
 * Normalize amount to number (handles both string and number inputs)
 * DRY helper to avoid repetitive type checking
 * @param amount - Amount as string or number
 * @returns Normalized number value
 * @example
 * normalizeAmount("$500.00") // returns 500
 * normalizeAmount(500) // returns 500
 */
export function normalizeAmount(amount: number | string): number {
  return typeof amount === 'string' ? parseCurrency(amount) : amount;
}

/**
 * Generic function to update allocation in any row array
 * Immutably updates a single row's allocation value
 * @param rows - Array of rows with allocation property
 * @param index - Index of row to update
 * @param value - New allocation value
 * @returns New array with updated row
 * @example
 * const rows = [{ id: 1, allocation: 100 }, { id: 2, allocation: 200 }];
 * updateRowAllocation(rows, 0, 150) // returns [{ id: 1, allocation: 150 }, { id: 2, allocation: 200 }]
 */
export function updateRowAllocation<T extends { allocation: number }>(
  rows: T[],
  index: number,
  value: number
): T[] {
  return rows.map((row, i) => (i === index ? { ...row, allocation: value } : row));
}

/**
 * Generic function to convert rows to editable format with allocation property
 * Takes any row array and converts a specified amount field to an allocation number
 * @param rows - Array of rows to convert
 * @param amountKey - Key name of the amount field to convert to allocation
 * @returns Array of rows with allocation property
 * @example
 * const rows = [{ name: "Item 1", payment: "$100.00" }];
 * convertToEditableRows(rows, 'payment') // returns [{ name: "Item 1", payment: "$100.00", allocation: 100 }]
 */
export function convertToEditableRows<T extends { allocation: number }>(
  rows: unknown[],
  amountKey: string
): T[] {
  return rows.map(row => ({
    ...(row as object),
    allocation: parseCurrency((row as Record<string, unknown>)[amountKey] as string),
  })) as T[];
}

/**
 * Calculate sum of allocations from rows
 * @param rows - Array of rows with allocation property
 * @returns Sum of all allocations
 * @example
 * const rows = [{ allocation: 100 }, { allocation: 200 }];
 * sumAllocations(rows) // returns 300
 */
export function sumAllocations<T extends { allocation: number }>(rows: T[]): number {
  return rows.reduce((sum, row) => sum + row.allocation, 0);
}

/**
 * Calculate total allocations from multiple row arrays
 * Useful for summing allocations across different types (lessons, invoices, etc.)
 * @param rowArrays - Multiple arrays of rows with allocation property
 * @returns Total sum of all allocations
 * @example
 * const lessons = [{ allocation: 100 }];
 * const invoices = [{ allocation: 200 }];
 * calculateTotalAllocations(lessons, invoices) // returns 300
 */
export function calculateTotalAllocations<T extends { allocation: number }>(
  ...rowArrays: T[][]
): number {
  return rowArrays.reduce((total, rows) => total + sumAllocations(rows), 0);
}

/**
 * Calculate credit amount (amount received minus amount applied)
 * Returns the remaining credit after allocations, never negative
 * @param amountReceived - Total amount received (string or number)
 * @param amountApplied - Total amount applied to allocations
 * @returns Credit amount (never negative)
 * @example
 * calculateCreditAmount(500, 300) // returns 200
 * calculateCreditAmount("500", 300) // returns 200
 * calculateCreditAmount(300, 500) // returns 0 (never negative)
 */
export function calculateCreditAmount(
  amountReceived: number | string,
  amountApplied: number
): number {
  const received = normalizeAmount(amountReceived);
  return Math.max(0, received - amountApplied);
}

/**
 * Validate allocation amount against available balance
 * @param allocation - Allocation amount to validate
 * @param balance - Available balance
 * @returns True if allocation is valid (non-negative and within balance)
 * @example
 * isValidAllocation(100, 200) // returns true
 * isValidAllocation(300, 200) // returns false (exceeds balance)
 * isValidAllocation(-50, 200) // returns false (negative)
 */
export function isValidAllocation(allocation: number, balance: number): boolean {
  return allocation >= 0 && allocation <= balance;
}

/**
 * Calculate remaining balance after allocation
 * @param originalAmount - Original amount (string or number)
 * @param allocation - Allocated amount
 * @returns Remaining balance (never negative)
 * @example
 * calculateRemainingBalance(500, 300) // returns 200
 * calculateRemainingBalance("$500.00", 300) // returns 200
 * calculateRemainingBalance(300, 500) // returns 0 (never negative)
 */
export function calculateRemainingBalance(
  originalAmount: number | string,
  allocation: number
): number {
  const amount = normalizeAmount(originalAmount);
  return Math.max(0, amount - allocation);
}

/**
 * Create allocation change handler factory
 * Higher-order function that creates handlers for updating allocations in React state
 * @param setter - State setter function from useState
 * @returns Handler function that updates allocation at given index
 * @example
 * const [rows, setRows] = useState([...]);
 * const handleChange = createAllocationHandler(setRows);
 * handleChange(0, 150); // Updates allocation of first row to 150
 */
export function createAllocationHandler<T extends { allocation: number }>(
  setter: React.Dispatch<React.SetStateAction<T[]>>
) {
  return (index: number, value: number) => {
    setter(prev => updateRowAllocation(prev, index, value));
  };
}

/**
 * Validate payment data completeness
 * Checks if all required fields are present and valid
 * @param data - Payment data object to validate
 * @returns Object with isValid boolean and array of missing fields
 * @example
 * validatePaymentData({ date: "2025-01-01", method: "Cash", amountReceived: 100 })
 * // returns { isValid: true, missingFields: [] }
 * 
 * validatePaymentData({ date: "", method: "Cash", amountReceived: 0 })
 * // returns { isValid: false, missingFields: ["date", "amountReceived"] }
 */
export function validatePaymentData(data: {
  date?: string;
  method?: string;
  amountReceived?: string | number;
}): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];
  
  if (!data.date) missingFields.push('date');
  if (!data.method) missingFields.push('method');
  if (!data.amountReceived || normalizeAmount(data.amountReceived) <= 0) {
    missingFields.push('amountReceived');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Format allocation row for display
 * Converts raw allocation data to formatted display strings
 * @param row - Row with allocation data
 * @param amountKey - Key for the amount field
 * @param allocation - Current allocation amount
 * @returns Formatted row with payment and balance as currency strings
 * @example
 * const row = { student: "John", amount: "$200.00" };
 * formatAllocationRow(row, 'amount', 150)
 * // returns { student: "John", amount: "$200.00", payment: "$150.00", balance: "$50.00" }
 */
export function formatAllocationRow<T extends Record<string, unknown>>(
  row: T,
  amountKey: string,
  allocation: number
): T & { payment: string; balance: string } {
  const amount = parseCurrency(row[amountKey] as string);
  const balance = calculateRemainingBalance(amount, allocation);
  
  return {
    ...row,
    payment: formatCurrency(allocation),
    balance: formatCurrency(balance),
  };
}

/**
 * Batch update multiple allocations at once
 * Useful for bulk operations like "Apply All" or "Clear All"
 * @param rows - Array of rows to update
 * @param updates - Map of index to new allocation value
 * @returns New array with all specified rows updated
 * @example
 * const rows = [{ allocation: 0 }, { allocation: 0 }, { allocation: 0 }];
 * batchUpdateAllocations(rows, { 0: 100, 2: 200 })
 * // returns [{ allocation: 100 }, { allocation: 0 }, { allocation: 200 }]
 */
export function batchUpdateAllocations<T extends { allocation: number }>(
  rows: T[],
  updates: Record<number, number>
): T[] {
  return rows.map((row, index) => 
    updates[index] !== undefined ? { ...row, allocation: updates[index] } : row
  );
}

/**
 * Calculate percentage of allocation vs original amount
 * @param allocation - Current allocation
 * @param originalAmount - Original amount
 * @returns Percentage (0-100)
 * @example
 * calculateAllocationPercentage(50, 200) // returns 25
 * calculateAllocationPercentage(200, 200) // returns 100
 */
export function calculateAllocationPercentage(
  allocation: number,
  originalAmount: number | string
): number {
  const amount = normalizeAmount(originalAmount);
  
  if (amount === 0) return 0;
  return Math.min(100, (allocation / amount) * 100);
}
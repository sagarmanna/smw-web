/**
 * Formats a number as currency using USD format
 * @param value - The number to format (optional)
 * @returns Formatted currency string or "N/A" if value is undefined
 */
export const formatCurrency = (value?: number): string => {
  if (value === undefined) {
    return "N/A";
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

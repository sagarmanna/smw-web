import type { LessonDiscountData } from "../privateLessonsListing.slice";

// Re-export for convenience
type PrivateLessonsDiscountFormData = LessonDiscountData;

/**
 * Parses a price string to a number, removing currency symbols and formatting
 * @param priceString - Price string that may contain $, commas, etc.
 * @returns Parsed numeric price value
 */
export function parsePrice(priceString: string): number {
  const cleanedPrice = priceString.replace(/[$,]/g, "").trim();
  return parseFloat(cleanedPrice) || 0;
}

/**
 * Formats a numeric price back to string, preserving original format
 * @param price - Numeric price value
 * @param originalFormat - Original price string to preserve format (e.g., includes $)
 * @returns Formatted price string
 */
export function formatPrice(price: number, originalFormat?: string): string {
  const formattedPrice = price.toFixed(2);
  const hasDollarSign = originalFormat?.includes("$") ?? false;
  return hasDollarSign ? `$${formattedPrice}` : formattedPrice;
}

/**
 * Calculates the discounted price based on discount data
 * Applies discounts in the following order:
 * 1. Payment Frequency Discount (percentage)
 * 2. Customer Discount (percentage)
 * 3. Multiple Enrollment Discount (fixed $)
 * 4. Line Item Discount (fixed $ or percentage)
 * 
 * @param originalPrice - Original price string
 * @param discountData - Discount form data
 * @returns New discounted price string (preserves original format)
 */
export function calculateDiscountedPrice(
  originalPrice: string,
  discountData: PrivateLessonsDiscountFormData
): string {
  const basePrice = parsePrice(originalPrice);

  // Return original price if base price is 0 or invalid
  if (basePrice === 0) {
    return originalPrice;
  }

  let discountedPrice = basePrice;

  // Apply Payment Frequency Discount (percentage)
  if (discountData.paymentFrequencyDiscountPercent) {
    const discountPercent = parseFloat(discountData.paymentFrequencyDiscountPercent) || 0;
    discountedPrice = discountedPrice * (1 - discountPercent / 100);
  }

  // Apply Customer Discount (percentage)
  if (discountData.customerDiscountPercent) {
    const discountPercent = parseFloat(discountData.customerDiscountPercent) || 0;
    discountedPrice = discountedPrice * (1 - discountPercent / 100);
  }

  // Apply Multiple Enrollment Discount (fixed $)
  if (discountData.multipleEnrollmentDiscountAmount) {
    const discountAmount = parseFloat(discountData.multipleEnrollmentDiscountAmount) || 0;
    discountedPrice = discountedPrice - discountAmount;
  }

  // Apply Line Item Discount (fixed $ or percentage)
  if (discountData.lineItemDiscountValue) {
    const discountValue = parseFloat(discountData.lineItemDiscountValue) || 0;
    if (discountData.lineItemDiscountType === "fixed") {
      discountedPrice = discountedPrice - discountValue;
    } else {
      // percentage
      discountedPrice = discountedPrice * (1 - discountValue / 100);
    }
  }

  // Ensure price doesn't go negative
  discountedPrice = Math.max(0, discountedPrice);

  // Format back to string (preserve original format)
  return formatPrice(discountedPrice, originalPrice);
}

/**
 * Calculates discount preview information for display
 * @param originalPrice - Original price string
 * @param discountData - Discount form data
 * @returns Preview object with original price, new price, and discount amount
 */
export function calculateDiscountPreview(
  originalPrice: string,
  discountData: PrivateLessonsDiscountFormData
): {
  originalPrice: string;
  newPrice: string;
  discountAmount: string;
} {
  const basePrice = parsePrice(originalPrice);
  const newPriceStr = calculateDiscountedPrice(originalPrice, discountData);
  const newPrice = parsePrice(newPriceStr);
  const discountAmount = basePrice - newPrice;

  return {
    originalPrice: basePrice.toFixed(2),
    newPrice: newPrice.toFixed(2),
    discountAmount: discountAmount.toFixed(2),
  };
}

/**
 * Calculates discounted prices for multiple lessons
 * @param lessons - Array of lessons with id and price
 * @param discountData - Discount form data
 * @returns Map of lesson ID to new discounted price string
 */
export function calculateDiscountedPricesForLessons(
  lessons: Array<{ id: number; price: string }>,
  discountData: PrivateLessonsDiscountFormData
): Map<number, string> {
  const newPrices = new Map<number, string>();

  lessons.forEach((lesson) => {
    const discountedPrice = calculateDiscountedPrice(lesson.price, discountData);
    newPrices.set(lesson.id, discountedPrice);
  });

  return newPrices;
}


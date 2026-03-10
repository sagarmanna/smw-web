/**
 * POS API Service
 * Handles all POS-related API calls
 */

import { apiClient } from './client';

// In-flight deduplication: if a createTransaction call is already running,
// return the same promise instead of making a second HTTP call.
// This is the definitive fix for React Strict Mode double-mount + Redux re-render
// causing duplicate transaction creation on page load.
let _createTransactionInFlight: Promise<CreateTransactionResponse> | null = null;

export interface CreateTransactionResponse {
  success: boolean;
  data: {
    transactionId: string;
    numericTransactionId: string;
    transactionDate: string;
    locationId: number;
  };
}

export interface ItemLookupResponse {
  success: boolean;
  data: {
    id: string;
    code: string;
    description: string;
    price: number;
  };
}

export interface AddLineItemResponse {
  success: boolean;
  data: {
    id: number;
    transactionId: string;
    lineItems: Array<{
      id: number;
      itemId: string;
      quantity: number;
      price: number;
    }>;
  };
}

export interface UpdateLineItemResponse {
  success: boolean;
  data: {
    id: string;
    transactionId: string;
    itemId: string;
    quantity: number;
    price: number;
    overridePrice: number;
  };
}

export interface GetTransactionResponse {
  success: boolean;
  data: {
    id: number;
    transactionId: string;
    locationId: number;
    status: string;
    createdAt: string;
    subtotal?: string;
    discountAmount?: string;
    totalAmount?: string;
    lineItems: Array<{
      id: number;
      quantity: number;
      price: string;
      overridePrice?: string;
      item: {
        id: string;
        code: string;
        description: string;
        price: number;
      };
    }>;
  };
  message: string;
}

export interface ApplyDiscountResponse {
  success: boolean;
  data: {
    id: number;
    transactionId: string;
    discountAmount: string;
    subtotal: string;
    totalAmount: string;
  };
  message: string;
}

export interface CancelTransactionResponse {
  id: number;
  transactionId: string;
  locationId: number;
  transactionSequence: number;
  type: string;
  date: string;
  customerInfo: string;
  status: string;
  subtotal: number;
  discountAmount: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
  lineItems: Array<{
    id: number;
    quantity: number;
    price: number;
    discount: number;
    overridePrice: number | null;
    item: {
      id: number;
      code: string;
      description: string;
    };
  }>;
}

/**
 * Create a new POS transaction
 * 
 * @param locationId - The location ID for the transaction
 * @param location - The location slug
 * @returns Promise resolving to transaction data
 */
export function createPOSTransaction(
  locationId: number,
  location: string
): Promise<CreateTransactionResponse> {
  // If a call is already in-flight, return the same promise (deduplicate)
  if (_createTransactionInFlight) {
    console.log('[POS API] Transaction creation already in-flight, deduplicating');
    return _createTransactionInFlight;
  }

  _createTransactionInFlight = apiClient
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .post<any>(`/admin/v2/${location}/pos/transaction`, {})
    .then((response) => {
      const data = response.data.data || response.data;
      return {
        success: true,
        data: {
          transactionId: data.transactionId,
          numericTransactionId: data.id,
          transactionDate: data.createdAt,
          locationId: data.locationId,
        },
      } as CreateTransactionResponse;
    })
    .finally(() => {
      // Clear after resolution so next page load can create a fresh transaction
      _createTransactionInFlight = null;
    });

  return _createTransactionInFlight;
}

/**
 * Lookup an item by code
 * 
 * @param location - The location slug
 * @param code - The product code or UPC
 * @returns Promise resolving to item data
 */
export async function lookupItem(
  location: string,
  code: string
): Promise<ItemLookupResponse> {
  const response = await apiClient.get<ItemLookupResponse>(
    `/admin/v2/${location}/pos/items?code=${encodeURIComponent(code)}`
  );

  const data = response.data.data || response.data;
  return {
    success: true,
    data: {
      id: data.id,
      code: data.code,
      description: data.description,
      price: data.price,
    },
  };
}

/**
 * Add a line item to a transaction
 * 
 * @param transactionId - The transaction ID
 * @param location - The location slug
 * @param itemData - Line item data (itemId, quantity, optional discount/overridePrice)
 * @returns Promise resolving to line item data
 */
export async function addLineItem(
  transactionId: string,
  location: string,
  itemData: {
    itemId: string;
    quantity: number;
    discount?: number;
    overridePrice?: number;
  }
): Promise<AddLineItemResponse> {
  const response = await apiClient.post<AddLineItemResponse>(
    `/admin/v2/${location}/pos/transaction/${transactionId}/line-items`,
    itemData
  );

  const data = response.data.data || response.data;
  return {
    success: true,
    data: {
      id: data.id,
      transactionId: data.transactionId,
      lineItems: data.lineItems || [],
    },
  };
}

/**
 * Get an existing transaction by ID
 * 
 * @param transactionId - The numeric transaction ID
 * @param location - The location slug
 * @returns Promise resolving to transaction data with line items
 */
export async function getTransaction(
  transactionId: string,
  location: string
): Promise<GetTransactionResponse> {
  const response = await apiClient.get<GetTransactionResponse>(
    `/admin/v2/${location}/pos/transaction/${transactionId}`
  );

  return response.data;
}

/**
 * Update line item price
 * 
 * @param transactionId - The transaction ID
 * @param location - The location slug
 * @param lineItemId - The line item ID
 * @param overridePrice - The new price
 * @returns Promise resolving to updated line item data
 */
export async function updateLineItemPrice(
  transactionId: string,
  location: string,
  lineItemId: string,
  overridePrice: number
): Promise<UpdateLineItemResponse> {
  const response = await apiClient.patch<UpdateLineItemResponse>(
    `/admin/v2/${location}/pos/transaction/${transactionId}/line-items/${lineItemId}`,
    { overridePrice }
  );

  const data = response.data.data || response.data;
  return {
    success: true,
    data: {
      id: data.id,
      transactionId: data.transactionId,
      itemId: data.itemId,
      quantity: data.quantity,
      price: data.price,
      overridePrice: data.overridePrice,
    },
  };
}

/**
 * Update line item quantity
 * 
 * @param transactionId - The transaction ID
 * @param location - The location slug
 * @param lineItemId - The line item ID
 * @param quantity - The new quantity (1-999)
 * @returns Promise resolving to updated line item data
 */
export async function updateLineItemQuantity(
  transactionId: string,
  location: string,
  lineItemId: string,
  quantity: number
): Promise<UpdateLineItemResponse> {
  // Validate quantity
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
    throw new Error('Quantity must be an integer between 1 and 999');
  }

  const response = await apiClient.patch<UpdateLineItemResponse>(
    `/admin/v2/${location}/pos/transaction/${transactionId}/line-items/${lineItemId}`,
    { quantity }
  );

  const data = response.data.data || response.data;
  return {
    success: true,
    data: {
      id: data.id,
      transactionId: data.transactionId,
      itemId: data.itemId,
      quantity: data.quantity,
      price: data.price,
      overridePrice: data.overridePrice,
    },
  };
}

/**
 * Delete a line item from a transaction
 * 
 * @param transactionId - The transaction ID
 * @param location - The location slug
 * @param lineItemId - The line item ID to delete
 * @returns Promise resolving to success response
 */
export async function deleteLineItem(
  transactionId: string,
  location: string,
  lineItemId: string
): Promise<{ success: boolean }> {
  await apiClient.delete(
    `/admin/v2/${location}/pos/transaction/${transactionId}/line-items/${lineItemId}`
  );

  return { success: true };
}

/**
 * Apply discount to a transaction
 * 
 * @param transactionId - The transaction ID
 * @param location - The location slug
 * @param discountAmount - The discount amount to apply
 * @returns Promise resolving to updated transaction data
 */
export async function applyDiscount(
  transactionId: string,
  location: string,
  discountAmount: number
): Promise<ApplyDiscountResponse> {
  const response = await apiClient.patch<ApplyDiscountResponse>(
    `/admin/v2/${location}/pos/transaction/${transactionId}/discount`,
    { discountAmount }
  );

  return response.data;
}

/**
 * Cancel a transaction
 * 
 * @param transactionId - The transaction ID
 * @param location - The location slug
 * @returns Promise resolving to cancelled transaction data
 */
export async function cancelTransaction(
  transactionId: string,
  location: string
): Promise<CancelTransactionResponse> {
  const response = await apiClient.patch<CancelTransactionResponse>(
    `/admin/v2/${location}/pos/transaction/${transactionId}/cancel`
  );

  return response.data;
}

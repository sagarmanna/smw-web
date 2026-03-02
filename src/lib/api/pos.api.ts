/**
 * POS API Service
 * Handles all POS-related API calls
 */

import { apiClient } from './client';

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

/**
 * Create a new POS transaction
 * 
 * @param locationId - The location ID for the transaction
 * @param location - The location slug
 * @returns Promise resolving to transaction data
 */
export async function createPOSTransaction(
  locationId: number,
  location: string
): Promise<CreateTransactionResponse> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await apiClient.post<any>(
    `/admin/v2/${location}/pos/transaction`,
    { locationId }
  );

  const data = response.data.data || response.data;
  return {
    success: true,
    data: {
      transactionId: data.transactionId,
      numericTransactionId: data.id,
      transactionDate: data.createdAt,
      locationId: data.locationId,
    },
  };
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

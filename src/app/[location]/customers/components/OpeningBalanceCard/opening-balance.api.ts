import { apiClient } from '@/lib/api/client';

export interface OpeningBalanceData {
  invoiceId: number;
  amount: number;
  isCredit: boolean;
  total: number;
}

export interface CreateOpeningBalanceRequest {
  type: 'openingBalance';
  data: {
    amount: number;
    isCredit: boolean;
  };
}

export interface OpeningBalanceResponse {
  success: boolean;
  message: string;
  data: OpeningBalanceData;
}

/**
 * Create opening balance for a customer
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @param amount - The opening balance amount (minimum 0.1)
 * @param isCredit - true for credit, false for debit/owing
 * @returns Promise with the created opening balance data
 */
export async function createCustomerOpeningBalance(
  location: string,
  customerId: number,
  amount: number,
  isCredit: boolean
): Promise<OpeningBalanceResponse | null> {
  try {
    const requestBody: CreateOpeningBalanceRequest = {
      type: 'openingBalance',
      data: {
        amount,
        isCredit
      }
    };

    const response = await apiClient.post<OpeningBalanceResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`,
      requestBody
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error('Error creating opening balance:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to create opening balance',
      data: {
        invoiceId: 0,
        amount: 0,
        isCredit: false,
        total: 0
      }
    };
  }
}

/**
 * Get customer's opening balance information
 * @param location - The location identifier
 * @param customerId - The customer ID
 * @returns Promise with the opening balance data
 */
export async function getCustomerOpeningBalance(
  location: string,
  customerId: number
): Promise<OpeningBalanceData | null> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: {
        openingBalance: OpeningBalanceData | null;
      };
    }>(`/admin/v2/${location}/customers/${customerId}/info`);
    
    if (response.data.success && response.data.data.openingBalance) {
      return response.data.data.openingBalance;
    }
    
    return null;
  } catch {
    return null;
  }
}
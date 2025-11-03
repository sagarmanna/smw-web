import { apiClient } from '@/lib/api/client';

export interface ReferralSourceData {
  id: number;
  name: string;
}

export interface ReferralSourceResponse {
  success: boolean;
  data: ReferralSourceData[];
}

/**
 * Get all referral sources
 * @returns Promise with the referral sources array
 */
export async function getReferralSources(): Promise<ReferralSourceData[]> {
  try {
    const response = await apiClient.get<ReferralSourceResponse>(
      '/admin/v2/referral-sources'
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    return [];
  } catch {
    return [];
  }
}
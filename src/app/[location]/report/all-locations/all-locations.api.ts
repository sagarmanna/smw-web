import { apiClient } from '@/lib/api/client';

export interface LocationStats {
  name: string;
  activeEnrolments: number;
  revenue: number;
  royalty: number;
  advertisement: number;
  hst: number;
  total: number;
}

export interface AllLocationsResponse {
  success: boolean;
  data: LocationStats[];
  message: string;
}

export async function getAllLocationsData({
  location,
  fromDate,
  toDate,
}: {
  location: string;
  fromDate: string;
  toDate: string;
}): Promise<AllLocationsResponse | null> {
  try {
    const token = localStorage.getItem("token");
    
    

    const response = await apiClient.get<AllLocationsResponse>(
      `/admin/v2/${location}/report/all-locations`,
      {
        params: { fromDate, toDate },
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    
    
    return response.data;
  } catch (error) {
    const axiosError = error as { response?: { status?: number; data?: unknown } };
    
    
    console.error("Error fetching all locations data:", error);
    return null;
  }
}

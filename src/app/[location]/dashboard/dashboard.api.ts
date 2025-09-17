import { apiClient } from '@/lib/api/client';

export interface MonthlyRevenueResponse {
  success: boolean;
  data: {
    values: {
      x: string;
      y: number;
    }[];
  };
  message: string;
}

export interface PieChartResponse {
  success: boolean;
  data: {
    values: {
      name: string;
      count: number;
    }[];
    total: number;
  };
  message: string;
}

export async function getMonthlyRevenueData({
  location,
}: {
  location: string;
}): Promise<MonthlyRevenueResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<MonthlyRevenueResponse>(
      `/admin/v2/${location}/dashboard/monthly-revenue`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching monthly revenue data:", error);
    return null;
  }
}

export async function getPieChartData({
  fromDate,
  toDate,
  location,
  type,
}: {
  fromDate: string;
  toDate: string;
  location: string;
  type: string;
}): Promise<PieChartResponse | null> {
  try {
    const token = localStorage.getItem("token");

    const response = await apiClient.get<PieChartResponse>(
      `/admin/v2/${location}/dashboard/${type}`,
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
    console.error(`Error fetching ${type} pie chart data:`, error);
    return null;
  }
}

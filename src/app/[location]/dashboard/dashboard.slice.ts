import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getMonthlyRevenueData, getPieChartData } from './dashboard.api';
import type { MonthlyRevenueResponse, PieChartResponse } from './dashboard.api';

export interface DashboardData {
  monthlyRevenue: Array<{ x: string; y: number }>;
  enrolmentGains: Array<{ name: string; count: number }>;
  enrolmentLosses: Array<{ name: string; count: number }>;
  instructionHours: Array<{ name: string; count: number }>;
}

interface DashboardState {
  // Store data by location and date range key
  data: {
    [key: string]: DashboardData;
  };
  isLoading: boolean;
  error: string | null;
  lastFetched: {
    [key: string]: number;
  };
}

const initialState: DashboardState = {
  data: {},
  isLoading: false,
  error: null,
  lastFetched: {},
};

// Helper function to create cache key from location and date range
const createCacheKey = (location: string, fromDate: string, toDate: string): string => {
  return `${location}_${fromDate}_${toDate}`;
};

// Async thunk for fetching all dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (
    {
      location,
      fromDate,
      toDate,
      permissions,
    }: {
      location: string;
      fromDate: string;
      toDate: string;
      permissions: {
        manageMonthlyRevenue?: boolean;
        manageEnrolmentGains?: boolean;
        manageEnrolmentLosses?: boolean;
        manageInstructionHours?: boolean;
      };
    },
    { rejectWithValue }
  ) => {
    try {
      const cacheKey = createCacheKey(location, fromDate, toDate);
      
      // Fetch data based on permissions
      const fetchPromises: Array<Promise<MonthlyRevenueResponse | PieChartResponse | null>> = [];
      const chartTypes: string[] = [];

      if (permissions.manageMonthlyRevenue) {
        fetchPromises.push(getMonthlyRevenueData({ location }));
        chartTypes.push('monthlyRevenue');
      }

      if (permissions.manageEnrolmentGains) {
        fetchPromises.push(getPieChartData({ fromDate, toDate, location, type: 'enrolment-gains' }));
        chartTypes.push('enrolmentGains');
      }

      if (permissions.manageEnrolmentLosses) {
        fetchPromises.push(getPieChartData({ fromDate, toDate, location, type: 'enrolment-losses' }));
        chartTypes.push('enrolmentLosses');
      }

      if (permissions.manageInstructionHours) {
        fetchPromises.push(getPieChartData({ fromDate, toDate, location, type: 'instruction-hours' }));
        chartTypes.push('instructionHours');
      }

      if (fetchPromises.length === 0) {
        // No permissions, return empty data
        return {
          cacheKey,
          data: {
            monthlyRevenue: [],
            enrolmentGains: [],
            enrolmentLosses: [],
            instructionHours: [],
          },
        };
      }

      const results = await Promise.all(fetchPromises);

      // Build dashboard data object
      const dashboardData: DashboardData = {
        monthlyRevenue: [],
        enrolmentGains: [],
        enrolmentLosses: [],
        instructionHours: [],
      };

      let resultIndex = 0;
      chartTypes.forEach((chartType) => {
        const result = results[resultIndex];
        if (chartType === 'monthlyRevenue') {
          const monthlyRevenueResult = result as MonthlyRevenueResponse | null;
          dashboardData.monthlyRevenue = monthlyRevenueResult?.data?.values ?? [];
        } else if (chartType === 'enrolmentGains') {
          const pieChartResult = result as PieChartResponse | null;
          dashboardData.enrolmentGains = pieChartResult?.data?.values ?? [];
        } else if (chartType === 'enrolmentLosses') {
          const pieChartResult = result as PieChartResponse | null;
          dashboardData.enrolmentLosses = pieChartResult?.data?.values ?? [];
        } else if (chartType === 'instructionHours') {
          const pieChartResult = result as PieChartResponse | null;
          dashboardData.instructionHours = pieChartResult?.data?.values ?? [];
        }
        resultIndex++;
      });

      return {
        cacheKey,
        data: dashboardData,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.data = {};
      state.error = null;
      state.lastFetched = {};
    },
    clearDashboardByLocation: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      // Remove all cache keys that start with this location
      Object.keys(state.data).forEach((key) => {
        if (key.startsWith(`${location}_`)) {
          delete state.data[key];
          delete state.lastFetched[key];
        }
      });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard data reducers
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.data[action.payload.cacheKey] = action.payload.data;
          state.lastFetched[action.payload.cacheKey] = Date.now();
        }
        state.error = null;
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDashboard, clearDashboardByLocation, clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;


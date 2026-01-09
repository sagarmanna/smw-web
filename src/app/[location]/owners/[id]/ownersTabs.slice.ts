import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  HistoryData,
} from './config/ownerTabConfigs';
import { getOwnerHistory } from './ownersTabs.api';

export interface OwnerTabsState {
  historyData: HistoryData[];
  isLoading: boolean;
  error: string | null;
  currentOwnerId: number | null;
  // History specific state
  historyLoading: boolean;
  historyError: string | null;
  historyOwnerId: number | null;
  historyPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

const initialState: OwnerTabsState = {
  historyData: [],
  isLoading: false,
  error: null,
  currentOwnerId: null,
  historyLoading: false,
  historyError: null,
  historyOwnerId: null,
  historyPagination: null,
};

// Transform API response to HistoryData
function transformHistoryData(apiData: { id: number; message: string; createdOn: string }[]): HistoryData[] {
  return apiData.map((item) => ({
    id: item.id.toString(),
    message: item.message,
    createdOn: item.createdOn,
  }));
}

// Async thunk for fetching history data with pagination
export const fetchHistoryData = createAsyncThunk(
  'ownerTabs/fetchHistoryData',
  async (
    { location, ownerId, page = 1 }: { location: string; ownerId: number; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getOwnerHistory(location, ownerId, page);
      
      if (!apiResult.success) {
        throw new Error(apiResult.message || 'Failed to fetch history');
      }

      return {
        data: transformHistoryData(apiResult.data.body || []),
        pagination: apiResult.data.pagination,
        ownerId,
      };
    } catch (error) {
      console.error('Error in fetchHistoryData:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch owner history'
      );
    }
  }
);

const ownerTabsSlice = createSlice({
  name: 'ownerTabs',
  initialState,
  reducers: {
    clearOwnerTabs: (state) => {
      state.historyData = [];
      state.currentOwnerId = null;
      state.historyOwnerId = null;
      state.historyPagination = null;
      state.error = null;
      state.historyError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // History
      .addCase(fetchHistoryData.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchHistoryData.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = action.payload.data;
        state.historyPagination = action.payload.pagination;
        state.historyOwnerId = action.payload.ownerId;
        state.historyError = null;
      })
      .addCase(fetchHistoryData.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { clearOwnerTabs } = ownerTabsSlice.actions;
export default ownerTabsSlice.reducer;


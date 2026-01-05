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
}

const initialState: OwnerTabsState = {
  historyData: [],
  isLoading: false,
  error: null,
  currentOwnerId: null,
  historyLoading: false,
  historyError: null,
  historyOwnerId: null,
};

// Transform API response to HistoryData
function transformHistoryData(apiData: { id: number; message: string; createdOn: string }[]): HistoryData[] {
  return apiData.map((item) => ({
    id: item.id.toString(),
    message: item.message,
    createdOn: item.createdOn,
  }));
}

// Async thunk for fetching history data
export const fetchHistoryData = createAsyncThunk(
  'ownerTabs/fetchHistoryData',
  async (
    { location, ownerId }: { location: string; ownerId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getOwnerHistory(location, ownerId);
      
      if (response && response.success && response.data?.body) {
        return {
          data: transformHistoryData(response.data.body),
          ownerId,
        };
      }

      return {
        data: [],
        ownerId,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch owner history');
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


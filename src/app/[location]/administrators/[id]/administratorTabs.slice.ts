import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  HistoryData,
} from './config/administratorTabConfigs';
import { getAdministratorHistory } from './administrators-details-tabs.api';

export interface AdministratorTabsState {
  historyData: HistoryData[];
  isLoading: boolean;
  error: string | null;
  currentAdministratorId: number | null;
  // History specific state
  historyLoading: boolean;
  historyError: string | null;
  historyAdministratorId: number | null;
}

const initialState: AdministratorTabsState = {
  historyData: [],
  isLoading: false,
  error: null,
  currentAdministratorId: null,
  historyLoading: false,
  historyError: null,
  historyAdministratorId: null,
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
  'administratorTabs/fetchHistoryData',
  async (
    { location, administratorId }: { location: string; administratorId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAdministratorHistory(location, administratorId);
      
      if (response && response.success && response.data?.body) {
        return {
          data: transformHistoryData(response.data.body),
          administratorId,
        };
      }

      return {
        data: [],
        administratorId,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch administrator history');
    }
  }
);

const administratorTabsSlice = createSlice({
  name: 'administratorTabs',
  initialState,
  reducers: {
    clearAdministratorTabs: (state) => {
      state.historyData = [];
      state.currentAdministratorId = null;
      state.historyAdministratorId = null;
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
        state.historyAdministratorId = action.payload.administratorId;
        state.historyError = null;
      })
      .addCase(fetchHistoryData.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { clearAdministratorTabs } = administratorTabsSlice.actions;
export default administratorTabsSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  HistoryData,
} from '../staffMemberTabConfigs';
import { getStaffMemberHistory } from './staffMembersTabs.api';

export interface StaffMemberTabsState {
  historyData: HistoryData[];
  isLoading: boolean;
  error: string | null;
  currentStaffMemberId: number | null;
  // History specific state
  historyLoading: boolean;
  historyError: string | null;
  historyStaffMemberId: number | null;
}

const initialState: StaffMemberTabsState = {
  historyData: [],
  isLoading: false,
  error: null,
  currentStaffMemberId: null,
  historyLoading: false,
  historyError: null,
  historyStaffMemberId: null,
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
  'staffMemberTabs/fetchHistoryData',
  async (
    { location, staffMemberId }: { location: string; staffMemberId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getStaffMemberHistory(location, staffMemberId);
      
      if (response && response.success && response.data?.body) {
        return {
          data: transformHistoryData(response.data.body),
          staffMemberId,
        };
      }

      return {
        data: [],
        staffMemberId,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch staff member history');
    }
  }
);

const staffMemberTabsSlice = createSlice({
  name: 'staffMemberTabs',
  initialState,
  reducers: {
    clearStaffMemberTabs: (state) => {
      state.historyData = [];
      state.currentStaffMemberId = null;
      state.historyStaffMemberId = null;
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
        state.historyStaffMemberId = action.payload.staffMemberId;
        state.historyError = null;
      })
      .addCase(fetchHistoryData.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { clearStaffMemberTabs } = staffMemberTabsSlice.actions;
export default staffMemberTabsSlice.reducer;


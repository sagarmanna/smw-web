import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchStaffMemberInfo, fetchStaffMemberTabs as fetchStaffMemberTabsAPI } from './staffmembers.mock';
import type { StaffMemberInfo, StaffMemberTabsData } from './staffmembers-details.interface';

interface StaffMemberState {
  staffMemberInfo: StaffMemberInfo | null;
  tabsData: StaffMemberTabsData | null;
  isLoading: boolean;
  isLoadingTabs: boolean;
  error: string | null;
  tabsError: string | null;
  lastFetched: number | null;
}

const initialState: StaffMemberState = {
  staffMemberInfo: null,
  tabsData: null,
  isLoading: false,
  isLoadingTabs: false,
  error: null,
  tabsError: null,
  lastFetched: null,
};

// Async thunk for fetching staff member info
export const fetchStaffMember = createAsyncThunk(
  'staffMember/fetchStaffMember',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await fetchStaffMemberInfo(id);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch staff member info');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch staff member info');
    }
  }
);

// Async thunk for fetching staff member tabs
export const fetchStaffMemberTabs = createAsyncThunk(
  'staffMember/fetchStaffMemberTabs',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await fetchStaffMemberTabsAPI(id);
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch staff member tabs');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch staff member tabs');
    }
  }
);

const staffMemberSlice = createSlice({
  name: 'staffMember',
  initialState,
  reducers: {
    clearStaffMember: (state) => {
      state.staffMemberInfo = null;
      state.tabsData = null;
      state.error = null;
      state.tabsError = null;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearTabsError: (state) => {
      state.tabsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Staff member info reducers
      .addCase(fetchStaffMember.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffMember.fulfilled, (state, action: PayloadAction<StaffMemberInfo>) => {
        state.isLoading = false;
        state.staffMemberInfo = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchStaffMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Staff member tabs reducers
      .addCase(fetchStaffMemberTabs.pending, (state) => {
        state.isLoadingTabs = true;
        state.tabsError = null;
      })
      .addCase(fetchStaffMemberTabs.fulfilled, (state, action: PayloadAction<StaffMemberTabsData>) => {
        state.isLoadingTabs = false;
        state.tabsData = action.payload;
        state.tabsError = null;
      })
      .addCase(fetchStaffMemberTabs.rejected, (state, action) => {
        state.isLoadingTabs = false;
        state.tabsError = action.payload as string;
      });
  },
});

export const { clearStaffMember, clearError, clearTabsError } = staffMemberSlice.actions;
export default staffMemberSlice.reducer;


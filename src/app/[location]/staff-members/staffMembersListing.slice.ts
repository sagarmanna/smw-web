import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getStaffMembers, StaffMemberRow, StaffMembersQuery } from './staffMembers.api';
import { SortField } from './utils/sortStaffMembers';

interface StaffMembersListingState {
  rows: StaffMemberRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Sorting
  sortBy?: SortField;
  sortDir: 'asc' | 'desc';
  // Filters
  columnFilters: Record<string, unknown>;
  activeFilter?: string;
}

/**
 * Initial state for staff members listing
 * Defaults to showing active staff members, sorted by last name ascending
 */
const initialState: StaffMembersListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: 'lastName',
  sortDir: 'asc',
  columnFilters: {},
  activeFilter: 'active', // Default to showing only active staff members
};

/**
 * Async thunk for fetching staff members list from API
 * Returns empty result if API call fails or returns unsuccessful response
 */
export const fetchStaffMembers = createAsyncThunk(
  'staffMembersListing/fetchStaffMembers',
  async (
    { location, query }: { location: string; query: StaffMembersQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getStaffMembers(location, query);
      
      if (response && response.success) {
        return {
          rows: response.data.body,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        };
      }

      // Return empty result if API call fails or returns unsuccessful response
      return {
        rows: [],
        total: 0,
        totalPages: 0,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch staff members');
    }
  }
);

const staffMembersListingSlice = createSlice({
  name: 'staffMembersListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: SortField; sortDir: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
      state.page = 1; // Reset to first page when sorting changes
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setActiveFilter: (state, action: PayloadAction<string | undefined>) => {
      state.activeFilter = action.payload;
      state.page = 1; // Reset to first page when filter changes
    },
    clearError: (state) => {
      state.error = null;
    },
    clearStaffMembers: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffMembers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchStaffMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearStaffMembers,
} = staffMembersListingSlice.actions;

export default staffMembersListingSlice.reducer;


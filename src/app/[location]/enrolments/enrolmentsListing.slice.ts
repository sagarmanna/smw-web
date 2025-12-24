import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getEnrolmentsList, EnrolmentRow, EnrolmentsQuery } from './enrolmentsListing.api';
import { SortField } from './utils/sortEnrolments';

interface EnrolmentsListingState {
  rows: EnrolmentRow[];
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

const initialState: EnrolmentsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: 'program', // Default to sorting by program
  sortDir: 'asc',
  columnFilters: {},
  activeFilter: undefined, // Default to showing all enrolments
};

// Async thunk for fetching enrolments list
export const fetchEnrolments = createAsyncThunk(
  'enrolmentsListing/fetchEnrolments',
  async (
    { location, query }: { location: string; query: EnrolmentsQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getEnrolmentsList(location, query);
      
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch enrolments');
    }
  }
);

const enrolmentsListingSlice = createSlice({
  name: 'enrolmentsListing',
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
    clearEnrolments: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrolments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchEnrolments.rejected, (state, action) => {
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
  clearEnrolments,
} = enrolmentsListingSlice.actions;

export default enrolmentsListingSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getUnscheduledLessonsList, UnscheduledLessonRow, UnscheduledLessonsQuery } from './unscheduledLessonsListing.api';

interface UnscheduledLessonsListingState {
  rows: UnscheduledLessonRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Filters
  columnFilters: Record<string, unknown>;
  activeFilter: 'active' | 'inactive'; // Only active or inactive, no 'all' option
}

const initialState: UnscheduledLessonsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  columnFilters: {},
  activeFilter: 'active', // Default to showing only active lessons
};

// Async thunk for fetching unscheduled lessons list
export const fetchUnscheduledLessons = createAsyncThunk(
  'unscheduledLessonsListing/fetchUnscheduledLessons',
  async (
    { location, query, activeFilter }: { location: string; query: UnscheduledLessonsQuery; activeFilter: 'active' | 'inactive' },
    { rejectWithValue }
  ) => {
    try {
      // active/inactive filter controls ONLY the inactive inclusion flag.
      // showAll=true is reserved for "fetch all items without pagination" mode.
      const showInactive = activeFilter === "inactive";

      const response = await getUnscheduledLessonsList(location, {
        ...query,
        showInactive,
      });

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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch unscheduled lessons');
    }
  }
);

const unscheduledLessonsListingSlice = createSlice({
  name: 'unscheduledLessonsListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setActiveFilter: (state, action: PayloadAction<'active' | 'inactive'>) => {
      state.activeFilter = action.payload;
      state.page = 1; // Reset to first page when filter changes
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnscheduledLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnscheduledLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchUnscheduledLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setPageSize,
  setColumnFilters,
  setActiveFilter,
} = unscheduledLessonsListingSlice.actions;

export default unscheduledLessonsListingSlice.reducer;


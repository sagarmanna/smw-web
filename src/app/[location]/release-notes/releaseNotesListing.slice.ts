import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getReleaseNotesList, ReleaseNoteRow, ReleaseNotesQuery } from './releaseNotesListing.api';

interface ReleaseNotesListingState {
  rows: ReleaseNoteRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Sorting
  sortBy?: "subject" | "scheduleDate" | "createdDate";
  sortDir: 'asc' | 'desc';
  // Filters
  columnFilters: Record<string, unknown>;
}

const initialState: ReleaseNotesListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 10,
  sortBy: 'createdDate', // Default to sorting by created date
  sortDir: 'desc',
  columnFilters: {},
};

// Async thunk for fetching release notes list
export const fetchReleaseNotes = createAsyncThunk(
  'releaseNotesListing/fetchReleaseNotes',
  async (
    { location, query }: { location: string; query: ReleaseNotesQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getReleaseNotesList(location, query);
      
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch release notes');
    }
  }
);

const releaseNotesListingSlice = createSlice({
  name: 'releaseNotesListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: "subject" | "scheduleDate" | "createdDate"; sortDir: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
      state.page = 1; // Reset to first page when sorting changes
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    clearError: (state) => {
      state.error = null;
    },
    clearReleaseNotes: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
    resetReleaseNotesState: (state) => {
      // Reset all state to initial values (useful when location changes)
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.isLoading = false;
      state.error = null;
      state.page = 1;
      state.pageSize = 10;
      state.sortBy = 'createdDate';
      state.sortDir = 'desc';
      state.columnFilters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReleaseNotes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReleaseNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchReleaseNotes.rejected, (state, action) => {
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
  clearError,
  clearReleaseNotes,
  resetReleaseNotesState,
} = releaseNotesListingSlice.actions;

export default releaseNotesListingSlice.reducer;


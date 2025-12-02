import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getBlogs, BlogRow, BlogsQuery } from './blogs.api';

interface BlogsListingState {
  rows: BlogRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Sorting
  sortBy?: string;
  sortDir: 'asc' | 'desc';
  // Filters
  columnFilters: Record<string, unknown>;
}

const initialState: BlogsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: undefined,
  sortDir: 'desc',
  columnFilters: {},
};

// Async thunk for fetching blogs list
export const fetchBlogs = createAsyncThunk(
  'blogsListing/fetchBlogs',
  async (
    { location, query }: { location: string; query: BlogsQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getBlogs(location, query);
      
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch blogs');
    }
  }
);

const blogsListingSlice = createSlice({
  name: 'blogsListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: string; sortDir: 'asc' | 'desc' }>) => {
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
    clearBlogs: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
    resetBlogsState: (state) => {
      // Reset all state to initial values (useful when location changes)
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.isLoading = false;
      state.error = null;
      state.page = 1;
      state.pageSize = 20;
      state.sortBy = undefined;
      state.sortDir = 'desc';
      state.columnFilters = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.isLoading = false;
        // Safely handle error payload
        state.error = typeof action.payload === 'string' 
          ? action.payload 
          : action.error?.message || 'Failed to fetch blogs';
      });
  },
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  clearError,
  clearBlogs,
  resetBlogsState,
} = blogsListingSlice.actions;

export default blogsListingSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getTimelineList, 
  getTimelineCreatedUsers, 
  TimelineRow, 
  TimelineQuery,
  CreatedUser 
} from './timelineListing.api';
import { startOfDay, endOfDay, format } from 'date-fns';

interface TimelineListingState {
  rows: TimelineRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Filters
  columnFilters: Record<string, unknown>;
  // Available users for dropdown
  createdUsers: CreatedUser[];
  isLoadingUsers: boolean;
}

// Initialize default date filter to today (stored as serializable strings)
const getDefaultDateFilter = () => {
  const today = new Date();
  const from = startOfDay(today);
  const to = endOfDay(today);

  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  } as { from: string; to: string };
};

const initialState: TimelineListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  columnFilters: {
    date: getDefaultDateFilter(),
  },
  createdUsers: [],
  isLoadingUsers: false,
};

// Async thunk for fetching timeline list
export const fetchTimeline = createAsyncThunk(
  'timelineListing/fetchTimeline',
  async (
    { location, query }: { location: string; query: TimelineQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getTimelineList(location, query);
      
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch timeline');
    }
  }
);

// Async thunk for fetching created users list
export const fetchCreatedUsers = createAsyncThunk(
  'timelineListing/fetchCreatedUsers',
  async (location: string, { rejectWithValue }) => {
    try {
      const users = await getTimelineCreatedUsers(location);
      return users;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch created users');
    }
  }
);

const timelineListingSlice = createSlice({
  name: 'timelineListing',
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
    clearError: (state) => {
      state.error = null;
    },
    clearTimeline: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Timeline data fetching
      .addCase(fetchTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Created users fetching
      .addCase(fetchCreatedUsers.pending, (state) => {
        state.isLoadingUsers = true;
      })
      .addCase(fetchCreatedUsers.fulfilled, (state, action) => {
        state.isLoadingUsers = false;
        state.createdUsers = action.payload;
      })
      .addCase(fetchCreatedUsers.rejected, (state) => {
        state.isLoadingUsers = false;
        state.createdUsers = [];
      });
  },
});

export const {
  setPage,
  setPageSize,
  setColumnFilters,
  clearError,
  clearTimeline,
} = timelineListingSlice.actions;

export default timelineListingSlice.reducer;

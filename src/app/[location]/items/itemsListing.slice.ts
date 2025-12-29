import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getItemsList, ItemRow, ItemsQuery } from './itemsListing.api';

export type SortField = "code" | "description";

interface ItemsListingState {
  rows: ItemRow[];
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
  // Show All
  showAll: boolean;
}

const initialState: ItemsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: 'code', // Default to sorting by code
  sortDir: 'asc',
  columnFilters: {},
  showAll: false,
};

// Async thunk for fetching items list
export const fetchItems = createAsyncThunk(
  'itemsListing/fetchItems',
  async (
    { location, query }: { location: string; query: ItemsQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getItemsList(location, query);

      if (!response?.success) {
        return rejectWithValue(response?.message || 'Failed to fetch items');
      }

      return {
        rows: response.data.body,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch items');
    }
  }
);

const itemsListingSlice = createSlice({
  name: 'itemsListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: SortField; sortDir: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearItems: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
    setShowAll: (state, action: PayloadAction<boolean>) => {
      state.showAll = action.payload;
      state.page = 1;
    },
    addItem: (state, action: PayloadAction<ItemRow>) => {
      // Optimistic local update; source of truth remains the API.
      state.rows = [action.payload, ...state.rows];
      state.total = state.total + 1;
      state.totalPages = state.showAll ? 1 : Math.ceil(state.total / state.pageSize);
    },
    updateItem: (state, action: PayloadAction<ItemRow>) => {
      // Update in current rows if present; source of truth remains the API.
      const rowIndex = state.rows.findIndex(row => row.id === action.payload.id);
      if (rowIndex !== -1) {
        state.rows[rowIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchItems.rejected, (state, action) => {
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
  clearItems,
  setShowAll,
  addItem,
  updateItem,
} = itemsListingSlice.actions;

export default itemsListingSlice.reducer;


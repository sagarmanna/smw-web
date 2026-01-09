import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getOwners, OwnerRow, OwnersQuery } from "./owners.api";
import { SortField } from "./utils/sortOwners";

interface OwnersListingState {
  rows: OwnerRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Sorting
  sortBy?: SortField;
  sortDir: "asc" | "desc";
  // Filters
  columnFilters: Record<string, unknown>;
  activeFilter?: string;
}

/**
 * Initial state for owners listing
 * Defaults to showing active owners, sorted by last name ascending
 */
const initialState: OwnersListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: "lastName",
  sortDir: "asc",
  columnFilters: {},
  activeFilter: 'active', // Default to showing only active owners
};

export const fetchOwners = createAsyncThunk(
  "ownersListing/fetchOwners",
  async ({ location, query }: { location: string; query: OwnersQuery }, { rejectWithValue }) => {
    try {
      const response = await getOwners(location, query);

      if (response && response.success) {
        return {
          rows: response.data.body,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        };
      }

      return { rows: [], total: 0, totalPages: 0 };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch owners");
    }
  }
);

const ownersListingSlice = createSlice({
  name: "ownersListing",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: SortField; sortDir: "asc" | "desc" }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
      state.page = 1;
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1;
    },
    setActiveFilter: (state, action: PayloadAction<string | undefined>) => {
      state.activeFilter = action.payload;
      state.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearOwners: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOwners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchOwners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPage, setPageSize, setSorting, setColumnFilters, setActiveFilter, clearError, clearOwners } =
  ownersListingSlice.actions;

export default ownersListingSlice.reducer;


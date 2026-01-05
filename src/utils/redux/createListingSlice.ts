/**
 * Generic Redux slice factory
 * Creates standardized Redux slice for listing features
 */

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Standard listing state interface
 */
export interface ListingState<TData> {
  rows: TData[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDir: "asc" | "desc";
  columnFilters: Record<string, unknown>;
}

/**
 * Configuration for creating a listing slice
 */
export interface ListingSliceConfig<TData, TQuery> {
  /**
   * Slice name (e.g., "citiesListing", "provincesListing")
   */
  name: string;

  /**
   * Entity name for error messages (e.g., "city", "province")
   */
  entityName: string;

  /**
   * Function to fetch list data
   */
  fetchFn: (location: string, query: TQuery) => Promise<{
    success: boolean;
    data?: {
      body: TData[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
    message?: string;
  } | null>;
}

/**
 * Creates a Redux slice for a listing feature
 */
export function createListingSlice<TData, TQuery>(config: ListingSliceConfig<TData, TQuery>) {
  const { name, entityName, fetchFn } = config;

  const initialState: ListingState<TData> = {
    rows: [],
    total: 0,
    totalPages: 0,
    isLoading: false,
    error: null,
    page: 1,
    pageSize: 20,
    sortBy: undefined,
    sortDir: "asc",
    columnFilters: {},
  };

  // Create async thunk for fetching data
  const fetchThunk = createAsyncThunk(
    `${name}/fetch`,
    async ({ location, query }: { location: string; query: TQuery }, { rejectWithValue }) => {
      try {
        const response = await fetchFn(location, query);

        if (response && response.success && response.data) {
          return {
            rows: response.data.body,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages,
          };
        }

        return { rows: [], total: 0, totalPages: 0 };
      } catch (error) {
        return rejectWithValue(error instanceof Error ? error.message : `Failed to fetch ${entityName}s`);
      }
    }
  );

  // Create slice
  const slice = createSlice({
    name,
    initialState,
    reducers: {
      setPage: (state, action: PayloadAction<number>) => {
        state.page = action.payload;
      },
      setPageSize: (state, action: PayloadAction<number>) => {
        state.pageSize = action.payload;
        state.page = 1;
      },
      setSorting: (state, action: PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }>) => {
        state.sortBy = action.payload.sortBy;
        state.sortDir = action.payload.sortDir;
        state.page = 1;
      },
      setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
        state.columnFilters = action.payload;
        state.page = 1;
      },
      setActiveFilter: (state, _action: PayloadAction<string | undefined>) => {
        // Dummy reducer required by useGenericListing
        state.page = 1;
      },
      clearError: (state) => {
        state.error = null;
      },
      clearData: (state) => {
        state.rows = [];
        state.total = 0;
        state.totalPages = 0;
        state.page = 1;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(fetchThunk.pending, (state) => {
          state.isLoading = true;
          state.error = null;
        })
        .addCase(fetchThunk.fulfilled, (state, action) => {
          state.isLoading = false;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          state.rows = action.payload.rows as any;
          state.total = action.payload.total;
          state.totalPages = action.payload.totalPages;
          state.error = null;
        })
        .addCase(fetchThunk.rejected, (state, action) => {
          state.isLoading = false;
          state.error = action.payload as string;
        });
    },
  });

  return {
    reducer: slice.reducer,
    actions: slice.actions,
    fetchThunk,
  };
}


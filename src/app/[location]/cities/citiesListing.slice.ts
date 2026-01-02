import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getCities, CityRow, CitiesQuery } from "./cities.api";

interface CitiesListingState {
  rows: CityRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Sorting
  sortBy?: string;
  sortDir: "asc" | "desc";
  // Filters
  columnFilters: Record<string, unknown>;
}

const initialState: CitiesListingState = {
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

export const fetchCities = createAsyncThunk(
  "citiesListing/fetchCities",
  async ({ location, query }: { location: string; query: CitiesQuery }, { rejectWithValue }) => {
    try {
      const response = await getCities(location, query);

      if (response && response.success) {
        return {
          rows: response.data.body,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        };
      }

      return { rows: [], total: 0, totalPages: 0 };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch cities");
    }
  }
);

const citiesListingSlice = createSlice({
  name: "citiesListing",
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
      // Cities don't have active/inactive filter, but this is required by useGenericListing
      state.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCities: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchCities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setPage, setPageSize, setSorting, setColumnFilters, setActiveFilter, clearError, clearCities } =
  citiesListingSlice.actions;

export default citiesListingSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday,
  HolidayRow,
  HolidayQuery,
  CreateHolidayRequest,
  UpdateHolidayRequest,
} from "./holidays.api";
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE } from "./constants";

interface HolidaysListingState {
  rows: HolidayRow[];
  isLoading: boolean;
  error: string | null;
  // Server-side pagination
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  // Sorting
  sortBy?: string;
  sortDir: "asc" | "desc";
}

const initialState: HolidaysListingState = {
  rows: [],
  isLoading: false,
  error: null,
  page: DEFAULT_PAGE,
  pageSize: DEFAULT_PAGE_SIZE,
  total: 0,
  totalPages: 0,
  sortBy: undefined,
  sortDir: "asc",
};

/**
 * Async thunk for fetching holidays with server-side pagination
 * Fetches data from API and updates Redux state
 * Called on initial page load and when pagination/sorting changes
 * 
 * @param location - Current location context
 * @param query - Query parameters for pagination and sorting
 */
export const fetchHolidays = createAsyncThunk(
  "holidaysListing/fetchHolidays",
  async (
    { location, query }: { location: string; query?: HolidayQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getHolidays(location, query);

      if (response && response.success && response.data) {
        return {
          rows: response.data.body,
          pagination: response.data.pagination,
        };
      }

      return rejectWithValue(response?.message || "Failed to fetch holidays");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch holidays"
      );
    }
  }
);

/**
 * Async thunk for creating a new holiday
 * Flow: API call first → Update Redux state
 * 
 * @param location - Current location context
 * @param data - Holiday data to create
 */
export const addHoliday = createAsyncThunk(
  "holidaysListing/addHoliday",
  async (
    { location, data }: { location: string; data: CreateHolidayRequest },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Call API first
      const response = await createHoliday(location, data);

      if (response && response.success && response.data) {
        // Step 2: Return the created holiday to be added to Redux state
        return {
          id: response.data.id,
          date: response.data.date,
          description: response.data.description,
        } as HolidayRow;
      }

      return rejectWithValue(response?.message || "Failed to create holiday");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create holiday"
      );
    }
  }
);

/**
 * Async thunk for updating an existing holiday
 * Flow: API call first → Update Redux state
 * 
 * @param location - Current location context
 * @param data - Holiday data to update (includes id)
 */
export const updateHolidayThunk = createAsyncThunk(
  "holidaysListing/updateHoliday",
  async (
    { location, data }: { location: string; data: UpdateHolidayRequest },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Call API first (data already contains id)
      const response = await updateHoliday(location, data);

      if (response && response.success && response.data) {
        // Step 2: Return the updated holiday to be updated in Redux state
        return {
          id: response.data.id,
          date: response.data.date,
          description: response.data.description,
        } as HolidayRow;
      }

      return rejectWithValue(response?.message || "Failed to update holiday");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update holiday"
      );
    }
  }
);

/**
 * Async thunk for deleting a holiday
 * Flow: API call first → Remove from Redux state
 * 
 * @param location - Current location context
 * @param id - ID of holiday to delete
 */
export const deleteHolidayThunk = createAsyncThunk(
  "holidaysListing/deleteHoliday",
  async (
    { location, id }: { location: string; id: number },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Call API first
      const response = await deleteHoliday(location, id);

      if (response && response.success) {
        // Step 2: Return the deleted ID to be removed from Redux state
        return id;
      }

      return rejectWithValue(response?.message || "Failed to delete holiday");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete holiday"
      );
    }
  }
);

const holidaysListingSlice = createSlice({
  name: "holidaysListing",
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = DEFAULT_PAGE; // Reset to first page when page size changes
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
      state.page = DEFAULT_PAGE; // Reset to first page when sorting changes
    },
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = DEFAULT_PAGE;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch holidays (called once on initial load and when pagination/sorting changes)
      .addCase(fetchHolidays.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHolidays.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.pagination.total;
        state.totalPages = action.payload.pagination.totalPages;
        state.page = action.payload.pagination.page;
        state.error = null;
      })
      .addCase(fetchHolidays.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add new holiday (API called first, then update Redux)
      .addCase(addHoliday.pending, (state) => {
        state.error = null;
      })
      .addCase(addHoliday.fulfilled, (state, action) => {
        // Add the new holiday to the beginning of the array
        state.rows = [action.payload, ...state.rows];
        // Update total count
        state.total += 1;
        // Recalculate total pages
        state.totalPages = Math.ceil(state.total / state.pageSize);
      })
      .addCase(addHoliday.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update existing holiday (API called first, then update Redux)
      .addCase(updateHolidayThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateHolidayThunk.fulfilled, (state, action) => {
        // Update the holiday in the array
        const index = state.rows.findIndex((row) => row.id === action.payload.id);
        if (index !== -1) {
          state.rows[index] = action.payload;
        }
      })
      .addCase(updateHolidayThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete holiday (API called first, then remove from Redux)
      .addCase(deleteHolidayThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteHolidayThunk.fulfilled, (state, action) => {
        // Remove the holiday from the array
        state.rows = state.rows.filter((row) => row.id !== action.payload);
        // Update total count
        state.total = Math.max(0, state.total - 1);
        // Recalculate total pages
        state.totalPages = Math.ceil(state.total / state.pageSize);
        // If current page is empty and not the first page, go to previous page
        if (state.rows.length === 0 && state.page > 1) {
          state.page = state.page - 1;
        }
      })
      .addCase(deleteHolidayThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setPageSize,
  setSorting,
  clearError,
  clearData,
} = holidaysListingSlice.actions;

export default holidaysListingSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
  getReferralSources,
  createReferralSource,
  updateReferralSource,
  deleteReferralSource,
  ReferralSourceRow,
  ReferralSourceQuery,
  CreateReferralSourceRequest,
  UpdateReferralSourceRequest,
} from "./referralSource.api";

interface ReferralSourceListingState {
  rows: ReferralSourceRow[];
  isLoading: boolean;
  error: string | null;
  sortBy?: string;
  sortDir: "asc" | "desc";
}

const initialState: ReferralSourceListingState = {
  rows: [],
  isLoading: false,
  error: null,
  sortBy: undefined,
  sortDir: "asc",
};

/**
 * Async thunk for fetching referral sources
 * Fetches data from API and updates Redux state
 * Called on initial page load and when sorting changes
 * 
 * @param location - Current location context
 * @param query - Optional query parameters for sorting
 */
export const fetchReferralSources = createAsyncThunk(
  "referralSourceListing/fetchReferralSources",
  async (
    { location, query }: { location: string; query?: ReferralSourceQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getReferralSources(location, query);

      if (response && response.success && response.data) {
        return {
          rows: response.data,
        };
      }

      return rejectWithValue(response?.message || "Failed to fetch referral sources");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to fetch referral sources"
      );
    }
  }
);

/**
 * Async thunk for creating a new referral source
 * Flow: API call first → Update Redux state
 * 
 * @param location - Current location context
 * @param data - Referral source data to create
 */
export const addReferralSource = createAsyncThunk(
  "referralSourceListing/addReferralSource",
  async (
    { location, data }: { location: string; data: CreateReferralSourceRequest },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Call API first
      const response = await createReferralSource(location, data);

      if (response && response.success && response.data) {
        // Step 2: Return the created referral source to be added to Redux state
        return {
          id: response.data.id,
          name: response.data.name,
        } as ReferralSourceRow;
      }

      return rejectWithValue(response?.message || "Failed to create referral source");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to create referral source"
      );
    }
  }
);

/**
 * Async thunk for updating an existing referral source
 * Flow: API call first → Update Redux state
 * 
 * @param location - Current location context
 * @param data - Referral source data to update (includes id)
 */
export const updateReferralSourceThunk = createAsyncThunk(
  "referralSourceListing/updateReferralSource",
  async (
    { location, data }: { location: string; data: UpdateReferralSourceRequest },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Call API first (data already contains id)
      const response = await updateReferralSource(location, data);

      if (response && response.success && response.data) {
        // Step 2: Return the updated referral source to be updated in Redux state
        return {
          id: response.data.id,
          name: response.data.name,
        } as ReferralSourceRow;
      }

      return rejectWithValue(response?.message || "Failed to update referral source");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to update referral source"
      );
    }
  }
);

/**
 * Async thunk for deleting a referral source
 * Flow: API call first → Remove from Redux state
 * 
 * @param location - Current location context
 * @param id - ID of referral source to delete
 */
export const deleteReferralSourceThunk = createAsyncThunk(
  "referralSourceListing/deleteReferralSource",
  async (
    { location, id }: { location: string; id: number },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Call API first
      const response = await deleteReferralSource(location, id);

      if (response && response.success) {
        // Step 2: Return the deleted ID to be removed from Redux state
        return id;
      }

      return rejectWithValue(response?.message || "Failed to delete referral source");
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Failed to delete referral source"
      );
    }
  }
);

const referralSourceListingSlice = createSlice({
  name: "referralSourceListing",
  initialState,
  reducers: {
    setSorting: (state, action: PayloadAction<{ sortBy?: string; sortDir: "asc" | "desc" }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearData: (state) => {
      state.rows = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch referral sources (called once on initial load)
      .addCase(fetchReferralSources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReferralSources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.error = null;
      })
      .addCase(fetchReferralSources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add new referral source (API called first, then update Redux)
      .addCase(addReferralSource.pending, (state) => {
        state.error = null;
      })
      .addCase(addReferralSource.fulfilled, (state, action) => {
        // Add the new referral source to the beginning of the array
        state.rows = [action.payload, ...state.rows];
      })
      .addCase(addReferralSource.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Update existing referral source (API called first, then update Redux)
      .addCase(updateReferralSourceThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(updateReferralSourceThunk.fulfilled, (state, action) => {
        // Update the referral source in the array
        const index = state.rows.findIndex((row) => row.id === action.payload.id);
        if (index !== -1) {
          state.rows[index] = action.payload;
        }
      })
      .addCase(updateReferralSourceThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Delete referral source (API called first, then remove from Redux)
      .addCase(deleteReferralSourceThunk.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteReferralSourceThunk.fulfilled, (state, action) => {
        // Remove the referral source from the array
        state.rows = state.rows.filter((row) => row.id !== action.payload);
      })
      .addCase(deleteReferralSourceThunk.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSorting,
  clearError,
  clearData,
} = referralSourceListingSlice.actions;

export default referralSourceListingSlice.reducer;

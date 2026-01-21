import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { TestEmailRow, UpdateTestEmailRequest } from "./types";
import { getTestEmailList, updateTestEmail as updateTestEmailApi } from "./testEmail.api";

function handleApiError(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

interface TestEmailListingState {
  rows: TestEmailRow[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TestEmailListingState = {
  rows: [],
  isLoading: false,
  error: null,
};

export const fetchTestEmails = createAsyncThunk(
  "testEmailListing/fetchTestEmails",
  async ({ location }: { location: string }, { rejectWithValue }) => {
    try {
      const response = await getTestEmailList(location);
      if (response?.success && response.data?.body) {
        return response.data.body;
      }
      return [];
    } catch (error) {
      return rejectWithValue(handleApiError(error, "Failed to fetch test emails"));
    }
  }
);

export const patchTestEmail = createAsyncThunk(
  "testEmailListing/patchTestEmail",
  async (
    { location, id, data }: { location: string; id: number; data: UpdateTestEmailRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateTestEmailApi(location, id, data);
      if (response?.success && response.data) {
        return response.data;
      }
      return rejectWithValue("Failed to update test email");
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      return rejectWithValue(apiError.message || "Failed to update test email");
    }
  }
);

const testEmailListingSlice = createSlice({
  name: "testEmailListing",
  initialState,
  reducers: {
    resetTestEmailState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTestEmails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTestEmails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload;
        state.error = null;
      })
      .addCase(fetchTestEmails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(patchTestEmail.pending, (state) => {
        state.error = null;
      })
      .addCase(patchTestEmail.fulfilled, (state, action) => {
        const updated = action.payload;
        const idx = state.rows.findIndex((r) => r.id === updated.id);
        if (idx !== -1) state.rows[idx] = updated;
      })
      .addCase(patchTestEmail.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { resetTestEmailState } = testEmailListingSlice.actions;
export default testEmailListingSlice.reducer;


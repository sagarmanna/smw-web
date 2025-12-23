import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getEnrolmentDetails, 
  EnrolmentDetailsApiResponse,
  transformApiResponse,
} from './enrolment-details.api';
import type { EnrolmentInfo } from '../types';

interface EnrolmentState {
  enrolmentInfo: EnrolmentInfo | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  currentEnrolmentId: string | null;
}

const initialState: EnrolmentState = {
  enrolmentInfo: null,
  isLoading: false,
  error: null,
  lastFetched: null,
  currentEnrolmentId: null,
};

// Async thunk for fetching enrolment info
export const fetchEnrolment = createAsyncThunk(
  'enrolment/fetchEnrolment',
  async (
    { location, enrolmentId }: { location: string; enrolmentId: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await getEnrolmentDetails(location, enrolmentId);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to fetch enrolment info');
      }

      const transformedData = transformApiResponse(result);

      return { data: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch enrolment info');
    }
  }
);

const enrolmentSlice = createSlice({
  name: 'enrolment',
  initialState,
  reducers: {
    clearEnrolment: (state) => {
      state.enrolmentInfo = null;
      state.error = null;
      state.lastFetched = null;
      state.currentEnrolmentId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCache: (state) => {
      state.lastFetched = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolment.pending, (state, action) => {
        const { enrolmentId } = action.meta.arg as { location: string; enrolmentId: string };
        
        if (state.currentEnrolmentId !== null && state.currentEnrolmentId !== enrolmentId) {
          state.enrolmentInfo = null;
          state.lastFetched = null;
        }
        
        state.currentEnrolmentId = enrolmentId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrolment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.enrolmentInfo = action.payload.data;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchEnrolment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearEnrolment, 
  clearError, 
  clearCache,
} = enrolmentSlice.actions;
export default enrolmentSlice.reducer;


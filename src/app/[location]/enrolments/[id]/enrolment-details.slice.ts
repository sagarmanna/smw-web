import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getEnrolmentDetails, 
  EnrolmentDetailsApiResponse,
  transformApiResponse,
  updateEnrolmentDetails,
  adjustEnrolmentEndDate,
  permanentScheduleChange,
} from './enrolment-details.api';
import type { EnrolmentInfo, EnrolmentDetails, EnrolmentSchedule } from '../types';

interface EnrolmentState {
  enrolmentInfo: EnrolmentInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentEnrolmentId: string | null;
}

const initialState: EnrolmentState = {
  enrolmentInfo: null,
  isLoading: false,
  isSaving: false,
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

// Async thunk for updating enrolment details
export const updateEnrolment = createAsyncThunk(
  'enrolment/updateEnrolment',
  async (
    { location, enrolmentId, data }: { location: string; enrolmentId: string; data: Partial<EnrolmentDetails> },
    { rejectWithValue }
  ) => {
    try {
      const updateData = {
        rate: data.rate,
        autoRenewal: data.autoRenewal,
        online: data.online,
      };
      
      const result = await updateEnrolmentDetails(location, enrolmentId, updateData);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update enrolment details');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update enrolment details');
    }
  }
);

// Async thunk for adjusting enrolment end date
export const adjustEndDate = createAsyncThunk(
  'enrolment/adjustEndDate',
  async (
    { location, enrolmentId, endDate }: { location: string; enrolmentId: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await adjustEnrolmentEndDate(location, enrolmentId, { endDate });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to adjust enrolment end date');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to adjust enrolment end date');
    }
  }
);

// Async thunk for permanent schedule change
export const changeSchedulePermanently = createAsyncThunk(
  'enrolment/changeSchedulePermanently',
  async (
    { location, enrolmentId, startingDate }: { location: string; enrolmentId: string; startingDate: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await permanentScheduleChange(location, enrolmentId, { startingDate });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to perform permanent schedule change');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to perform permanent schedule change');
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
    // Update details in local state
    updateDetails: (state, action: PayloadAction<Partial<EnrolmentDetails>>) => {
      if (state.enrolmentInfo) {
        state.enrolmentInfo.details = {
          ...state.enrolmentInfo.details,
          ...action.payload,
        };
      }
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
      })
      // Update enrolment reducers
      .addCase(updateEnrolment.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateEnrolment.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update state from API response
        if (state.enrolmentInfo && action.payload) {
          const { data } = action.payload;
          state.enrolmentInfo.details = {
            ...state.enrolmentInfo.details,
            rate: data.rate,
            autoRenewal: data.autoRenewal,
            online: data.online,
          };
        }
        state.error = null;
      })
      .addCase(updateEnrolment.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Adjust end date reducers
      .addCase(adjustEndDate.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(adjustEndDate.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update schedule end date from API response
        if (state.enrolmentInfo && action.payload) {
          const { data } = action.payload;
          // Format date for display (assuming API returns YYYY-MM-DD)
          const formattedDate = data.endDate ? new Date(data.endDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : state.enrolmentInfo.schedule.endDate;
          
          state.enrolmentInfo.schedule = {
            ...state.enrolmentInfo.schedule,
            endDate: formattedDate,
          };
        }
        state.error = null;
      })
      .addCase(adjustEndDate.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Permanent schedule change reducers
      .addCase(changeSchedulePermanently.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(changeSchedulePermanently.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update schedule start date from API response
        if (state.enrolmentInfo && action.payload) {
          const { data } = action.payload;
          // Format date for display (assuming API returns YYYY-MM-DD)
          const formattedDate = data.startingDate ? new Date(data.startingDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : state.enrolmentInfo.schedule.startDate;
          
          state.enrolmentInfo.schedule = {
            ...state.enrolmentInfo.schedule,
            startDate: formattedDate,
          };
        }
        state.error = null;
      })
      .addCase(changeSchedulePermanently.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearEnrolment, 
  clearError, 
  clearCache,
  updateDetails,
} = enrolmentSlice.actions;
export default enrolmentSlice.reducer;


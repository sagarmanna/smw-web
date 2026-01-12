import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getEnrolmentDetails,
  getEnrolmentSchedule,
  getEnrolmentScheduleHistory,
  getEnrolmentPaymentFrequency,
  getEnrolmentLessons,
  getEnrolmentHistory,
  transformApiResponse,
  updateEnrolmentDetails,
  adjustEnrolmentEndDate,
  permanentScheduleChange,
  updateEnrolmentDiscounts,
  updateEnrolmentPaymentFrequency,
  type PaginationInfo,
} from './enrolment-details.api';
import type { EnrolmentInfo, EnrolmentDetails, EnrolmentDiscounts, EnrolmentPaymentFrequency, EnrolmentHistory } from '../types';

interface EnrolmentState {
  enrolmentInfo: EnrolmentInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentEnrolmentId: string | null;
  // History state with pagination
  historyData: EnrolmentHistory[];
  historyPagination: PaginationInfo | null;
  historyLoading: boolean;
  historyError: string | null;
}

const initialState: EnrolmentState = {
  enrolmentInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentEnrolmentId: null,
  historyData: [],
  historyPagination: null,
  historyLoading: false,
  historyError: null,
};

// Async thunk for fetching enrolment info
export const fetchEnrolment = createAsyncThunk(
  'enrolment/fetchEnrolment',
  async (
    { location, enrolmentId }: { location: string; enrolmentId: string },
    { rejectWithValue }
  ) => {
    try {
      // First fetch details to determine enrolment type (required)
      const detailsResult = await getEnrolmentDetails(location, enrolmentId);
      if (!detailsResult || !detailsResult.success) {
        throw new Error(detailsResult?.message || 'Failed to fetch enrolment info');
      }

      // Determine enrolment type from details
      const programType = detailsResult.data?.body?.programType;
      const isPrivateEnrolment = programType?.toLowerCase() === 'private';

      // Build array of parallel API calls - conditionally include payment frequency
      const parallelCalls: Promise<unknown>[] = [
        getEnrolmentSchedule(location, enrolmentId),
        getEnrolmentScheduleHistory(location, enrolmentId),
        getEnrolmentLessons(location, enrolmentId),
      ];

      // Only fetch payment frequency for private enrolments
      if (isPrivateEnrolment) {
        parallelCalls.push(getEnrolmentPaymentFrequency(location, enrolmentId));
      }

      // Fetch remaining APIs in parallel, but handle failures gracefully
      const parallelResults = await Promise.allSettled(parallelCalls);

      // Details API is required - already fetched and validated above
      const details = detailsResult;

      // Extract results from parallel calls (order: schedule, scheduleHistory, lessons, [paymentFrequency if private])
      const scheduleResult = parallelResults[0];
      const scheduleHistoryResult = parallelResults[1];
      const lessonsResult = parallelResults[2];
      const paymentFrequencyResult = isPrivateEnrolment ? parallelResults[3] : undefined;

      // Schedule API is optional - log error but don't fail the entire fetch
      let schedule: Awaited<ReturnType<typeof getEnrolmentSchedule>> = null;
      if (scheduleResult.status === 'fulfilled') {
        schedule = scheduleResult.value as Awaited<ReturnType<typeof getEnrolmentSchedule>>;
        if (!schedule || !schedule.success) {
          console.warn('Schedule API failed:', schedule?.message || 'Unknown error');
        }
      } else {
        console.warn('Schedule API error:', scheduleResult.reason);
      }

      // Schedule History API is optional - log error but don't fail the entire fetch
      let scheduleHistory: Awaited<ReturnType<typeof getEnrolmentScheduleHistory>> = null;
      if (scheduleHistoryResult.status === 'fulfilled') {
        scheduleHistory = scheduleHistoryResult.value as Awaited<ReturnType<typeof getEnrolmentScheduleHistory>>;
        if (!scheduleHistory || !scheduleHistory.success) {
          console.warn('Schedule History API failed:', scheduleHistory?.message || 'Unknown error');
        }
      } else {
        console.warn('Schedule History API error:', scheduleHistoryResult.reason);
      }

      // Payment Frequency API is optional - only fetched for private enrolments
      let paymentFrequency: Awaited<ReturnType<typeof getEnrolmentPaymentFrequency>> = null;
      if (isPrivateEnrolment && paymentFrequencyResult) {
        if (paymentFrequencyResult.status === 'fulfilled') {
          paymentFrequency = paymentFrequencyResult.value as Awaited<ReturnType<typeof getEnrolmentPaymentFrequency>>;
          if (!paymentFrequency || !paymentFrequency.success) {
            console.warn('Payment Frequency API failed:', paymentFrequency?.message || 'Unknown error');
          }
        } else {
          console.warn('Payment Frequency API error:', paymentFrequencyResult.reason);
        }
      }

      // Lessons API is optional - log error but don't fail the entire fetch
      let lessons: Awaited<ReturnType<typeof getEnrolmentLessons>> = null;
      if (lessonsResult.status === 'fulfilled') {
        lessons = lessonsResult.value as Awaited<ReturnType<typeof getEnrolmentLessons>>;
        if (!lessons || !lessons.success) {
          console.warn('Lessons API failed:', lessons?.message || 'Unknown error');
        }
      } else {
        console.warn('Lessons API error:', lessonsResult.reason);
      }

      const transformedData = transformApiResponse(details, schedule, scheduleHistory, paymentFrequency, lessons);

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
        rates: data.rates, // Include rates array for multiple rates support
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

// Async thunk for updating enrolment discounts
export const updateDiscounts = createAsyncThunk(
  'enrolment/updateDiscounts',
  async (
    { location, enrolmentId, data }: { location: string; enrolmentId: string; data: Partial<EnrolmentDiscounts> },
    { rejectWithValue }
  ) => {
    try {
      const updateData = {
        pfDiscount: data.pfDiscount,
        multipleEnrolDiscount: data.multipleEnrolDiscount,
      };
      
      const result = await updateEnrolmentDiscounts(location, enrolmentId, updateData);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update enrolment discounts');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update enrolment discounts');
    }
  }
);

// Async thunk for fetching enrolment history with pagination
export const fetchEnrolmentHistory = createAsyncThunk(
  'enrolment/fetchEnrolmentHistory',
  async (
    { location, enrolmentId, page = 1 }: { location: string; enrolmentId: string; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getEnrolmentHistory(location, enrolmentId, page);
      
      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch enrolment history');
      }

      return {
        data: apiResult.data.body || [],
        pagination: apiResult.data.pagination,
        enrolmentId,
      };
    } catch (error) {
      console.error('Error in fetchEnrolmentHistory:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch enrolment history data'
      );
    }
  }
);

// Async thunk for updating enrolment payment frequency
export const updatePaymentFrequency = createAsyncThunk(
  'enrolment/updatePaymentFrequency',
  async (
    { location, enrolmentId, data }: { location: string; enrolmentId: string; data: { paymentFrequency: string; effectiveDate: string } },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateEnrolmentPaymentFrequency(location, enrolmentId, data);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update enrolment payment frequency');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update enrolment payment frequency');
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
      state.historyData = [];
      state.historyPagination = null;
      state.historyError = null;
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
    // Update payment frequency in local state
    updatePaymentFrequencyState: (state, action: PayloadAction<Partial<EnrolmentPaymentFrequency>>) => {
      if (state.enrolmentInfo) {
        state.enrolmentInfo.paymentFrequency = {
          ...state.enrolmentInfo.paymentFrequency,
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
        // Note: We don't update state here because fetchEnrolment will be called
        // to refresh the complete enrolment data including updated rates
        // This ensures we have the latest data from the server
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
        // Update schedule end date from API response (API returns formatted date)
        if (state.enrolmentInfo && action.payload) {
          const { data } = action.payload;
          state.enrolmentInfo.schedule = {
            ...state.enrolmentInfo.schedule,
            endDate: data.endDate || state.enrolmentInfo.schedule.endDate,
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
        // Update schedule start date from API response (API returns formatted date)
        if (state.enrolmentInfo && action.payload) {
          const { data } = action.payload;
          state.enrolmentInfo.schedule = {
            ...state.enrolmentInfo.schedule,
            startDate: data.startingDate || state.enrolmentInfo.schedule.startDate,
          };
        }
        state.error = null;
      })
      .addCase(changeSchedulePermanently.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update discounts reducers
      .addCase(updateDiscounts.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateDiscounts.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update discounts from API response
        if (state.enrolmentInfo && action.payload) {
          const { data } = action.payload;
          state.enrolmentInfo.discounts = {
            ...state.enrolmentInfo.discounts,
            pfDiscount: data.pfDiscount,
            multipleEnrolDiscount: data.multipleEnrolDiscount,
          };
        }
        state.error = null;
      })
      .addCase(updateDiscounts.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update payment frequency reducers
      .addCase(updatePaymentFrequency.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updatePaymentFrequency.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update payment frequency from API response
        if (state.enrolmentInfo && action.payload) {
          const { data } = action.payload;
          state.enrolmentInfo.paymentFrequency = {
            ...state.enrolmentInfo.paymentFrequency,
            paymentFrequency: data.paymentFrequency,
          };
        }
        state.error = null;
      })
      .addCase(updatePaymentFrequency.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Fetch enrolment history reducers
      .addCase(fetchEnrolmentHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchEnrolmentHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = action.payload.data.map((item) => ({
          id: item.id,
          message: item.message || "",
          createdOn: item.createdOn || "",
        }));
        state.historyPagination = action.payload.pagination || null;
        state.historyError = null;
      })
      .addCase(fetchEnrolmentHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { 
  clearEnrolment, 
  clearError, 
  clearCache,
  updateDetails,
  updatePaymentFrequencyState,
} = enrolmentSlice.actions;
export default enrolmentSlice.reducer;


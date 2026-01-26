import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getEnrolmentDetails,
  getEnrolmentSchedule,
  getEnrolmentScheduleHistory,
  getEnrolmentPaymentFrequency,
  getEnrolmentLessons,
  getEnrolmentLessonsWithPagination,
  getEnrolmentHistory,
  getEnrolmentEmailStatement,
  transformApiResponse,
  updateEnrolmentDetails,
  adjustEnrolmentEndDate,
  adjustGroupEnrolmentEndDate,
  updateEnrolmentDiscounts,
  updateGroupEnrolmentDiscount,
  updateEnrolmentPaymentFrequency,
  type PaginationInfo,
  type EnrolmentEmailStatementBody,
} from './enrolment-details.api';
import type { EnrolmentInfo, EnrolmentDetails, EnrolmentDiscounts, EnrolmentPaymentFrequency, EnrolmentHistory, EnrolmentLesson } from '../types';

interface EnrolmentState {
  enrolmentInfo: EnrolmentInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentEnrolmentId: string | null;
  currentLocation: string | null;
  // History state with pagination
  historyData: EnrolmentHistory[];
  historyPagination: PaginationInfo | null;
  historyLoading: boolean;
  historyError: string | null;
  // Lessons state with pagination (only for group enrolments)
  lessonsData: EnrolmentLesson[];
  lessonsPagination: PaginationInfo | null;
  lessonsLoading: boolean;
  lessonsError: string | null;
  // Email statement state (for group enrolments)
  emailStatement: EnrolmentEmailStatementBody | null;
  emailStatementLoading: boolean;
  emailStatementError: string | null;
}

const initialState: EnrolmentState = {
  enrolmentInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentEnrolmentId: null,
  currentLocation: null,
  historyData: [],
  historyPagination: null,
  historyLoading: false,
  historyError: null,
  lessonsData: [],
  lessonsPagination: null,
  lessonsLoading: false,
  lessonsError: null,
  emailStatement: null,
  emailStatementLoading: false,
  emailStatementError: null,
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

      // Build array of parallel API calls
      // Always fetch: schedule, scheduleHistory
      // Conditionally fetch: lessons (only for private enrolments), paymentFrequency (only for private enrolments)
      const parallelCalls: Array<Promise<unknown>> = [
        getEnrolmentSchedule(location, enrolmentId),
        getEnrolmentScheduleHistory(location, enrolmentId),
      ];

      // Only fetch lessons for private enrolments (group enrolments use paginated endpoint)
      if (isPrivateEnrolment) {
        parallelCalls.push(getEnrolmentLessons(location, enrolmentId));
      }

      // Only fetch payment frequency for private enrolments
      if (isPrivateEnrolment) {
        parallelCalls.push(getEnrolmentPaymentFrequency(location, enrolmentId));
      }

      // Fetch remaining APIs in parallel, but handle failures gracefully
      const parallelResults = await Promise.allSettled(parallelCalls);

      // Details API is required - already fetched and validated above
      const details = detailsResult;

      // Extract results from parallel calls
      // Order: schedule, scheduleHistory, [lessons if private], [paymentFrequency if private]
      const scheduleResult = parallelResults[0];
      const scheduleHistoryResult = parallelResults[1];
      const lessonsResult = isPrivateEnrolment ? parallelResults[2] : undefined;
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
      if (isPrivateEnrolment && paymentFrequencyResult !== undefined) {
        if (paymentFrequencyResult.status === 'fulfilled') {
          paymentFrequency = paymentFrequencyResult.value as Awaited<ReturnType<typeof getEnrolmentPaymentFrequency>>;
          if (!paymentFrequency || !paymentFrequency.success) {
            console.warn('Payment Frequency API failed:', paymentFrequency?.message || 'Unknown error');
          }
        } else if (paymentFrequencyResult.status === 'rejected') {
          console.warn('Payment Frequency API error:', paymentFrequencyResult.reason);
        }
      }

      // Lessons API - only fetch for private enrolments
      // Group enrolments use paginated endpoint separately (fetchEnrolmentLessons thunk)
      let lessons: Awaited<ReturnType<typeof getEnrolmentLessons>> = null;
      if (isPrivateEnrolment && lessonsResult !== undefined) {
        if (lessonsResult.status === 'fulfilled') {
          lessons = lessonsResult.value as Awaited<ReturnType<typeof getEnrolmentLessons>>;
          if (!lessons || !lessons.success) {
            console.warn('Lessons API failed:', lessons?.message || 'Unknown error');
          }
        } else {
          console.warn('Lessons API error:', lessonsResult.reason);
        }
      }
      // Note: For group enrolments, lessons will be null here (fetched separately via paginated endpoint)

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

// Async thunk for adjusting private enrolment end date
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

// Async thunk for adjusting group enrolment end date
export const adjustGroupEndDate = createAsyncThunk(
  'enrolment/adjustGroupEndDate',
  async (
    { location, enrolmentId, endDate }: { location: string; enrolmentId: string; endDate: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await adjustGroupEnrolmentEndDate(location, enrolmentId, { endDate });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to adjust group enrolment end date');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to adjust group enrolment end date');
    }
  }
);

// Async thunk for updating enrolment discounts
export const updateDiscounts = createAsyncThunk(
  'enrolment/updateDiscounts',
  async (
    { location, enrolmentId, data, enrolmentType }: { location: string; enrolmentId: string; data: Partial<EnrolmentDiscounts>; enrolmentType?: 'private' | 'group' },
    { rejectWithValue }
  ) => {
    try {
      let result;
      
      if (enrolmentType === 'group') {
        // Use group enrolment discount API
        const updateData = {
          discount: data.discount,
          discountType: data.discountType,
        };
        result = await updateGroupEnrolmentDiscount(location, enrolmentId, updateData);
      } else {
        // Use private enrolment discount API
        const updateData = {
          pfDiscount: data.pfDiscount,
          multipleEnrolDiscount: data.multipleEnrolDiscount,
        };
        result = await updateEnrolmentDiscounts(location, enrolmentId, updateData);
      }

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update enrolment discounts');
      }

      // Return enrolmentType so reducer can handle it properly if needed
      // Note: Discounts are refreshed via forceRefresh() in the hook, so we don't need to return discount data
      return { data: result.data, enrolmentType };
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

// Async thunk for fetching enrolment lessons with pagination (for group enrolments only)
export const fetchEnrolmentLessons = createAsyncThunk(
  'enrolment/fetchEnrolmentLessons',
  async (
    { location, enrolmentId, page = 1, limit = 10 }: { location: string; enrolmentId: string; page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getEnrolmentLessonsWithPagination(location, enrolmentId, page, limit);
      
      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch enrolment lessons');
      }

      const lessonsData = apiResult.data.body || [];
      
      // Create default pagination if API doesn't provide it
      const defaultPagination = {
        page,
        limit,
        total: lessonsData.length,
        totalPages: 1,
      };

      return {
        data: lessonsData,
        pagination: apiResult.data.pagination || defaultPagination,
        enrolmentId,
      };
    } catch (error) {
      console.error('Error in fetchEnrolmentLessons:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch enrolment lessons data'
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

// Async thunk for fetching enrolment email statement (for group enrolments)
export const fetchEmailStatement = createAsyncThunk(
  'enrolment/fetchEmailStatement',
  async (
    { location, enrolmentId }: { location: string; enrolmentId: string },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getEnrolmentEmailStatement(location, enrolmentId);

      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch enrolment email statement');
      }

      return {
        data: apiResult.data.body,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch enrolment email statement'
      );
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
      state.currentLocation = null;
      state.historyData = [];
      state.historyPagination = null;
      state.historyError = null;
      state.lessonsData = [];
      state.lessonsPagination = null;
      state.lessonsError = null;
      state.emailStatement = null;
      state.emailStatementError = null;
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
        const { location, enrolmentId } = action.meta.arg as { location: string; enrolmentId: string };
        
        // Clear data when switching enrollments or locations to avoid stale data
        if (
          (state.currentEnrolmentId !== null && state.currentEnrolmentId !== enrolmentId) ||
          (state.currentLocation !== null && state.currentLocation !== location)
        ) {
          state.enrolmentInfo = null;
          state.lastFetched = null;
          // Clear paginated lessons data when switching enrolments/locations to avoid stale data
          state.lessonsData = [];
          state.lessonsPagination = null;
          state.lessonsError = null;
          // Clear history data when switching enrolments/locations to avoid stale data
          state.historyData = [];
          state.historyPagination = null;
          state.historyError = null;
        }
        
        state.currentEnrolmentId = enrolmentId;
        state.currentLocation = location;
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
      .addCase(updateEnrolment.fulfilled, (state) => {
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
      // Adjust group end date reducers
      .addCase(adjustGroupEndDate.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(adjustGroupEndDate.fulfilled, (state, action) => {
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
      .addCase(adjustGroupEndDate.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update discounts reducers
      .addCase(updateDiscounts.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateDiscounts.fulfilled, (state) => {
        state.isSaving = false;
        // Note: Discounts are refreshed via forceRefresh() in the hook,
        // so we don't need to update them here from the API response
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
        // Only update state if this response is for the current enrollment
        // This prevents race conditions when switching between enrollments
        if (state.currentEnrolmentId === action.payload.enrolmentId) {
          state.historyLoading = false;
          state.historyData = action.payload.data.map((item) => ({
            id: item.id,
            message: item.message || "",
            createdOn: item.createdOn || "",
          }));
          state.historyPagination = action.payload.pagination || null;
          state.historyError = null;
        }
      })
      .addCase(fetchEnrolmentHistory.rejected, (state, action) => {
        // Only update error state if this was for the current enrollment
        const enrolmentId = action.meta.arg?.enrolmentId;
        if (state.currentEnrolmentId === enrolmentId) {
          state.historyLoading = false;
          state.historyError = action.payload as string;
        }
      })
      // Fetch enrolment lessons reducers (for group enrolments only)
      .addCase(fetchEnrolmentLessons.pending, (state) => {
        state.lessonsLoading = true;
        state.lessonsError = null;
      })
      .addCase(fetchEnrolmentLessons.fulfilled, (state, action) => {
        state.lessonsLoading = false;
        state.lessonsData = action.payload.data.map((item) => ({
          id: item.id,
          dueDate: item.dueDate || "",
          date: item.date || "",
          duration: item.duration || "",
          status: item.status || "",
          price: item.price || "",
          owing: item.owing || "",
          online: item.online === "Yes" || item.online === "true",
        }));
        state.lessonsPagination = action.payload.pagination || null;
        state.lessonsError = null;
      })
      .addCase(fetchEnrolmentLessons.rejected, (state, action) => {
        state.lessonsLoading = false;
        state.lessonsError = action.payload as string;
      })
      // Fetch email statement reducers
      .addCase(fetchEmailStatement.pending, (state) => {
        state.emailStatementLoading = true;
        state.emailStatementError = null;
      })
      .addCase(fetchEmailStatement.fulfilled, (state, action) => {
        state.emailStatementLoading = false;
        state.emailStatement = action.payload.data;
        state.emailStatementError = null;
      })
      .addCase(fetchEmailStatement.rejected, (state, action) => {
        state.emailStatementLoading = false;
        state.emailStatementError = action.payload as string;
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


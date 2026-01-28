import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getPrivateLessonDetails,
  getPrivateLessonPayments,
  getPrivateLessonHistory,
  getPrivateLessonComments,
  getGroupLessonStudents,
  transformApiResponse,
  updatePrivateLessonDetails,
  updateAttendance,
  updateCost,
  updateDueDate,
  updateDiscount,
  updatePrice,
  type PaginationInfo,
} from './private-lesson-details.api';
import type { PrivateLessonInfo, PrivateLessonDetails, PrivateLessonHistory, PrivateLessonComment } from '../types';

interface PrivateLessonState {
  privateLessonInfo: PrivateLessonInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentPrivateLessonId: string | null;
  // History state with pagination
  historyData: PrivateLessonHistory[];
  historyPagination: PaginationInfo | null;
  historyLoading: boolean;
  historyError: string | null;
}

const initialState: PrivateLessonState = {
  privateLessonInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentPrivateLessonId: null,
  historyData: [],
  historyPagination: null,
  historyLoading: false,
  historyError: null,
};

// Async thunk for fetching private lesson info
export const fetchPrivateLesson = createAsyncThunk(
  'privateLesson/fetchPrivateLesson',
  async (
    { location, privateLessonId }: { location: string; privateLessonId: string },
    { rejectWithValue }
  ) => {
    try {
      // 1. Fetch details first (required) so we can derive customerId for comments API
      const details = await getPrivateLessonDetails(location, privateLessonId);
      if (!details || !details.success) {
        throw new Error(details?.message || 'Failed to fetch private lesson info');
      }

      // Extract customerId from details response (nested student or flat structure)
      const body = details.data?.body;
      const studentData = body?.student as
        | { customerId?: number }
        | undefined;

      const rawCustomerId =
        (studentData && typeof studentData === 'object' && 'customerId' in studentData
          ? studentData.customerId
          : body?.customerId) ?? undefined;

      const numericCustomerId =
        typeof rawCustomerId === 'number'
          ? rawCustomerId
          : rawCustomerId != null
          ? Number(rawCustomerId)
          : undefined;

      // 2. Fetch payments and comments in parallel (comments only if we have a valid customerId)
      // Note: History is fetched separately with pagination via fetchPrivateLessonHistory thunk
      const [paymentsResult, commentsResult] = await Promise.allSettled([
        getPrivateLessonPayments(location, privateLessonId),
        numericCustomerId && !Number.isNaN(numericCustomerId)
          ? getPrivateLessonComments(location, numericCustomerId, 1)
          : Promise.resolve(null),
      ]);

      // Payments API is optional - log error but don't fail the entire fetch
      let payments: Awaited<ReturnType<typeof getPrivateLessonPayments>> = null;
      if (paymentsResult.status === 'fulfilled') {
        payments = paymentsResult.value;
        if (!payments || !payments.success) {
          console.warn('Payments API failed:', payments?.message || 'Unknown error');
        }
      } else {
        console.warn('Payments API error:', paymentsResult.reason);
      }

      // Comments API is optional - log error but don't fail the entire fetch
      let comments: Awaited<ReturnType<typeof getPrivateLessonComments>> = null;
      if (commentsResult.status === 'fulfilled') {
        comments = commentsResult.value as Awaited<ReturnType<typeof getPrivateLessonComments>> | null;
        if (comments && !comments.success) {
          console.warn('Comments API failed:', comments?.message || 'Unknown error');
        }
      } else if (commentsResult.status === 'rejected') {
        console.warn('Comments API error:', commentsResult.reason);
      }

      // 3. If this is a group lesson, fetch the students list
      let groupStudents: Awaited<ReturnType<typeof getGroupLessonStudents>> = null;
      const isGroupLesson = body?.lesson?.isGroup ?? false;
      if (isGroupLesson) {
        try {
          groupStudents = await getGroupLessonStudents(location, privateLessonId);
          if (!groupStudents || !groupStudents.success) {
            console.warn('Group lesson students API failed:', groupStudents?.message || 'Unknown error');
          }
        } catch (err) {
          console.warn('Group lesson students API error:', err);
        }
      }

      // History is not fetched here - it's fetched separately with pagination
      const transformedData = transformApiResponse(details, payments, null, comments, groupStudents);

      return { data: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch private lesson info');
    }
  }
);

// Async thunk for updating private lesson details
export const updatePrivateLesson = createAsyncThunk(
  'privateLesson/updatePrivateLesson',
  async (
    { location, privateLessonId, data }: { location: string; privateLessonId: string; data: Partial<PrivateLessonDetails> },
    { rejectWithValue }
  ) => {
    try {
      const updateData = {
        program: data.program,
        classroom: data.classroom,
        status: data.status,
        colorCode: data.colorCode,
        online: data.online,
      };
      
      const result = await updatePrivateLessonDetails(location, privateLessonId, updateData);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update private lesson details');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update private lesson details');
    }
  }
);

// Async thunk for updating attendance
export const updateAttendanceThunk = createAsyncThunk(
  'privateLesson/updateAttendance',
  async (
    { location, privateLessonId, present }: { location: string; privateLessonId: string; present: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateAttendance(location, privateLessonId, { present });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update attendance');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update attendance');
    }
  }
);

// Async thunk for updating cost
export const updateCostThunk = createAsyncThunk(
  'privateLesson/updateCost',
  async (
    { location, privateLessonId, data }: { location: string; privateLessonId: string; data: { costPerHour?: string; cost?: string; price?: string } },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateCost(location, privateLessonId, data);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update cost');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update cost');
    }
  }
);

// Async thunk for updating due date
export const updateDueDateThunk = createAsyncThunk(
  'privateLesson/updateDueDate',
  async (
    { location, privateLessonId, dueDate }: { location: string; privateLessonId: string; dueDate: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateDueDate(location, privateLessonId, { dueDate });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update due date');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update due date');
    }
  }
);

// Async thunk for updating discount
export const updateDiscountThunk = createAsyncThunk(
  'privateLesson/updateDiscount',
  async (
    { location, privateLessonId, discount }: { location: string; privateLessonId: string; discount: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateDiscount(location, privateLessonId, { discount });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update discount');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update discount');
    }
  }
);

// Async thunk for updating price (lesson rate per hour)
export const updatePriceThunk = createAsyncThunk(
  'privateLesson/updatePrice',
  async (
    { location, privateLessonId, lessonRatePerHour }: { location: string; privateLessonId: string; lessonRatePerHour: string },
    { rejectWithValue }
  ) => {
    try {
      const result = await updatePrice(location, privateLessonId, { lessonRatePerHour });

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update price');
      }

      return { data: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update price');
    }
  }
);

// Async thunk for fetching private lesson history with pagination
export const fetchPrivateLessonHistory = createAsyncThunk(
  'privateLesson/fetchPrivateLessonHistory',
  async (
    { location, privateLessonId, page = 1 }: { location: string; privateLessonId: string; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getPrivateLessonHistory(location, privateLessonId, page);
      
      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch private lesson history');
      }

      return {
        data: apiResult.data.body || [],
        pagination: apiResult.data.pagination,
        privateLessonId,
      };
    } catch (error) {
      console.error('Error in fetchPrivateLessonHistory:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch private lesson history data'
      );
    }
  }
);

const privateLessonSlice = createSlice({
  name: 'privateLesson',
  initialState,
  reducers: {
    clearPrivateLesson: (state) => {
      state.privateLessonInfo = null;
      state.error = null;
      state.lastFetched = null;
      state.currentPrivateLessonId = null;
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
    updateDetails: (state, action: PayloadAction<Partial<PrivateLessonDetails>>) => {
      if (state.privateLessonInfo) {
        state.privateLessonInfo.details = {
          ...state.privateLessonInfo.details,
          ...action.payload,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrivateLesson.pending, (state, action) => {
        const { privateLessonId } = action.meta.arg as { location: string; privateLessonId: string };
        
        if (state.currentPrivateLessonId !== null && state.currentPrivateLessonId !== privateLessonId) {
          state.privateLessonInfo = null;
          state.lastFetched = null;
        }
        
        state.currentPrivateLessonId = privateLessonId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrivateLesson.fulfilled, (state, action) => {
        state.isLoading = false;
        state.privateLessonInfo = action.payload.data;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchPrivateLesson.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update private lesson reducers
      .addCase(updatePrivateLesson.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updatePrivateLesson.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update state from API response
        if (state.privateLessonInfo && action.payload) {
          const { data } = action.payload;
          state.privateLessonInfo.details = {
            ...state.privateLessonInfo.details,
            program: data.program,
            classroom: data.classroom,
            status: data.status,
            colorCode: data.colorCode,
            online: data.online,
          };
        }
        state.error = null;
      })
      .addCase(updatePrivateLesson.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update attendance reducers
      .addCase(updateAttendanceThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateAttendanceThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.privateLessonInfo && action.payload) {
          const { data } = action.payload;
          state.privateLessonInfo.details.attendance = {
            present: data.present,
          };
        }
        state.error = null;
      })
      .addCase(updateAttendanceThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update cost reducers
      .addCase(updateCostThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateCostThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.privateLessonInfo && action.payload) {
          const { data } = action.payload;
          state.privateLessonInfo.details.cost = {
            costPerHour: data.costPerHour,
            cost: data.cost,
            price: data.price,
            profit: data.profit,
          };
        }
        state.error = null;
      })
      .addCase(updateCostThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update due date reducers
      .addCase(updateDueDateThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateDueDateThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.privateLessonInfo && action.payload) {
          const { data } = action.payload;
          state.privateLessonInfo.details.dueDate = data.dueDate;
        }
        state.error = null;
      })
      .addCase(updateDueDateThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update discount reducers
      .addCase(updateDiscountThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateDiscountThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.privateLessonInfo && action.payload) {
          const { data } = action.payload;
          state.privateLessonInfo.details.totals.discount = data.discount;
        }
        state.error = null;
      })
      .addCase(updateDiscountThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Update price reducers
      .addCase(updatePriceThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updatePriceThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.privateLessonInfo && action.payload) {
          const { data } = action.payload;
          state.privateLessonInfo.details.totals.lessonRatePerHour = data.lessonRatePerHour;
        }
        state.error = null;
      })
      .addCase(updatePriceThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Fetch private lesson history reducers
      .addCase(fetchPrivateLessonHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchPrivateLessonHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = action.payload.data.map((item) => ({
          id: item.id,
          message: item.message || "",
          createdOn: item.createdOn || "",
        }));
        state.historyPagination = action.payload.pagination || null;
        state.historyError = null;
      })
      .addCase(fetchPrivateLessonHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { 
  clearPrivateLesson, 
  clearError, 
  clearCache,
  updateDetails,
} = privateLessonSlice.actions;
export default privateLessonSlice.reducer;


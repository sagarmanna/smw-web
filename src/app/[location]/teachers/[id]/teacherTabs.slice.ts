import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  UnavailabilityData,
  TeacherStudentData,
  InvoicedLessonData,
  UnscheduledLessonData,
  TimeVoucherData,
  CommentData,
  HistoryData,
} from '../teacherTabConfigs';
import { mockTeacherTabData } from '../mockData/teacherMockData';
import { getTeacherTimeVoucher, TimeVoucherQueryParams } from './teachers-details-tabs.api';
import { isCacheFresh, createTimeVoucherCacheKey, STALE_TIME_MS } from '../utils/cacheUtils';
import { transformTimeVoucherData } from '../utils/tabTransformers';
import { fetchUnavailabilityData } from '../utils/teacherTabsData';

export interface TeacherTabsState {
  unavailabilityData: UnavailabilityData[];
  studentData: TeacherStudentData[];
  invoicedLessonData: InvoicedLessonData[];
  unscheduledLessonData: UnscheduledLessonData[];
  timeVoucherData: TimeVoucherData[];
  commentData: CommentData[];
  historyData: HistoryData[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  currentTeacherId: number | null;
  // Time voucher specific state
  timeVoucherLoading: boolean;
  timeVoucherError: string | null;
  timeVoucherLastFetched: number | null;
  timeVoucherCacheKey: string | null; // Cache key based on params
}

const initialState: TeacherTabsState = {
  unavailabilityData: [],
  studentData: [],
  invoicedLessonData: [],
  unscheduledLessonData: [],
  timeVoucherData: [],
  commentData: [],
  historyData: [],
  isLoading: false,
  error: null,
  lastFetched: null,
  currentTeacherId: null,
  timeVoucherLoading: false,
  timeVoucherError: null,
  timeVoucherLastFetched: null,
  timeVoucherCacheKey: null,
};

// Async thunk for fetching teacher tabs data with caching
export const fetchTeacherTabsData = createAsyncThunk(
  'teacherTabs/fetchTeacherTabsData',
  async (
    { location, teacherId }: { location: string; teacherId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      // Check if we have fresh cached data
      const state = getState() as { teacherTabs: TeacherTabsState };
      const tabsState = state.teacherTabs;
      
      if (
        tabsState.currentTeacherId === teacherId &&
        isCacheFresh(tabsState.lastFetched, STALE_TIME_MS) &&
        tabsState.studentData.length > 0 // Check if we have data
      ) {
        // Return cached data - no API call needed
        return { 
          data: {
            unavailabilityData: tabsState.unavailabilityData,
            studentData: tabsState.studentData,
            invoicedLessonData: tabsState.invoicedLessonData,
            unscheduledLessonData: tabsState.unscheduledLessonData,
            timeVoucherData: tabsState.timeVoucherData,
            commentData: tabsState.commentData,
            historyData: tabsState.historyData,
          },
          fromCache: true 
        };
      }

      // Fetch unavailability data (handles all business logic)
      const unavailabilityData = await fetchUnavailabilityData(location, teacherId);
      
      // TODO: Replace other mock data with actual API calls
      // For now, using mock data for other tabs
      // Note: timeVoucherData is now fetched separately when the tab is opened
      const data = {
        unavailabilityData,
        studentData: mockTeacherTabData.studentData,
        invoicedLessonData: mockTeacherTabData.invoicedLessonData,
        unscheduledLessonData: mockTeacherTabData.unscheduledLessonData,
        timeVoucherData: [], // Will be fetched separately when tab is opened
        commentData: mockTeacherTabData.commentData,
        historyData: mockTeacherTabData.historyData,
      };

      return { data, fromCache: false };
    } catch (error) {
      console.error('Error in fetchTeacherTabsData:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch teacher tabs data');
    }
  }
);

// Async thunk for fetching time voucher data with caching - only triggers when tab is opened
export const fetchTimeVoucherData = createAsyncThunk(
  'teacherTabs/fetchTimeVoucherData',
  async (
    {
      location,
      teacherId,
      params,
    }: { location: string; teacherId: number; params: TimeVoucherQueryParams },
    { getState, rejectWithValue }
  ) => {
    try {
      // Check if we have fresh cached data for these specific params
      const state = getState() as { teacherTabs: TeacherTabsState };
      const tabsState = state.teacherTabs;
      const cacheKey = createTimeVoucherCacheKey(
        location,
        teacherId,
        params.startDate,
        params.endDate,
        params.summaryOnly
      );
      
      if (
        tabsState.timeVoucherCacheKey === cacheKey &&
        isCacheFresh(tabsState.timeVoucherLastFetched, STALE_TIME_MS) &&
        tabsState.timeVoucherData.length > 0
      ) {
        // Return cached data - no API call needed
        return {
          data: tabsState.timeVoucherData,
          fromCache: true,
          cacheKey,
        };
      }

      // Fetch time voucher data from API
      const apiResult = await getTeacherTimeVoucher(location, teacherId, params);
      
      // Transform API response (handles all business logic)
      const transformedData = transformTimeVoucherData(apiResult, params);

      return {
        data: transformedData,
        fromCache: false,
        cacheKey,
      };
    } catch (error) {
      console.error('Error in fetchTimeVoucherData:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch time voucher data'
      );
    }
  }
);

const teacherTabsSlice = createSlice({
  name: 'teacherTabs',
  initialState,
  reducers: {
    clearTeacherTabs: (state) => {
      state.unavailabilityData = [];
      state.studentData = [];
      state.invoicedLessonData = [];
      state.unscheduledLessonData = [];
      state.timeVoucherData = [];
      state.commentData = [];
      state.historyData = [];
      state.error = null;
      state.lastFetched = null;
      state.currentTeacherId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCache: (state) => {
      state.lastFetched = null;
    },
    // Add comment
    addComment: (state, action: PayloadAction<CommentData>) => {
      state.commentData.push(action.payload);
    },
    // Add unavailability
    addUnavailability: (state, action: PayloadAction<UnavailabilityData>) => {
      state.unavailabilityData.push(action.payload);
    },
    // Update unavailability
    updateUnavailability: (state, action: PayloadAction<UnavailabilityData>) => {
      const index = state.unavailabilityData.findIndex(
        (item) => item.id === action.payload.id
      );
      if (index !== -1) {
        state.unavailabilityData[index] = action.payload;
      }
    },
    // Delete unavailability
    deleteUnavailability: (state, action: PayloadAction<string>) => {
      state.unavailabilityData = state.unavailabilityData.filter(
        (item) => item.id !== action.payload
      );
    },
    // Clear time voucher data
    clearTimeVoucherData: (state) => {
      state.timeVoucherData = [];
      state.timeVoucherError = null;
      state.timeVoucherLastFetched = null;
      state.timeVoucherCacheKey = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeacherTabsData.pending, (state, action) => {
        const { teacherId } = action.meta.arg as { location: string; teacherId: number };
        
        // If switching to a different teacher, clear old data
        if (state.currentTeacherId !== null && state.currentTeacherId !== teacherId) {
          state.unavailabilityData = [];
          state.studentData = [];
          state.invoicedLessonData = [];
          state.unscheduledLessonData = [];
          state.timeVoucherData = [];
          state.commentData = [];
          state.historyData = [];
          state.lastFetched = null;
          // Clear time voucher specific state
          state.timeVoucherLoading = false;
          state.timeVoucherError = null;
          state.timeVoucherLastFetched = null;
          state.timeVoucherCacheKey = null;
        }
        
        state.currentTeacherId = teacherId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacherTabsData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unavailabilityData = action.payload.data.unavailabilityData;
        state.studentData = action.payload.data.studentData;
        state.invoicedLessonData = action.payload.data.invoicedLessonData;
        state.unscheduledLessonData = action.payload.data.unscheduledLessonData;
        state.timeVoucherData = action.payload.data.timeVoucherData;
        state.commentData = action.payload.data.commentData;
        state.historyData = action.payload.data.historyData;
        state.error = null;
        // Only update timestamp if data came from API, not cache
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchTeacherTabsData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Time voucher thunk handlers
      .addCase(fetchTimeVoucherData.pending, (state) => {
        state.timeVoucherLoading = true;
        state.timeVoucherError = null;
      })
      .addCase(fetchTimeVoucherData.fulfilled, (state, action) => {
        state.timeVoucherLoading = false;
        state.timeVoucherData = action.payload.data;
        state.timeVoucherError = null;
        // Only update timestamp and cache key if data came from API, not cache
        if (!action.payload.fromCache) {
          state.timeVoucherLastFetched = Date.now();
          state.timeVoucherCacheKey = action.payload.cacheKey;
        }
      })
      .addCase(fetchTimeVoucherData.rejected, (state, action) => {
        state.timeVoucherLoading = false;
        state.timeVoucherError = action.payload as string;
      });
  },
});

export const { 
  clearTeacherTabs, 
  clearError, 
  clearCache,
  addComment,
  addUnavailability,
  updateUnavailability,
  deleteUnavailability,
  clearTimeVoucherData,
} = teacherTabsSlice.actions;
export default teacherTabsSlice.reducer;


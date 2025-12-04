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
import { getTeacherUnavailability } from './teachers-details-tabs.api';
import { parseApiDateTimeToISO } from '@/utils/dateUtils';
import { getTeacherTimeVoucher, TimeVoucherQueryParams } from './teachers-details-tabs.api';
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
  currentTeacherId: number | null;
  // Time voucher specific state
  timeVoucherLoading: boolean;
  timeVoucherError: string | null;
  timeVoucherParams: TimeVoucherQueryParams | null; // Track params for current data
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
  currentTeacherId: null,
  timeVoucherLoading: false,
  timeVoucherError: null,
  timeVoucherParams: null,
};

// Async thunk for fetching teacher tabs data - stores in Redux
export const fetchTeacherTabsData = createAsyncThunk(
  'teacherTabs/fetchTeacherTabsData',
  async (
    { location, teacherId }: { location: string; teacherId: number },
    { rejectWithValue }
  ) => {
    try {
      // Check if we have fresh cached data
      const state = getState() as { teacherTabs: TeacherTabsState };
      const tabsState = state.teacherTabs;
      
      if (
        tabsState.currentTeacherId === teacherId &&
        tabsState.lastFetched &&
        Date.now() - tabsState.lastFetched < STALE_TIME_MS &&
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

      // Fetch unavailability data from API and transform it
      let unavailabilityData: UnavailabilityData[] = [];
      try {
        const apiResult = await getTeacherUnavailability(location, teacherId);
        if (apiResult && apiResult.length > 0) {
          // Parse API data once - store as ISO strings for direct Date conversion in UI
          const baseTimestamp = Date.now();
          unavailabilityData = apiResult.map((item, index) => ({
            id: `unavailability-${baseTimestamp}-${index}`,
            fromDateTime: parseApiDateTimeToISO(item.start),
            toDateTime: parseApiDateTimeToISO(item.end),
            reason: item.reason || "",
          }));
          console.log('Transformed unavailability data:', unavailabilityData);
        }
      } catch (unavailabilityError) {
        console.error('Error fetching unavailability data:', unavailabilityError);
        // Continue with empty array if unavailability fetch fails
        unavailabilityData = [];
      }

      // Note: Students data is fetched lazily when StudentsTab is clicked
      // This avoids loading all tab data upfront and improves initial load time
      const studentData: TeacherStudentData[] = [];
      // Fetch unavailability data (handles all business logic)
      const unavailabilityData = await fetchUnavailabilityData(location, teacherId);
      
      // TODO: Replace other mock data with actual API calls
      // For now, using mock data for other tabs
      // Note: timeVoucherData is now fetched separately when the tab is opened
      const data = {
        unavailabilityData,
        studentData,
        invoicedLessonData: mockTeacherTabData.invoicedLessonData,
        unscheduledLessonData: mockTeacherTabData.unscheduledLessonData,
        timeVoucherData: [], // Will be fetched separately when tab is opened
        commentData: mockTeacherTabData.commentData,
        historyData: mockTeacherTabData.historyData,
      };

      return { data };
    } catch (error) {
      console.error('Error in fetchTeacherTabsData:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch teacher tabs data');
    }
  }
);

// Async thunk for fetching time voucher data - stores in Redux
export const fetchTimeVoucherData = createAsyncThunk(
  'teacherTabs/fetchTimeVoucherData',
  async (
    {
      location,
      teacherId,
      params,
    }: { location: string; teacherId: number; params: TimeVoucherQueryParams },
    { rejectWithValue }
  ) => {
    try {
      // Fetch time voucher data from API
      const apiResult = await getTeacherTimeVoucher(location, teacherId, params);
      
      // Transform API response (handles all business logic)
      const transformedData = transformTimeVoucherData(apiResult, params);

      return {
        data: transformedData,
        params,
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
      state.currentTeacherId = null;
    },
    clearError: (state) => {
      state.error = null;
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
      state.timeVoucherParams = null;
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
          // Clear time voucher specific state
          state.timeVoucherLoading = false;
          state.timeVoucherError = null;
          state.timeVoucherParams = null;
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
        state.timeVoucherParams = action.payload.params;
        state.timeVoucherError = null;
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
  addComment,
  addUnavailability,
  updateUnavailability,
  deleteUnavailability,
  clearTimeVoucherData,
} = teacherTabsSlice.actions;
export default teacherTabsSlice.reducer;


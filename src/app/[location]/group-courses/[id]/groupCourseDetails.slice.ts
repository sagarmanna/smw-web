import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getCourseInfo,
  getCourseLessons,
  getGroupCourseEmailStatement,
  CourseInfoResponse,
  CourseLesson,
  GroupCourseEmailStatementBody,
} from './groupCourseDetails.api';

interface GroupCourseState {
  courseInfoData: CourseInfoResponse | null; // Course info from /info endpoint
  courseLessons: CourseLesson[]; // Lessons from /lessons endpoint
  // Note: Students and history are managed in groupCourseTabs slice (lazy loaded when tabs open)
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentCourseId: number | null;
  // Email statement state
  emailStatement: GroupCourseEmailStatementBody | null;
  emailStatementLoading: boolean;
  emailStatementError: string | null;
}

const initialState: GroupCourseState = {
  courseInfoData: null,
  courseLessons: [],
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentCourseId: null,
  emailStatement: null,
  emailStatementLoading: false,
  emailStatementError: null,
};

/**
 * Fetches course info and lessons from the API
 * Called once in page.tsx during initial page load
 * Note: Students and history are fetched separately when their tabs are opened (lazy loading)
 * Uses Promise.allSettled for graceful error handling - allows partial failures
 */
export const fetchGroupCourse = createAsyncThunk(
  'groupCourse/fetchGroupCourse',
  async (
    { location, courseId }: { location: string; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      // Fetch course info and lessons in parallel with graceful error handling
      // Note: Students and history are fetched separately when their tabs are opened (lazy loading)
      const parallelResults = await Promise.allSettled([
        getCourseInfo(location, courseId),
        getCourseLessons(location, courseId),
      ]);

      // Extract results from parallel calls
      // Order: info, lessons
      const infoResult = parallelResults[0];
      const lessonsResult = parallelResults[1];

      // Course Info API is required - fail if it fails
      let courseInfoData: CourseInfoResponse | null = null;
      if (infoResult.status === 'fulfilled') {
        const info = infoResult.value;
        if (info && info.success && info.data?.body) {
          courseInfoData = info.data.body;
        } else {
          throw new Error(info?.message || 'Failed to fetch course info');
        }
      } else {
        throw new Error(infoResult.reason instanceof Error 
          ? infoResult.reason.message 
          : 'Failed to fetch course info');
      }

      // Lessons API is optional - log error but don't fail the entire fetch
      let courseLessons: CourseLesson[] = [];
      if (lessonsResult.status === 'fulfilled') {
        const lessons = lessonsResult.value;
        if (lessons && lessons.success && lessons.data?.body) {
          courseLessons = lessons.data.body;
        } else {
          console.warn('[groupCourse] Course Lessons API failed:', lessons?.message || 'Unknown error');
        }
      } else {
        console.warn('[groupCourse] Course Lessons API error:', lessonsResult.reason);
      }

      // Use API responses as-is (no recalculation)
      return {
        courseInfoData,
        courseLessons,
        fetchedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch group course details');
    }
  }
);

// Async thunk for fetching group course email statement
export const fetchGroupCourseEmailStatement = createAsyncThunk(
  'groupCourse/fetchGroupCourseEmailStatement',
  async (
    { location, courseId }: { location: string; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getGroupCourseEmailStatement(location, courseId);

      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch group course email statement');
      }

      return {
        data: apiResult.data.body,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch group course email statement'
      );
    }
  }
);

/**
 * Refreshes course lessons from the API
 * Used after updating lesson data (e.g., online type)
 */
export const refreshCourseLessons = createAsyncThunk(
  'groupCourse/refreshCourseLessons',
  async (
    { location, courseId }: { location: string; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getCourseLessons(location, courseId);

      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to refresh course lessons');
      }

      return {
        courseLessons: apiResult.data.body || [],
        fetchedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to refresh course lessons'
      );
    }
  }
);

const groupCourseSlice = createSlice({
  name: 'groupCourse',
  initialState,
  reducers: {
    clearGroupCourse: (state) => {
      state.courseInfoData = null;
      state.courseLessons = [];
      state.error = null;
      state.lastFetched = null;
      state.currentCourseId = null;
      state.emailStatement = null;
      state.emailStatementError = null;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupCourse.pending, (state, action) => {
        // Track which course we're loading
        const { courseId } = action.meta.arg as { location: string; courseId: number };
        
        // If switching to a different course, clear old data
        if (state.currentCourseId !== null && state.currentCourseId !== courseId) {
          state.courseInfoData = null;
          state.courseLessons = [];
          state.lastFetched = null;
        }
        
        state.currentCourseId = courseId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseInfoData = action.payload.courseInfoData;
        state.courseLessons = action.payload.courseLessons;
        state.lastFetched = action.payload.fetchedAt;
        // Use courseId from action meta arg
        const { courseId } = action.meta.arg as { location: string; courseId: number };
        state.currentCourseId = courseId;
        state.error = null;
      })
      .addCase(fetchGroupCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch email statement reducers
      .addCase(fetchGroupCourseEmailStatement.pending, (state) => {
        state.emailStatementLoading = true;
        state.emailStatementError = null;
      })
      .addCase(fetchGroupCourseEmailStatement.fulfilled, (state, action) => {
        state.emailStatementLoading = false;
        state.emailStatement = action.payload.data;
        state.emailStatementError = null;
      })
      .addCase(fetchGroupCourseEmailStatement.rejected, (state, action) => {
        state.emailStatementLoading = false;
        state.emailStatementError = action.payload as string;
      })
      // Refresh course lessons reducers
      .addCase(refreshCourseLessons.pending, (state) => {
        // Don't set isLoading to true to avoid showing full page loading
        state.error = null;
      })
      .addCase(refreshCourseLessons.fulfilled, (state, action) => {
        state.courseLessons = action.payload.courseLessons;
        state.lastFetched = action.payload.fetchedAt;
        state.error = null;
      })
      .addCase(refreshCourseLessons.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  clearGroupCourse,
  setError,
} = groupCourseSlice.actions;

export default groupCourseSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getCourseInfo,
  getCourseLessons,
  getCourseStudents,
  getCourseHistory,
  CourseInfoResponse,
  CourseLesson,
  CourseStudent,
  CourseHistory,
} from './groupCourseDetails.api';

interface GroupCourseState {
  courseInfoData: CourseInfoResponse | null; // Course info from /info endpoint
  courseLessons: CourseLesson[]; // Lessons from /lessons endpoint
  courseStudents: CourseStudent[]; // Students from /students endpoint
  courseHistory: CourseHistory[]; // History from /history endpoint
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentCourseId: number | null;
}

const initialState: GroupCourseState = {
  courseInfoData: null,
  courseLessons: [],
  courseStudents: [],
  courseHistory: [],
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentCourseId: null,
};

/**
 * Fetches course info, lessons, students, and history from the API
 * Called once in page.tsx during initial page load
 * Uses Promise.allSettled for graceful error handling - allows partial failures
 */
export const fetchGroupCourse = createAsyncThunk(
  'groupCourse/fetchGroupCourse',
  async (
    { location, courseId }: { location: string; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      // Fetch course info, lessons, students, and history in parallel with graceful error handling
      const parallelResults = await Promise.allSettled([
        getCourseInfo(location, courseId),
        getCourseLessons(location, courseId),
        getCourseStudents(location, courseId),
        getCourseHistory(location, courseId),
      ]);

      // Extract results from parallel calls
      // Order: info, lessons, students, history
      const infoResult = parallelResults[0];
      const lessonsResult = parallelResults[1];
      const studentsResult = parallelResults[2];
      const historyResult = parallelResults[3];

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

      // Students API is optional - log error but don't fail the entire fetch
      let courseStudents: CourseStudent[] = [];
      if (studentsResult.status === 'fulfilled') {
        const students = studentsResult.value;
        if (students && students.success && students.data?.body) {
          courseStudents = students.data.body;
        } else {
          console.warn('[groupCourse] Course Students API failed:', students?.message || 'Unknown error');
        }
      } else {
        console.warn('[groupCourse] Course Students API error:', studentsResult.reason);
      }

      // History API is optional - log error but don't fail the entire fetch
      let courseHistory: CourseHistory[] = [];
      if (historyResult.status === 'fulfilled') {
        const history = historyResult.value;
        if (history && history.success && history.data?.body) {
          courseHistory = history.data.body;
        } else {
          console.warn('[groupCourse] Course History API failed:', history?.message || 'Unknown error');
        }
      } else {
        console.warn('[groupCourse] Course History API error:', historyResult.reason);
      }

      // Use API responses as-is (no recalculation)
      return {
        courseInfoData,
        courseLessons,
        courseStudents,
        courseHistory,
        fetchedAt: Date.now(),
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch group course details');
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
      state.courseStudents = [];
      state.courseHistory = [];
      state.error = null;
      state.lastFetched = null;
      state.currentCourseId = null;
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
          state.courseStudents = [];
          state.courseHistory = [];
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
        state.courseStudents = action.payload.courseStudents;
        state.courseHistory = action.payload.courseHistory;
        state.lastFetched = action.payload.fetchedAt;
        // Use courseId from action meta arg
        const { courseId } = action.meta.arg as { location: string; courseId: number };
        state.currentCourseId = courseId;
        state.error = null;
      })
      .addCase(fetchGroupCourse.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearGroupCourse,
  setError,
} = groupCourseSlice.actions;

export default groupCourseSlice.reducer;


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LessonData, StudentData, HistoryData } from './groupCourseTabConfigs';
import {
  getCourseStudents,
  getCourseHistory,
  type CourseLesson,
  type CourseHistory,
  type CourseHistoryApiResponsePagination,
} from './groupCourseDetails.api';

interface GroupCourseTabsState {
  lessonData: LessonData[];
  studentData: StudentData[];
  studentPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
  studentCourseId: number | null;
  historyData: HistoryData[];
  historyPagination: CourseHistoryApiResponsePagination | null;
  historyCourseId: number | null;
  isLoading: boolean;
  error: string | null;
  currentCourseId: number | null;
  // Individual tab loading states
  studentsLoading: boolean;
  studentsError: string | null;
  historyLoading: boolean;
  historyError: string | null;
}

const initialState: GroupCourseTabsState = {
  lessonData: [],
  studentData: [],
  studentPagination: null,
  studentCourseId: null,
  historyData: [],
  historyPagination: null,
  historyCourseId: null,
  isLoading: false,
  error: null,
  currentCourseId: null,
  studentsLoading: false,
  studentsError: null,
  historyLoading: false,
  historyError: null,
};

/**
 * Transforms CourseLesson from API to LessonData format
 */
const transformCourseLessonsToLessonData = (courseLessons: CourseLesson[]): LessonData[] => {
  return courseLessons.map((lesson) => ({
    id: lesson.id.toString(),
    date: lesson.date || "N/A",
    status: lesson.status || "N/A",
    isOnline: lesson.online === "Yes" || lesson.online === "yes",
  }));
};

/**
 * Transforms CourseHistory from API to HistoryData format
 * Uses API message as-is for display (no extra formatting)
 */
const transformCourseHistoryToHistoryData = (courseHistory: CourseHistory[]): HistoryData[] => {
  return courseHistory.map((item) => ({
    id: item.id.toString(),
    message: item.message || "",
  }));
};

/**
 * Fetches group course lessons data
 * Uses courseLessons from groupCourseDetails slice (already fetched in page.tsx)
 */
export const fetchGroupCourseTabsData = createAsyncThunk(
  'groupCourseTabs/fetchGroupCourseTabsData',
  async (
    { courseId }: { location: string; courseId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      // Get courseLessons from groupCourseDetails slice (already fetched in page.tsx)
      const state = getState() as {
        groupCourse: {
          courseLessons: CourseLesson[];
          currentCourseId: number | null;
        };
      };
      const courseLessons = state.groupCourse.courseLessons;
      const currentCourseId = state.groupCourse.currentCourseId;

      // Only use lessons if they're for the current course
      let lessonData: LessonData[] = [];
      if (courseLessons && courseLessons.length > 0 && currentCourseId === courseId) {
        lessonData = transformCourseLessonsToLessonData(courseLessons);
      }

      return {
        lessonData,
        courseId,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch group course tabs data');
    }
  }
);

// Fetch students data with pagination for a specific course
export const fetchGroupCourseStudents = createAsyncThunk(
  'groupCourseTabs/fetchGroupCourseStudents',
  async (
    { location, courseId, page = 1 }: { location: string; courseId: number; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getCourseStudents(location, courseId, page);

      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch course students');
      }

      return {
        data: apiResult.data.body || [],
        pagination: apiResult.data.pagination,
        courseId,
      };
    } catch (error) {
      console.error('Error in fetchGroupCourseStudents:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch course students data'
      );
    }
  }
);

// Fetch history data with pagination for a specific course
export const fetchGroupCourseHistory = createAsyncThunk(
  'groupCourseTabs/fetchGroupCourseHistory',
  async (
    { location, courseId, page = 1 }: { location: string; courseId: number; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getCourseHistory(location, courseId, page);

      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch course history');
      }

      return {
        data: apiResult.data.body || [],
        pagination: apiResult.data.pagination,
        courseId,
      };
    } catch (error) {
      console.error('Error in fetchGroupCourseHistory:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch course history data'
      );
    }
  }
);

const groupCourseTabsSlice = createSlice({
  name: 'groupCourseTabs',
  initialState,
  reducers: {
    updateLessonsOnlineStatus: (state, action: { payload: { lessonIds: string[]; isOnline: boolean } }) => {
      const { lessonIds, isOnline } = action.payload;
      state.lessonData = state.lessonData.map((lesson) =>
        lessonIds.includes(lesson.id)
          ? { ...lesson, isOnline }
          : lesson
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupCourseTabsData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupCourseTabsData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessonData = action.payload.lessonData;
        state.currentCourseId = action.payload.courseId;
        state.error = null;
      })
      .addCase(fetchGroupCourseTabsData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Students tab data
      .addCase(fetchGroupCourseStudents.pending, (state) => {
        state.studentsLoading = true;
        state.studentsError = null;
      })
      .addCase(fetchGroupCourseStudents.fulfilled, (state, action) => {
        state.studentsLoading = false;
        // Map API response to StudentData, preserving IDs for navigation
        state.studentData = action.payload.data.map((student) => ({
          id: student.id.toString(),
          studentName: student.studentName || "N/A",
          customerName: student.customerName || "N/A",
          discount: student.discount || "Not set",
          studentId: student.studentId,
          customerId: student.customerId,
        }));
        state.studentPagination = action.payload.pagination;
        state.studentCourseId = action.payload.courseId;
        state.studentsError = null;
      })
      .addCase(fetchGroupCourseStudents.rejected, (state, action) => {
        state.studentsLoading = false;
        state.studentsError = action.payload as string;
      })
      // History tab data
      .addCase(fetchGroupCourseHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchGroupCourseHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = transformCourseHistoryToHistoryData(action.payload.data);
        state.historyPagination = action.payload.pagination;
        state.historyCourseId = action.payload.courseId;
        state.historyError = null;
      })
      .addCase(fetchGroupCourseHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      });
  },
});

export const { updateLessonsOnlineStatus } = groupCourseTabsSlice.actions;

export default groupCourseTabsSlice.reducer;


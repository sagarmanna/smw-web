import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LessonData, StudentData, HistoryData } from './groupCourseTabConfigs';
import type { CourseLesson, CourseStudent, CourseHistory } from './groupCourseDetails.api';

interface GroupCourseTabsState {
  lessonData: LessonData[];
  studentData: StudentData[];
  historyData: HistoryData[];
  isLoading: boolean;
  error: string | null;
  currentCourseId: number | null;
}

const initialState: GroupCourseTabsState = {
  lessonData: [],
  studentData: [],
  historyData: [],
  isLoading: false,
  error: null,
  currentCourseId: null,
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
 * Transforms CourseStudent from API to StudentData format
 * Uses API response as-is (no recalculation)
 */
const transformCourseStudentsToStudentData = (courseStudents: CourseStudent[]): StudentData[] => {
  return courseStudents.map((student) => ({
    id: student.id.toString(),
    studentName: student.studentName || "N/A",
    customerName: student.customerName || "N/A",
    discount: student.discount || "Not set",
    // Preserve raw IDs for navigation to details pages
    studentId: student.studentId,
    customerId: student.customerId,
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
 * Fetches group course tabs data
 * Uses courseLessons, courseStudents, and courseHistory from groupCourseDetails slice (already fetched in page.tsx)
 */
export const fetchGroupCourseTabsData = createAsyncThunk(
  'groupCourseTabs/fetchGroupCourseTabsData',
  async (
    { location, courseId }: { location: string; courseId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      // Get courseLessons, courseStudents, and courseHistory from groupCourseDetails slice (already fetched in page.tsx)
      const state = getState() as { 
        groupCourse: { 
          courseLessons: CourseLesson[]; 
          courseStudents: CourseStudent[];
          courseHistory: CourseHistory[];
          currentCourseId: number | null;
        } 
      };
      const courseLessons = state.groupCourse.courseLessons;
      const courseStudents = state.groupCourse.courseStudents;
      const courseHistory = state.groupCourse.courseHistory;
      const currentCourseId = state.groupCourse.currentCourseId;

      // Only use lessons if they're for the current course
      let lessonData: LessonData[] = [];
      if (courseLessons && courseLessons.length > 0 && currentCourseId === courseId) {
        lessonData = transformCourseLessonsToLessonData(courseLessons);
      }

      // Only use students if they're for the current course
      let studentData: StudentData[] = [];
      if (courseStudents && courseStudents.length > 0 && currentCourseId === courseId) {
        studentData = transformCourseStudentsToStudentData(courseStudents);
      }

      // Only use history if it's for the current course
      let historyData: HistoryData[] = [];
      if (courseHistory && courseHistory.length > 0 && currentCourseId === courseId) {
        historyData = transformCourseHistoryToHistoryData(courseHistory);
      }

      return {
        lessonData,
        studentData,
        historyData,
        courseId,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch group course tabs data');
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
        state.studentData = action.payload.studentData;
        state.historyData = action.payload.historyData;
        state.currentCourseId = action.payload.courseId;
        state.error = null;
      })
      .addCase(fetchGroupCourseTabsData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { updateLessonsOnlineStatus } = groupCourseTabsSlice.actions;

export default groupCourseTabsSlice.reducer;


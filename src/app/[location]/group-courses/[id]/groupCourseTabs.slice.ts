import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { LessonData, StudentData, HistoryData } from './groupCourseTabConfigs';

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

// Mock data generator
const generateMockLessons = (courseId: number): LessonData[] => {
  const lessons: LessonData[] = [];
  const startDate = new Date("2025-10-18");
  const time = "07:30 PM"; // Default time from course schedule
  
  for (let i = 0; i < 12; i++) {
    const lessonDate = new Date(startDate);
    lessonDate.setDate(startDate.getDate() + (i * 7)); // Weekly lessons
    
    // Store date and time together for display
    const dateStr = lessonDate.toISOString().split('T')[0];
    
    lessons.push({
      id: `lesson-${i + 1}`,
      date: `${dateStr} ${time}`, // Store date with time
      status: "Completed",
      isOnline: false,
    });
  }
  
  return lessons;
};

const generateMockStudents = (): StudentData[] => {
  return [
    {
      id: "1",
      studentName: "Aisha Lee",
      customerName: "Aisha Lee",
      discount: "Not set",
    },
    {
      id: "2",
      studentName: "Astudent A",
      customerName: "Acustomer A",
      discount: "$10",
    },
    {
      id: "3",
      studentName: "Hero 123",
      customerName: "1234 123",
      discount: "Not set",
    },
    {
      id: "4",
      studentName: "Anna Winston",
      customerName: "Anna Winston",
      discount: "$5",
    },
    {
      id: "5",
      studentName: "Alicia Jones",
      customerName: "Alicia Jones",
      discount: "Not set",
    },
  ];
};

const generateMockHistory = (): HistoryData[] => {
  return [
    {
      id: "1",
      message: "Group course created on Oct 18, 2025",
    },
    {
      id: "2",
      message: "Schedule updated on Oct 20, 2025",
    },
    {
      id: "3",
      message: "Student Aisha Lee enrolled on Oct 22, 2025",
    },
  ];
};

/**
 * Fetches group course tabs data (mock implementation)
 */
export const fetchGroupCourseTabsData = createAsyncThunk(
  'groupCourseTabs/fetchGroupCourseTabsData',
  async (
    { location, courseId }: { location: string; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        lessonData: generateMockLessons(courseId),
        studentData: generateMockStudents(),
        historyData: generateMockHistory(),
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


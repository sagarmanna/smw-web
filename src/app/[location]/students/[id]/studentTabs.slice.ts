import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import {
  AbsentLessonData,
  UnscheduledLessonData,
  CommentData,
  HistoryData,
} from './studentTabConfigs';
import {
  getStudentComments,
  getStudentHistory,
  getStudentPrivateLessons,
  getStudentGroupLessons,
  PrivateLessonGroup,
  GroupLessonGroup,
  GroupLessonApiResponsePagination,
} from './students-details-tabs.api';

export interface StudentTabsState {
  privateLessonData: PrivateLessonGroup[]; // Store grouped structure as-is from API
  groupLessonData: GroupLessonGroup[]; // Store grouped structure as-is from API
  groupLessonPagination: GroupLessonApiResponsePagination | null;
  groupLessonStudentId: string | null;
  absentLessonData: AbsentLessonData[];
  unscheduledLessonData: UnscheduledLessonData[];
  commentData: CommentData[];
  historyData: HistoryData[];
  isLoading: boolean;
  error: string | null;
  currentStudentId: string | null;
  // Individual tab loading states
  privateLessonLoading: boolean;
  privateLessonError: string | null;
  groupLessonLoading: boolean;
  groupLessonError: string | null;
  absentLessonLoading: boolean;
  absentLessonError: string | null;
  unscheduledLessonLoading: boolean;
  unscheduledLessonError: string | null;
  commentsLoading: boolean;
  commentsError: string | null;
  commentsStudentId: string | null;
  historyLoading: boolean;
  historyError: string | null;
  historyStudentId: string | null;
}

const initialState: StudentTabsState = {
  privateLessonData: [],
  groupLessonData: [],
  groupLessonPagination: null,
  groupLessonStudentId: null,
  absentLessonData: [],
  unscheduledLessonData: [],
  commentData: [],
  historyData: [],
  isLoading: false,
  error: null,
  currentStudentId: null,
  privateLessonLoading: false,
  privateLessonError: null,
  groupLessonLoading: false,
  groupLessonError: null,
  absentLessonLoading: false,
  absentLessonError: null,
  unscheduledLessonLoading: false,
  unscheduledLessonError: null,
  commentsLoading: false,
  commentsError: null,
  commentsStudentId: null,
  historyLoading: false,
  historyError: null,
  historyStudentId: null,
};

// Async thunk for fetching student tabs data
export const fetchStudentTabsData = createAsyncThunk(
  'studentTabs/fetchStudentTabsData',
  async (
    // Parameters kept for backward compatibility but not used (all data fetched separately)
    _params: { location: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      // All tab data is fetched separately via their respective thunks (lazy loading)
      // This thunk is deprecated but kept for backward compatibility
      const data = {
        privateLessonData: [], // Fetched separately via fetchPrivateLessonsData
        groupLessonData: [], // Fetched separately via fetchGroupLessonsData
        absentLessonData: [], // TODO: Create fetchAbsentLessonsData thunk
        unscheduledLessonData: [], // TODO: Create fetchUnscheduledLessonsData thunk
        commentData: [], // Fetched separately via fetchCommentsData
        historyData: [], // Fetched separately via fetchHistoryData
      };

      return { data };
    } catch (error) {
      console.error('Error in fetchStudentTabsData:', error);
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch student tabs data');
    }
  }
);

// Async thunk for fetching comments data
export const fetchCommentsData = createAsyncThunk(
  'studentTabs/fetchCommentsData',
  async (
    { location, studentId }: { location: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getStudentComments(location, studentId);
      
      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch comments');
      }

      return {
        data: apiResult.data.body || [],
        studentId,
      };
    } catch (error) {
      console.error('Error in fetchCommentsData:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch comments data'
      );
    }
  }
);

// Async thunk for fetching history data
export const fetchHistoryData = createAsyncThunk(
  'studentTabs/fetchHistoryData',
  async (
    { location, studentId }: { location: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getStudentHistory(location, studentId);
      
      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch history');
      }

      return {
        data: apiResult.data.body || [],
        studentId,
      };
    } catch (error) {
      console.error('Error in fetchHistoryData:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch history data'
      );
    }
  }
);

// Async thunk for fetching private lessons data
export const fetchPrivateLessonsData = createAsyncThunk(
  'studentTabs/fetchPrivateLessonsData',
  async (
    { location, studentId }: { location: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await getStudentPrivateLessons(location, studentId);
      
      if (!data) {
        throw new Error('Failed to fetch private lessons');
      }

      return {
        data,
        studentId,
      };
    } catch (error) {
      console.error('Error in fetchPrivateLessonsData:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch private lessons data'
      );
    }
  }
);

// Async thunk for fetching group lessons data with pagination
export const fetchGroupLessonsData = createAsyncThunk(
  'studentTabs/fetchGroupLessonsData',
  async (
    { location, studentId, page = 1 }: { location: string; studentId: string; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getStudentGroupLessons(location, studentId, page);
      
      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch group lessons');
      }

      return {
        data: apiResult.data.body || [],
        pagination: apiResult.data.pagination,
        studentId,
      };
    } catch (error) {
      console.error('Error in fetchGroupLessonsData:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch group lessons data'
      );
    }
  }
);

const studentTabsSlice = createSlice({
  name: 'studentTabs',
  initialState,
  reducers: {
    clearStudentTabs: (state) => {
      state.privateLessonData = [];
      state.groupLessonData = [];
      state.groupLessonPagination = null;
      state.groupLessonStudentId = null;
      state.absentLessonData = [];
      state.unscheduledLessonData = [];
      state.commentData = [];
      state.historyData = [];
      state.error = null;
      state.currentStudentId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUnscheduledLessonsProgram: (
      state,
      action: PayloadAction<{
        indices: number[];
        programName: string;
      }>
    ) => {
      const { indices, programName } = action.payload;
      indices.forEach((index) => {
        const lesson = state.unscheduledLessonData[index];
        if (lesson) {
          lesson.program = programName;
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tabs data
      .addCase(fetchStudentTabsData.pending, (state, action) => {
        const { studentId } = action.meta.arg as { location: string; studentId: string };
        
        if (state.currentStudentId !== null && state.currentStudentId !== studentId) {
          state.privateLessonData = [];
          state.groupLessonData = [];
          state.absentLessonData = [];
          state.unscheduledLessonData = [];
          state.commentData = [];
          state.historyData = [];
        }
        
        state.currentStudentId = studentId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudentTabsData.fulfilled, (state, action) => {
        state.isLoading = false;
        // Note: privateLessonData and groupLessonData are fetched separately
        state.absentLessonData = action.payload.data.absentLessonData;
        state.unscheduledLessonData = action.payload.data.unscheduledLessonData;
        state.commentData = action.payload.data.commentData;
        state.historyData = action.payload.data.historyData;
        state.error = null;
      })
      .addCase(fetchStudentTabsData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch comments data
      .addCase(fetchCommentsData.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(fetchCommentsData.fulfilled, (state, action) => {
        state.commentsLoading = false;
        // Transform CommentItem[] to CommentData[]
        state.commentData = action.payload.data.map((item) => ({
          date: item.createdOn,
          author: item.createdUser,
          comment: item.content,
        }));
        state.commentsStudentId = action.payload.studentId;
        state.commentsError = null;
      })
      .addCase(fetchCommentsData.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload as string;
      })
      // Fetch history data
      .addCase(fetchHistoryData.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchHistoryData.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = action.payload.data;
        state.historyStudentId = action.payload.studentId;
        state.historyError = null;
      })
      .addCase(fetchHistoryData.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      })
      // Fetch private lessons data
      .addCase(fetchPrivateLessonsData.pending, (state, action) => {
        const { studentId } = action.meta.arg as { location: string; studentId: string };
        
        // Clear private lesson data if switching to a different student
        if (state.currentStudentId !== null && state.currentStudentId !== studentId) {
          state.privateLessonData = [];
        }
        
        // Update current student ID
        state.currentStudentId = studentId;
        state.privateLessonLoading = true;
        state.privateLessonError = null;
      })
      .addCase(fetchPrivateLessonsData.fulfilled, (state, action) => {
        state.privateLessonLoading = false;
        state.privateLessonData = action.payload.data;
        state.privateLessonError = null;
      })
      .addCase(fetchPrivateLessonsData.rejected, (state, action) => {
        state.privateLessonLoading = false;
        state.privateLessonError = action.payload as string;
      })
      // Fetch group lessons data
      .addCase(fetchGroupLessonsData.pending, (state) => {
        state.groupLessonLoading = true;
        state.groupLessonError = null;
      })
      .addCase(fetchGroupLessonsData.fulfilled, (state, action) => {
        state.groupLessonLoading = false;
        state.groupLessonData = action.payload.data;
        state.groupLessonPagination = action.payload.pagination;
        state.groupLessonStudentId = action.payload.studentId;
        state.groupLessonError = null;
      })
      .addCase(fetchGroupLessonsData.rejected, (state, action) => {
        state.groupLessonLoading = false;
        state.groupLessonError = action.payload as string;
      });
  },
});

export const { 
  clearStudentTabs, 
  clearError,
  updateUnscheduledLessonsProgram,
} = studentTabsSlice.actions;
export default studentTabsSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getGroupCourseDetails, 
  GroupCourseDetailsApiResponse,
} from './groupCourseDetails.api';
import type { GroupCourseDetailsResponse } from './groupCourseDetails.api';

interface GroupCourseState {
  courseInfo: GroupCourseDetailsResponse | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentCourseId: number | null;
}

// Cache configuration - data is considered fresh for 5 minutes (300000ms)
const STALE_TIME_MS = 5 * 60 * 1000;

const initialState: GroupCourseState = {
  courseInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentCourseId: null,
};

/**
 * Fetches group course details from the API
 */
export const fetchGroupCourse = createAsyncThunk(
  'groupCourse/fetchGroupCourse',
  async (
    { location, courseId }: { location: string; courseId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getGroupCourseDetails(location, courseId);
      
      if (response && response.success) {
        return {
          courseInfo: response.data.body,
          fetchedAt: Date.now(),
        };
      }

      return rejectWithValue(response?.message || 'Failed to fetch group course details');
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
      state.courseInfo = null;
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
      .addCase(fetchGroupCourse.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupCourse.fulfilled, (state, action) => {
        state.isLoading = false;
        state.courseInfo = action.payload.courseInfo;
        state.lastFetched = action.payload.fetchedAt;
        state.currentCourseId = action.payload.courseInfo.id;
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


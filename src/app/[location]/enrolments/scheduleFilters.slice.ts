import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getProgramsList, getTeacherView, Program, Teacher } from '../schedule/schedule.api';
import { format } from 'date-fns';

interface TeachersByProgram {
  [programId: string]: Teacher[];
}

interface ScheduleFiltersState {
  programs: Program[];
  programsLoading: boolean;
  programsError: string | null;
  teachersByProgram: TeachersByProgram;
  teachersLoading: boolean;
  teachersError: string | null;
}

const initialState: ScheduleFiltersState = {
  programs: [],
  programsLoading: false,
  programsError: null,
  teachersByProgram: {},
  teachersLoading: false,
  teachersError: null,
};

// Async thunk for fetching programs
export const fetchPrograms = createAsyncThunk(
  'scheduleFilters/fetchPrograms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProgramsList();
      
      if (response?.success) {
        return response.data;
      }
      
      return rejectWithValue(response?.message || 'Failed to fetch programs');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch programs');
    }
  }
);

// Async thunk for fetching teachers by program
export const fetchTeachersByProgram = createAsyncThunk(
  'scheduleFilters/fetchTeachersByProgram',
  async (
    { location, programId }: { location: string; programId: string },
    { rejectWithValue }
  ) => {
    try {
      // Use today's date for the API call
      const today = new Date();
      const dateString = format(today, "yyyy-MM-dd");
      
      // Pass 'all-teachers-by-program' type to get all teachers associated with the program
      const response = await getTeacherView(
        location,
        dateString,
        false,
        programId,
        undefined,
        'all-teachers-by-program'
      );
      
      if (response?.success && response.data?.resources) {
        // Map TeacherViewResource (id, title) to Teacher (id, name)
        const teachersList = response.data.resources.map((t) => ({
          id: t.id,
          name: t.title,
        }));
        
        return { programId, teachers: teachersList };
      }
      
      return rejectWithValue('Failed to fetch teachers');
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch teachers');
    }
  }
);

const scheduleFiltersSlice = createSlice({
  name: 'scheduleFilters',
  initialState,
  reducers: {
    clearTeachersByProgram: (state, action: PayloadAction<string>) => {
      // Clear teachers for a specific program
      delete state.teachersByProgram[action.payload];
    },
    clearAllTeachers: (state) => {
      state.teachersByProgram = {};
    },
    clearError: (state) => {
      state.programsError = null;
      state.teachersError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Programs
      .addCase(fetchPrograms.pending, (state) => {
        state.programsLoading = true;
        state.programsError = null;
      })
      .addCase(fetchPrograms.fulfilled, (state, action) => {
        state.programsLoading = false;
        state.programs = action.payload;
        state.programsError = null;
      })
      .addCase(fetchPrograms.rejected, (state, action) => {
        state.programsLoading = false;
        state.programsError = action.payload as string;
      })
      // Teachers by program
      .addCase(fetchTeachersByProgram.pending, (state) => {
        state.teachersLoading = true;
        state.teachersError = null;
      })
      .addCase(fetchTeachersByProgram.fulfilled, (state, action) => {
        state.teachersLoading = false;
        state.teachersByProgram[action.payload.programId] = action.payload.teachers;
        state.teachersError = null;
      })
      .addCase(fetchTeachersByProgram.rejected, (state, action) => {
        state.teachersLoading = false;
        state.teachersError = action.payload as string;
      });
  },
});

export const {
  clearTeachersByProgram,
  clearAllTeachers,
  clearError,
} = scheduleFiltersSlice.actions;

export default scheduleFiltersSlice.reducer;


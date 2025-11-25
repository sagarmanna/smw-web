import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { fetchTeacherInfo } from './teachers.mock';
import { updateTeacherDetails, UpdateTeacherDetailsData } from '../teachers.api';
import type { TeacherInfo } from './teachers-details.interface';
import type { 
  TeacherBasicDetails, 
  TeacherEmail, 
  TeacherPhone, 
  TeacherAddress
} from '../types';

interface TeacherState {
  teacherInfo: TeacherInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: TeacherState = {
  teacherInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
};

// Async thunk for fetching teacher info
export const fetchTeacher = createAsyncThunk(
  'teacher/fetchTeacher',
  async (id: string, { rejectWithValue }) => {
    try {
      const result = await fetchTeacherInfo(id);

      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'Failed to fetch teacher info');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch teacher info');
    }
  }
);

// Async thunk for updating teacher details
export const updateTeacher = createAsyncThunk(
  'teacher/updateTeacher',
  async (
    { location, teacherId, data }: { location: string; teacherId: number; data: UpdateTeacherDetailsData },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateTeacherDetails(location, teacherId, data);

      if (response.status) {
        return data;
      } else {
        throw new Error(response.message || 'Failed to update teacher details');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update teacher details');
    }
  }
);

const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    clearTeacher: (state) => {
      state.teacherInfo = null;
      state.error = null;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Update emails in local state
    updateEmails: (state, action: PayloadAction<TeacherEmail[]>) => {
      if (state.teacherInfo) {
        state.teacherInfo.email = action.payload;
      }
    },
    // Update phones in local state
    updatePhones: (state, action: PayloadAction<TeacherPhone[]>) => {
      if (state.teacherInfo) {
        state.teacherInfo.phone = action.payload;
      }
    },
    // Update addresses in local state
    updateAddresses: (state, action: PayloadAction<TeacherAddress[]>) => {
      if (state.teacherInfo) {
        state.teacherInfo.addresses = action.payload;
      }
    },
    // Update profile details in local state
    updateProfile: (state, action: PayloadAction<Partial<TeacherBasicDetails>>) => {
      if (state.teacherInfo) {
        state.teacherInfo.profile = {
          ...state.teacherInfo.profile,
          name: action.payload.firstName && action.payload.lastName
            ? `${action.payload.firstName} ${action.payload.lastName}`
            : state.teacherInfo.profile.name,
          role: action.payload.role || state.teacherInfo.profile.role,
          birthDate: action.payload.birthDate || state.teacherInfo.profile.birthDate,
          picture: action.payload.picture || state.teacherInfo.profile.picture,
        };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Teacher info reducers
      .addCase(fetchTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacher.fulfilled, (state, action: PayloadAction<TeacherInfo>) => {
        state.isLoading = false;
        state.teacherInfo = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update teacher reducers
      .addCase(updateTeacher.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateTeacher.fulfilled, (state, action: PayloadAction<UpdateTeacherDetailsData>) => {
        state.isSaving = false;
        if (state.teacherInfo) {
          state.teacherInfo.profile = {
            ...state.teacherInfo.profile,
            name: `${action.payload.firstName} ${action.payload.lastName}`,
            birthDate: action.payload.birthDate || state.teacherInfo.profile.birthDate,
          };
        }
        state.error = null;
      })
      .addCase(updateTeacher.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTeacher, clearError, updateEmails, updatePhones, updateAddresses, updateProfile } = teacherSlice.actions;
export default teacherSlice.reducer;


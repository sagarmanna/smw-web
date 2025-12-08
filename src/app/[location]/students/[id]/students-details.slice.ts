import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getStudentDetails, 
  StudentDetailsApiResponse,
  updateStudentProfile
} from './students-details.api';
import type { StudentInfo, StudentBasicDetails, StudentEvaluation } from '../types';

export interface UpdateStudentDetailsData {
  firstName: string;
  lastName: string;
  birthday?: string;
  gender?: string;
  notes?: string;
}

interface StudentState {
  studentInfo: StudentInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentStudentId: string | null;
}

// Cache configuration - data is considered fresh for 5 minutes (300000ms)
const STALE_TIME_MS = 5 * 60 * 1000;

const initialState: StudentState = {
  studentInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentStudentId: null,
};

/**
 * Transforms API response to match the StudentInfo interface
 */
function transformApiResponse(apiResponse: StudentDetailsApiResponse): StudentInfo {
  const { body } = apiResponse.data;
  
  return {
    profile: {
      id: body.profile.id,
      firstName: body.profile.firstName,
      lastName: body.profile.lastName,
      birthday: body.profile.birthday || undefined,
      age: body.profile.age || undefined,
      gender: body.profile.gender || undefined,
      status: body.profile.status,
      notes: body.profile.notes || undefined,
    },
    customer: {
      customer: body.customer.customer,
      phone: body.customer.phone,
    },
    enrolments: body.enrolments || [],
    evaluations: body.evaluations || [],
  };
}

// Async thunk for fetching student info with caching
export const fetchStudent = createAsyncThunk(
  'student/fetchStudent',
  async (
    { location, studentId }: { location: string; studentId: string },
    { getState, rejectWithValue }
  ) => {
    try {
      // Check if we have fresh cached data
      const state = getState() as { student: StudentState };
      const studentState = state.student;
      
      if (
        studentState.studentInfo &&
        studentState.currentStudentId === studentId &&
        studentState.lastFetched &&
        Date.now() - studentState.lastFetched < STALE_TIME_MS
      ) {
        // Return cached data - no API call needed
        return { data: studentState.studentInfo, fromCache: true };
      }

      // Fetch from API
      const result = await getStudentDetails(location, studentId);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to fetch student info');
      }

      const transformedData = transformApiResponse(result);

      return { data: transformedData, fromCache: false };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch student info');
    }
  }
);

// Async thunk for updating student details
export const updateStudent = createAsyncThunk(
  'student/updateStudent',
  async (
    { location, studentId, data }: { location: string; studentId: string; data: UpdateStudentDetailsData },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateStudentProfile(location, studentId, {
        firstName: data.firstName,
        lastName: data.lastName,
        birthday: data.birthday,
        gender: data.gender,
        notes: data.notes,
      });

      if (response?.success) {
        return data;
      } else {
        throw new Error(response?.message || 'Failed to update student details');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update student details');
    }
  }
);

const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    clearStudent: (state) => {
      state.studentInfo = null;
      state.error = null;
      state.lastFetched = null;
      state.currentStudentId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Clear cache to force fresh fetch on next refresh
    clearCache: (state) => {
      state.lastFetched = null;
    },
    // Update profile details in local state
    updateProfile: (state, action: PayloadAction<Partial<StudentBasicDetails>>) => {
      if (state.studentInfo) {
        state.studentInfo.profile = {
          ...state.studentInfo.profile,
          firstName: action.payload.firstName || state.studentInfo.profile.firstName,
          lastName: action.payload.lastName || state.studentInfo.profile.lastName,
          birthday: action.payload.birthday || state.studentInfo.profile.birthday,
          age: action.payload.age || state.studentInfo.profile.age,
          gender: action.payload.gender || state.studentInfo.profile.gender,
          status: action.payload.status || state.studentInfo.profile.status,
          notes: action.payload.notes !== undefined ? action.payload.notes : state.studentInfo.profile.notes,
        };
      }
    },
    // Add evaluation to local state (optimistic update)
    addEvaluation: (state, action: PayloadAction<StudentEvaluation>) => {
      if (state.studentInfo) {
        state.studentInfo.evaluations = [
          ...(state.studentInfo.evaluations || []),
          action.payload,
        ];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Student info reducers
      .addCase(fetchStudent.pending, (state, action) => {
        // Track which student we're loading
        const { studentId } = action.meta.arg as { location: string; studentId: string };
        
        // If switching to a different student, clear old data
        if (state.currentStudentId !== null && state.currentStudentId !== studentId) {
          state.studentInfo = null;
          state.lastFetched = null;
        }
        
        state.currentStudentId = studentId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStudent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.studentInfo = action.payload.data;
        state.error = null;
        // Only update timestamp if data came from API, not cache
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchStudent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update student reducers
      .addCase(updateStudent.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateStudent.fulfilled, (state, action: PayloadAction<UpdateStudentDetailsData>) => {
        state.isSaving = false;
        if (state.studentInfo) {
          state.studentInfo.profile = {
            ...state.studentInfo.profile,
            firstName: action.payload.firstName,
            lastName: action.payload.lastName,
            birthday: action.payload.birthday || state.studentInfo.profile.birthday,
            gender: action.payload.gender || state.studentInfo.profile.gender,
            notes: action.payload.notes !== undefined ? action.payload.notes : state.studentInfo.profile.notes,
          };
        }
        state.error = null;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearStudent, 
  clearError, 
  clearCache,
  updateProfile,
  addEvaluation,
} = studentSlice.actions;
export default studentSlice.reducer;


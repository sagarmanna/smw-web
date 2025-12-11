import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getStudentDetails, 
  StudentDetailsApiResponse,
  getStudentEnrolments,
  StudentEnrolmentResponse,
  getStudentEvaluations,
  StudentEvaluationResponse,
} from './students-details.api';
import type { StudentInfo, StudentBasicDetails, StudentEvaluation, StudentEnrolment } from '../types';

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

const initialState: StudentState = {
  studentInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentStudentId: null,
};

/**
 * Helper function to split fullName into firstName and lastName
 */
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  // Take first part as firstName, rest as lastName
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

/**
 * Transforms enrolment API response to match the StudentEnrolment interface
 */
function transformEnrolmentsResponse(enrolments: StudentEnrolmentResponse[]): StudentEnrolment[] {
  return enrolments.map((enrolment) => ({
    id: enrolment.id,
    program: enrolment.programName,
    teacher: enrolment.teacherName,
    day: enrolment.day,
    fromTime: enrolment.fromTime,
    duration: enrolment.duration,
    startDate: enrolment.startDate,
    endDate: enrolment.endDate,
  }));
}

/**
 * Transforms evaluation API response to match the StudentEvaluation interface
 */
function transformEvaluationsResponse(evaluations: StudentEvaluationResponse[]): StudentEvaluation[] {
  return evaluations.map((evaluation) => ({
    id: evaluation.id,
    examDate: evaluation.date,
    mark: evaluation.mark,
    level: evaluation.level,
    program: evaluation.program,
    type: evaluation.type,
    teacher: evaluation.teacher,
  }));
}

/**
 * Transforms API response to match the StudentInfo interface
 */
function transformApiResponse(apiResponse: StudentDetailsApiResponse): StudentInfo {
  const { body } = apiResponse.data;
  const { student, customer } = body;
  
  // Split fullName into firstName and lastName
  const { firstName, lastName } = splitFullName(student.fullName);
  
  return {
    profile: {
      id: student.id.toString(),
      firstName,
      lastName,
      birthday: student.birthDate || undefined,
      age: student.age || undefined,
      gender: student.gender || undefined,
      status: student.status,
      notes: student.note || undefined,
    },
    customer: {
      customer: customer.name || "",
      phone: customer.phone || "",
      customerId: customer.id,
    },
    enrolments: [], // Will be fetched separately
    evaluations: [], // Will be fetched separately
  };
}

// Async thunk for fetching student info
// Called once in page.tsx during initial page load
export const fetchStudent = createAsyncThunk(
  'student/fetchStudent',
  async (
    { location, studentId }: { location: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      // Fetch student details, enrolments, and evaluations in parallel
      // Initial load: fetch page 1 with limit 10 for evaluations
      const [detailsResult, enrolmentsResult, evaluationsResult] = await Promise.all([
        getStudentDetails(location, studentId),
        getStudentEnrolments(location, studentId),
        getStudentEvaluations(location, studentId, 1, 10),
      ]);

      if (!detailsResult || !detailsResult.success) {
        throw new Error(detailsResult?.message || 'Failed to fetch student info');
      }

      const transformedData = transformApiResponse(detailsResult);

      // Transform and add enrolments if available
      if (enrolmentsResult && enrolmentsResult.success) {
        transformedData.enrolments = transformEnrolmentsResponse(enrolmentsResult.data.body);
      } else {
        transformedData.enrolments = [];
      }

      // Transform and add evaluations if available
      if (evaluationsResult && evaluationsResult.success) {
        transformedData.evaluations = transformEvaluationsResponse(evaluationsResult.data.body);
        // Store pagination info from API response
        const apiPagination = evaluationsResult.pagination || evaluationsResult.data.pagination;
        if (apiPagination) {
          transformedData.evaluationsPagination = apiPagination;
        }
      } else {
        transformedData.evaluations = [];
      }

      return { data: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch student info');
    }
  }
);

// Async thunk for updating student details (local state only, no API call)
export const updateStudent = createAsyncThunk(
  'student/updateStudent',
  async (
    { data }: { location: string; studentId: string; data: UpdateStudentDetailsData },
    { rejectWithValue }
  ) => {
    try {
      // Only update local state, no API call
      return data;
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
        // Update pagination total if pagination exists
        if (state.studentInfo.evaluationsPagination) {
          state.studentInfo.evaluationsPagination.total += 1;
          state.studentInfo.evaluationsPagination.totalPages = Math.ceil(
            state.studentInfo.evaluationsPagination.total / state.studentInfo.evaluationsPagination.limit
          );
        }
      }
    },
    // Update evaluation in local state (optimistic update)
    updateEvaluation: (state, action: PayloadAction<{ index: number; evaluation: StudentEvaluation }>) => {
      if (state.studentInfo && state.studentInfo.evaluations) {
        const { index, evaluation } = action.payload;
        const updated = [...state.studentInfo.evaluations];
        if (index >= 0 && index < updated.length) {
          updated[index] = evaluation;
          state.studentInfo.evaluations = updated;
        }
      }
    },
    // Remove evaluation from local state (optimistic update)
    removeEvaluation: (state, action: PayloadAction<number>) => {
      if (state.studentInfo && state.studentInfo.evaluations) {
        const evaluationId = action.payload;
        state.studentInfo.evaluations = state.studentInfo.evaluations.filter(
          (e) => e.id !== evaluationId
        );
        // Update pagination total if pagination exists
        if (state.studentInfo.evaluationsPagination) {
          state.studentInfo.evaluationsPagination.total = Math.max(0, state.studentInfo.evaluationsPagination.total - 1);
          state.studentInfo.evaluationsPagination.totalPages = Math.ceil(
            state.studentInfo.evaluationsPagination.total / state.studentInfo.evaluationsPagination.limit
          );
        }
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
        state.lastFetched = Date.now();
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
  updateEvaluation,
  removeEvaluation,
} = studentSlice.actions;
export default studentSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getStudentDetails, 
  StudentDetailsApiResponse,
  getStudentEnrolments,
  StudentEnrolmentResponse,
  getStudentEvaluations,
  StudentEvaluationResponse,
  updateStudentInfo,
  UpdateStudentInfoRequest,
  genderApiToDisplay,
} from './students-details.api';
import type { StudentInfo, StudentBasicDetails, StudentEvaluation, StudentEnrolment, StudentEvaluationsPagination } from '../types';

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
      gender: genderApiToDisplay(student.gender), // Convert API format to display format
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
// Always uses server-side pagination - fetches only page 1
export const fetchStudent = createAsyncThunk(
  'student/fetchStudent',
  async (
    { location, studentId }: { location: string; studentId: string },
    { rejectWithValue }
  ) => {
    try {
      // Fetch student details, enrolments, and first page of evaluations in parallel
      // Server-side pagination: only fetch page 1 with default limit
      const [detailsResult, enrolmentsResult, evaluationsResult] = await Promise.all([
        getStudentDetails(location, studentId),
        getStudentEnrolments(location, studentId),
        getStudentEvaluations(location, studentId, 1, 10), // Fetch only page 1
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

      // Transform and add evaluations if available (server-side pagination)
      if (evaluationsResult && evaluationsResult.success) {
        transformedData.evaluations = transformEvaluationsResponse(evaluationsResult.data.body);
        // Store pagination info from API response
        const apiPagination = evaluationsResult.pagination || evaluationsResult.data.pagination;
        if (apiPagination) {
          transformedData.evaluationsPagination = apiPagination;
        } else {
          // Fallback pagination if API doesn't provide it
          transformedData.evaluationsPagination = {
            page: 1,
            limit: 10,
            total: transformedData.evaluations.length,
            totalPages: Math.ceil(transformedData.evaluations.length / 10),
          };
        }
      } else {
        transformedData.evaluations = [];
        transformedData.evaluationsPagination = {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        };
      }

      return { data: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch student info');
    }
  }
);

// Async thunk for fetching evaluations page (server-side pagination and sorting)
export const fetchEvaluationsPage = createAsyncThunk(
  'student/fetchEvaluationsPage',
  async (
    { 
      location, 
      studentId, 
      page, 
      limit, 
      sort, 
      order 
    }: { 
      location: string; 
      studentId: string; 
      page: number; 
      limit: number;
      sort?: string;
      order?: "asc" | "desc";
    },
    { rejectWithValue }
  ) => {
    try {
      const result = await getStudentEvaluations(location, studentId, page, limit, sort, order);
      
      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to fetch evaluations page');
      }

      const evaluations = transformEvaluationsResponse(result.data.body);
      const apiPagination = result.pagination || result.data.pagination;

      return {
        evaluations,
        pagination: apiPagination || {
          page,
          limit,
          total: evaluations.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch evaluations page');
    }
  }
);

// Async thunk for fetching enrolments with showAll parameter
export const fetchStudentEnrolments = createAsyncThunk(
  'student/fetchStudentEnrolments',
  async (
    { location, studentId, showAll }: { location: string; studentId: string; showAll: boolean },
    { rejectWithValue }
  ) => {
    try {
      const result = await getStudentEnrolments(location, studentId, showAll);
      
      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to fetch student enrolments');
      }

      const enrolments = transformEnrolmentsResponse(result.data.body);

      return { enrolments };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch student enrolments');
    }
  }
);

// Async thunk for updating student details via API
export const updateStudent = createAsyncThunk(
  'student/updateStudent',
  async (
    { location, studentId, data }: { location: string; studentId: string; data: UpdateStudentDetailsData },
    { rejectWithValue }
  ) => {
    try {
      // Call the API to update student info
      const apiData: UpdateStudentInfoRequest = {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthday || "",
        gender: data.gender || "0", // API expects "1", "2", or "0"
        note: data.notes || "",
      };
      
      const result = await updateStudentInfo(location, studentId, apiData);
      
      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update student details');
      }
      
      // Return PUT response data only (no GET call needed - follow caching pattern)
      // Age and formatted dates will be calculated/updated in the reducer using existing state
      return { putResponse: result.data };
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
    // Add evaluation to local state (works with server-side pagination)
    // Only adds to current page if we're on page 1, otherwise just updates total count
    addEvaluation: (state, action: PayloadAction<StudentEvaluation>) => {
      if (state.studentInfo) {
        const newEvaluation = action.payload;
        const pagination = state.studentInfo.evaluationsPagination;
        
        // If we're on page 1, add to the beginning of the list
        // Otherwise, just update the total count (evaluation is on a different page)
        if (pagination && pagination.page === 1) {
          state.studentInfo.evaluations = [
            newEvaluation,
            ...(state.studentInfo.evaluations || []),
          ];
        }
        
        // Update pagination total
        if (pagination) {
          pagination.total += 1;
          pagination.totalPages = Math.ceil(pagination.total / pagination.limit);
        }
      }
    },
    // Update evaluation in local state (by ID, works with server-side pagination)
    updateEvaluation: (state, action: PayloadAction<{ evaluationId: number; evaluation: StudentEvaluation }>) => {
      if (state.studentInfo && state.studentInfo.evaluations) {
        const { evaluationId, evaluation } = action.payload;
        const index = state.studentInfo.evaluations.findIndex((e) => e.id === evaluationId);
        if (index >= 0) {
          const updated = [...state.studentInfo.evaluations];
          updated[index] = evaluation;
          state.studentInfo.evaluations = updated;
        }
      }
    },
    // Remove evaluation from local state (works with server-side pagination)
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
    // Set evaluations page (for server-side pagination)
    setEvaluationsPage: (state, action: PayloadAction<{ evaluations: StudentEvaluation[]; pagination: StudentEvaluationsPagination }>) => {
      if (state.studentInfo) {
        state.studentInfo.evaluations = action.payload.evaluations;
        state.studentInfo.evaluationsPagination = action.payload.pagination;
      }
    },
    // Set enrolments (for showAll functionality)
    setEnrolments: (state, action: PayloadAction<StudentEnrolment[]>) => {
      if (state.studentInfo) {
        state.studentInfo.enrolments = action.payload;
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
      .addCase(updateStudent.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update state from API response - no client-side recalculation
        if (state.studentInfo && action.payload) {
          const { putResponse } = action.payload;
          
          // Update Redux state directly from PUT response (no GET call needed - follow caching pattern)
          // Keep existing age and formatted birthday from state (PUT response doesn't include these)
          state.studentInfo.profile = {
            ...state.studentInfo.profile,
            firstName: putResponse.firstName,
            lastName: putResponse.lastName,
            // Keep existing formatted birthday (PUT response has YYYY-MM-DD, we keep display format)
            // birthday: state.studentInfo.profile.birthday,
            // Keep existing age (PUT response doesn't include age)
            // age: state.studentInfo.profile.age,
            gender: genderApiToDisplay(putResponse.gender),
            notes: putResponse.note !== undefined ? putResponse.note : state.studentInfo.profile.notes,
          };
        }
        state.error = null;
      })
      .addCase(updateStudent.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Fetch evaluations page reducers (server-side pagination)
      .addCase(fetchEvaluationsPage.pending, () => {
        // Don't set isLoading to true to avoid showing loading for entire page
      })
      .addCase(fetchEvaluationsPage.fulfilled, (state, action) => {
        if (state.studentInfo) {
          state.studentInfo.evaluations = action.payload.evaluations;
          state.studentInfo.evaluationsPagination = action.payload.pagination;
        }
      })
      .addCase(fetchEvaluationsPage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      // Fetch enrolments reducers
      .addCase(fetchStudentEnrolments.fulfilled, (state, action) => {
        if (state.studentInfo) {
          state.studentInfo.enrolments = action.payload.enrolments;
        }
      })
      .addCase(fetchStudentEnrolments.rejected, (state, action) => {
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
  setEvaluationsPage,
  setEnrolments,
} = studentSlice.actions;
export default studentSlice.reducer;


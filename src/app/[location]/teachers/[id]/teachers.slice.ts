import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getTeacherDetails, TeacherDetailsApiResponse, updateTeacherProfile } from './teachers-details.api';

export interface UpdateTeacherDetailsData {
  firstName: string;
  lastName: string;
  birthDate?: string;
}
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
  currentTeacherId: number | null;
}

// Cache configuration - data is considered fresh for 5 minutes (300000ms)
const STALE_TIME_MS = 5 * 60 * 1000;

const initialState: TeacherState = {
  teacherInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentTeacherId: null,
};

/**
 * Transforms API response to match the TeacherInfo interface
 */
function transformApiResponse(apiResponse: TeacherDetailsApiResponse): TeacherInfo {
  const { body } = apiResponse.data;
  
  return {
    profile: {
      name: body.profile.name,
      role: body.profile.role,
      birthDate: body.profile.birthDate || undefined,
      picture: undefined, // Not in API response
    },
    email: body.email.map((email) => ({
      id: email.id.toString(),
      label: email.label,
      email: email.email,
      note: email.note || undefined,
      isPrimary: email.isPrimary,
    })),
    phone: body.phone.map((phone) => ({
      id: phone.id.toString(),
      label: phone.label,
      number: phone.number,
      extension: phone.extension || undefined,
      note: phone.note || undefined,
      isPrimary: phone.isPrimary,
    })),
    addresses: body.addresses.map((address) => ({
      id: address.id.toString(),
      label: address.label,
      address: address.address,
      city: address.city,
      provinceId: 0, // Not in API response, default to 0
      countryId: 0, // Not in API response, default to 0
      cityId: 0, // Not in API response, default to 0
      postalCode: address.postalCode,
      province: address.province || undefined,
      country: address.country || undefined,
      note: undefined, // Not in API response
      isPrimary: address.isPrimary,
    })),
  };
}

// Async thunk for fetching teacher info with caching
export const fetchTeacher = createAsyncThunk(
  'teacher/fetchTeacher',
  async (
    { location, teacherId }: { location: string; teacherId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      // Check if we have fresh cached data
      const state = getState() as { teacher: TeacherState };
      const teacherState = state.teacher;
      
      if (
        teacherState.teacherInfo &&
        teacherState.currentTeacherId === teacherId &&
        teacherState.lastFetched &&
        Date.now() - teacherState.lastFetched < STALE_TIME_MS
      ) {
        // Return cached data - no API call needed
        return { data: teacherState.teacherInfo, fromCache: true };
      }

      // Fetch from API
      const result = await getTeacherDetails(location, teacherId);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to fetch teacher info');
      }

      const transformedData = transformApiResponse(result);
      return { data: transformedData, fromCache: false };
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
      const response = await updateTeacherProfile(location, teacherId, {
        firstname: data.firstName,
        lastname: data.lastName,
        birthDate: data.birthDate,
      });

      if (response?.success) {
        return data;
      } else {
        throw new Error(response?.message || 'Failed to update teacher details');
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
      state.currentTeacherId = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Clear cache to force fresh fetch on next refresh
    clearCache: (state) => {
      state.lastFetched = null;
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
      .addCase(fetchTeacher.pending, (state, action) => {
        // Track which teacher we're loading
        const { teacherId } = action.meta.arg as { location: string; teacherId: number };
        
        // If switching to a different teacher, clear old data
        if (state.currentTeacherId !== null && state.currentTeacherId !== teacherId) {
          state.teacherInfo = null;
          state.lastFetched = null;
        }
        
        state.currentTeacherId = teacherId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.teacherInfo = action.payload.data;
        state.error = null;
        // Only update timestamp if data came from API, not cache
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
        }
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

export const { clearTeacher, clearError, clearCache, updateEmails, updatePhones, updateAddresses, updateProfile } = teacherSlice.actions;
export default teacherSlice.reducer;


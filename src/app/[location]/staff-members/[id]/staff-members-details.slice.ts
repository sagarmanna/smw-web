import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getStaffMemberDetails, 
  StaffMemberDetailsApiResponse,
  updateStaffMemberProfile
} from './staff-members-details.api';
import type { StaffMemberInfo } from './staff-members-details.interface';
import type { 
  StaffMemberBasicDetails, 
  StaffMemberEmail, 
  StaffMemberPhone, 
  StaffMemberAddress
} from '../types';

export interface UpdateStaffMemberDetailsData {
  firstName: string;
  lastName: string;
}

interface StaffMemberState {
  staffMemberInfo: StaffMemberInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentStaffMemberId: number | null;
}

// Cache configuration - data is considered fresh for 5 minutes (300000ms)
const STALE_TIME_MS = 5 * 60 * 1000;

const initialState: StaffMemberState = {
  staffMemberInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentStaffMemberId: null,
};

/**
 * Transforms API response to match the StaffMemberInfo interface
 */
function transformApiResponse(apiResponse: StaffMemberDetailsApiResponse): StaffMemberInfo {
  const { body } = apiResponse.data;
  
  return {
    profile: {
      name: body.profile.name,
      role: body.profile.role,
      birthDate: body.profile.birthDate || undefined,
      picture: undefined,
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
    })),
    addresses: body.addresses.map((address) => ({
      id: address.id.toString(),
      label: address.label,
      address: address.address,
      city: address.city,
      provinceId: 0,
      countryId: 0,
      cityId: 0,
      postalCode: address.postalCode,
      province: address.province || undefined,
      country: address.country || undefined,
      isPrimary: address.isPrimary,
    })),
  };
}

/**
 * Async thunk to fetch staff member details
 */
export const fetchStaffMember = createAsyncThunk(
  'staffMember/fetchStaffMember',
  async (
    { location, staffMemberId }: { location: string; staffMemberId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { staffMemberDetails: StaffMemberState };
      const { staffMemberInfo, lastFetched, currentStaffMemberId } = state.staffMemberDetails;

      // Check if we have fresh cached data for this staff member
      if (
        staffMemberInfo &&
        currentStaffMemberId === staffMemberId &&
        lastFetched &&
        Date.now() - lastFetched < STALE_TIME_MS
      ) {
        return { staffMemberInfo, fromCache: true };
      }

      const response = await getStaffMemberDetails(location, staffMemberId);
      
      if (!response || !response.success) {
        return rejectWithValue('Failed to fetch staff member details');
      }

      const transformedData = transformApiResponse(response);
      return { staffMemberInfo: transformedData, fromCache: false };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch staff member details');
    }
  }
);

/**
 * Async thunk to update staff member profile
 */
export const updateStaffMemberDetailsThunk = createAsyncThunk(
  'staffMember/updateStaffMemberDetails',
  async (
    {
      location,
      staffMemberId,
      data,
    }: {
      location: string;
      staffMemberId: number;
      data: UpdateStaffMemberDetailsData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateStaffMemberProfile(location, staffMemberId, {
        firstname: data.firstName,
        lastname: data.lastName,
      });

      if (!response || !response.success) {
        return rejectWithValue(response?.message || 'Failed to update staff member details');
      }

      return { data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update staff member details');
    }
  }
);

const staffMemberSlice = createSlice({
  name: 'staffMember',
  initialState,
  reducers: {
    clearStaffMember: (state) => {
      state.staffMemberInfo = null;
      state.currentStaffMemberId = null;
      state.lastFetched = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCache: (state) => {
      state.lastFetched = null;
    },
    updateDetails: (state, action: PayloadAction<Partial<StaffMemberBasicDetails>>) => {
      if (state.staffMemberInfo) {
        const { firstName, lastName } = action.payload;
        if (firstName !== undefined || lastName !== undefined) {
          const currentFirstName = firstName || state.staffMemberInfo.profile.name.split(' ')[0];
          const currentLastName = lastName || state.staffMemberInfo.profile.name.split(' ').slice(1).join(' ') || '';
          state.staffMemberInfo.profile.name = `${currentFirstName} ${currentLastName}`.trim();
        }
      }
    },
    updateEmails: (state, action: PayloadAction<StaffMemberEmail[]>) => {
      if (state.staffMemberInfo) {
        state.staffMemberInfo.email = action.payload;
      }
    },
    updatePhones: (state, action: PayloadAction<StaffMemberPhone[]>) => {
      if (state.staffMemberInfo) {
        state.staffMemberInfo.phone = action.payload;
      }
    },
    updateAddresses: (state, action: PayloadAction<StaffMemberAddress[]>) => {
      if (state.staffMemberInfo) {
        state.staffMemberInfo.addresses = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch staff member
      .addCase(fetchStaffMember.pending, (state, action) => {
        const { staffMemberId } = action.meta.arg as { location: string; staffMemberId: number };
        if (state.currentStaffMemberId !== null && state.currentStaffMemberId !== staffMemberId) {
          state.staffMemberInfo = null;
          state.lastFetched = null;
        }
        state.currentStaffMemberId = staffMemberId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffMemberInfo = action.payload.staffMemberInfo;
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchStaffMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update staff member details
      .addCase(updateStaffMemberDetailsThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateStaffMemberDetailsThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.staffMemberInfo) {
          // Update profile name from firstName and lastName
          const fullName = `${action.payload.data.firstName} ${action.payload.data.lastName}`.trim();
          state.staffMemberInfo.profile.name = fullName;
        }
        state.error = null;
      })
      .addCase(updateStaffMemberDetailsThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearStaffMember, 
  clearError, 
  clearCache,
  updateDetails,
  updateEmails, 
  updatePhones, 
  updateAddresses 
} = staffMemberSlice.actions;
export default staffMemberSlice.reducer;


import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getStaffMemberDetails, 
  StaffMemberDetailsApiResponse
} from './staff-members-details.api';
import type { StaffMemberInfo } from './staff-members-details.interface';
import type { 
  StaffMemberBasicDetails, 
  StaffMemberEmail, 
  StaffMemberPhone, 
  StaffMemberAddress
} from '../types';

interface StaffMemberState {
  staffMemberInfo: StaffMemberInfo | null;
  isLoading: boolean;
  error: string | null;
  currentStaffMemberId: number | null;
}

const initialState: StaffMemberState = {
  staffMemberInfo: null,
  isLoading: false,
  error: null,
  currentStaffMemberId: null,
};

/**
 * Transforms API response to match the StaffMemberInfo interface
 * Handles empty strings by converting them to undefined for optional fields
 */
function transformApiResponse(apiResponse: StaffMemberDetailsApiResponse): StaffMemberInfo {
  const { body } = apiResponse.data;
  
  return {
    profile: {
      name: body.profile.name,
      role: body.profile.role,
      // Convert empty string to undefined for optional fields
      birthDate: body.profile.birthDate?.trim() || undefined,
      picture: undefined,
    },
    email: body.email.map((email) => ({
      id: email.id.toString(),
      label: email.label,
      email: email.email,
      note: email.note?.trim() || undefined,
      isPrimary: email.isPrimary,
    })),
    phone: body.phone.map((phone) => ({
      id: phone.id.toString(),
      label: phone.label,
      number: phone.number,
      extension: phone.extension != null ? String(phone.extension).trim() || undefined : undefined,
      note: phone.note?.trim() || undefined,
      isPrimary: phone.isPrimary,
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
      province: address.province?.trim() || undefined,
      country: address.country?.trim() || undefined,
      isPrimary: address.isPrimary,
    })),
  };
}

/**
 * Async thunk to fetch staff member details
 * Called once in page.tsx during initial page load
 * No caching - always fetches fresh data from API
 */
export const fetchStaffMember = createAsyncThunk(
  'staffMemberDetails/fetchStaffMember',
  async (
    { location, staffMemberId }: { location: string; staffMemberId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getStaffMemberDetails(location, staffMemberId);
      
      if (!response || !response.success) {
        return rejectWithValue('Failed to fetch staff member details');
      }

      const transformedData = transformApiResponse(response);
      return { staffMemberInfo: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch staff member details');
    }
  }
);


const staffMemberSlice = createSlice({
  name: 'staffMemberDetails',
  initialState,
  reducers: {
    clearStaffMember: (state) => {
      state.staffMemberInfo = null;
      state.currentStaffMemberId = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
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
        // Clear data if fetching a different staff member
        if (state.currentStaffMemberId !== null && state.currentStaffMemberId !== staffMemberId) {
          state.staffMemberInfo = null;
        }
        state.currentStaffMemberId = staffMemberId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffMember.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staffMemberInfo = action.payload.staffMemberInfo;
        state.error = null;
      })
      .addCase(fetchStaffMember.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearStaffMember, 
  clearError, 
  updateDetails,
  updateEmails, 
  updatePhones, 
  updateAddresses 
} = staffMemberSlice.actions;
export default staffMemberSlice.reducer;


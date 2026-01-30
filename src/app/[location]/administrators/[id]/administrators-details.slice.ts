import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getAdministratorDetails, 
  AdministratorDetailsApiResponse
} from './administrators-details.api';
import type { AdministratorInfo } from './administrators-details.interface';
import type { 
  AdministratorBasicDetails, 
  AdministratorEmail, 
  AdministratorPhone, 
  AdministratorAddress
} from '../types';

interface AdministratorState {
  administratorInfo: AdministratorInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  currentAdministratorId: number | null;
}

const initialState: AdministratorState = {
  administratorInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  currentAdministratorId: null,
};

/**
 * Transforms API response to match the AdministratorInfo interface
 * Uses optional chaining to safely handle empty/invalid data
 * Returns null if the profile data is invalid (e.g., user not found)
 */
function transformApiResponse(apiResponse: AdministratorDetailsApiResponse): AdministratorInfo | null {
  const body = apiResponse?.data?.body;
  
  // Use optional chaining to safely access profile properties
  // If profile is an empty array [], profile?.name will be undefined
  const profileName = (body?.profile as { name?: string })?.name;
  const profileRole = (body?.profile as { role?: string })?.role;
  const profileBirthDate = (body?.profile as { birthDate?: string })?.birthDate;
  
  // Check if we have valid profile data using optional chaining result
  if (!profileName) {
    return null; // Administrator not found
  }
  
  return {
    profile: {
      name: profileName,
      role: profileRole || '',
      birthDate: profileBirthDate?.trim() || undefined,
      picture: undefined,
    },
    email: (body?.email ?? []).map((email) => ({
      id: email?.id?.toString() ?? '',
      label: email?.label ?? '',
      email: email?.email ?? '',
      note: email?.note?.trim() || undefined,
      isPrimary: email?.isPrimary ?? false,
    })),
    phone: (body?.phone ?? []).map((phone) => ({
      id: phone?.id?.toString() ?? '',
      label: phone?.label ?? '',
      number: phone?.number ?? '',
      extension: phone?.extension ? String(phone.extension).trim() || undefined : undefined,
      note: phone?.note?.trim() || undefined,
    })),
    addresses: (body?.addresses ?? []).map((address) => ({
      id: address?.id?.toString() ?? '',
      label: address?.label ?? '',
      address: address?.address ?? '',
      city: address?.city ?? '',
      provinceId: 0,
      countryId: 0,
      cityId: 0,
      postalCode: address?.postalCode ?? '',
      province: address?.province?.trim() || undefined,
      country: address?.country?.trim() || undefined,
      isPrimary: address?.isPrimary ?? false,
    })),
  };
}

/**
 * Async thunk to fetch administrator details
 * Called once in page.tsx during initial page load
 * No caching - always fetches fresh data from API
 */
export const fetchAdministrator = createAsyncThunk(
  'administrator/fetchAdministrator',
  async (
    { location, administratorId }: { location: string; administratorId: number },
    { rejectWithValue }
  ) => {
    try {
      // Validate administratorId is a valid number
      if (isNaN(administratorId) || administratorId <= 0) {
        return rejectWithValue('Invalid administrator ID');
      }

      const response = await getAdministratorDetails(location, administratorId);
      
      if (!response) {
        return rejectWithValue('Failed to fetch administrator details');
      }

      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch administrator details');
      }

      // transformApiResponse returns null if profile data is invalid
      const transformedData = transformApiResponse(response);
      
      // Check if data is valid using optional chaining result
      if (!transformedData) {
        return rejectWithValue('Administrator not found');
      }
      
      return { administratorInfo: transformedData };
    } catch (error) {
      // Handle specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch administrator details';
      return rejectWithValue(errorMessage);
    }
  }
);


const administratorSlice = createSlice({
  name: 'administrator',
  initialState,
  reducers: {
    clearAdministrator: (state) => {
      state.administratorInfo = null;
      state.currentAdministratorId = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateDetails: (state, action: PayloadAction<Partial<AdministratorBasicDetails>>) => {
      if (state.administratorInfo) {
        const { firstName, lastName } = action.payload;
        if (firstName !== undefined || lastName !== undefined) {
          const currentFirstName = firstName || state.administratorInfo.profile.name.split(' ')[0];
          const currentLastName = lastName || state.administratorInfo.profile.name.split(' ').slice(1).join(' ') || '';
          state.administratorInfo.profile.name = `${currentFirstName} ${currentLastName}`.trim();
        }
      }
    },
    updateEmails: (state, action: PayloadAction<AdministratorEmail[]>) => {
      if (state.administratorInfo) {
        state.administratorInfo.email = action.payload;
      }
    },
    updatePhones: (state, action: PayloadAction<AdministratorPhone[]>) => {
      if (state.administratorInfo) {
        state.administratorInfo.phone = action.payload;
      }
    },
    updateAddresses: (state, action: PayloadAction<AdministratorAddress[]>) => {
      if (state.administratorInfo) {
        state.administratorInfo.addresses = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch administrator
      .addCase(fetchAdministrator.pending, (state, action) => {
        const { administratorId } = action.meta.arg as { location: string; administratorId: number };
        // Clear data if fetching a different administrator
        if (state.currentAdministratorId !== null && state.currentAdministratorId !== administratorId) {
          state.administratorInfo = null;
        }
        state.currentAdministratorId = administratorId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdministrator.fulfilled, (state, action) => {
        state.isLoading = false;
        state.administratorInfo = action.payload.administratorInfo;
        state.error = null;
      })
      .addCase(fetchAdministrator.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAdministrator, 
  clearError, 
  updateDetails,
  updateEmails, 
  updatePhones, 
  updateAddresses 
} = administratorSlice.actions;
export default administratorSlice.reducer;


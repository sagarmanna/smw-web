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
import type { RootState } from '@/redux/store';

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
 * Handles empty strings by converting them to undefined for optional fields
 */
function transformApiResponse(apiResponse: AdministratorDetailsApiResponse): AdministratorInfo {
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
      extension: phone.extension?.trim() || undefined,
      note: phone.note?.trim() || undefined,
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
      const response = await getAdministratorDetails(location, administratorId);
      
      if (!response || !response.success) {
        return rejectWithValue('Failed to fetch administrator details');
      }

      const transformedData = transformApiResponse(response);
      return { administratorInfo: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch administrator details');
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


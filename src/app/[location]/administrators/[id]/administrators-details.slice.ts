import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getAdministratorDetails, 
  AdministratorDetailsApiResponse,
  updateAdministratorProfile
} from './administrators-details.api';
import type { AdministratorInfo } from './administrators-details.interface';
import type { 
  AdministratorBasicDetails, 
  AdministratorEmail, 
  AdministratorPhone, 
  AdministratorAddress
} from '../types';

export interface UpdateAdministratorDetailsData {
  firstName: string;
  lastName: string;
}

interface AdministratorState {
  administratorInfo: AdministratorInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentAdministratorId: number | null;
}

// Cache configuration - data is considered fresh for 5 minutes (300000ms)
const STALE_TIME_MS = 5 * 60 * 1000;

const initialState: AdministratorState = {
  administratorInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentAdministratorId: null,
};

/**
 * Transforms API response to match the AdministratorInfo interface
 */
function transformApiResponse(apiResponse: AdministratorDetailsApiResponse): AdministratorInfo {
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
 * Async thunk to fetch administrator details
 */
export const fetchAdministrator = createAsyncThunk(
  'administrator/fetchAdministrator',
  async (
    { location, administratorId }: { location: string; administratorId: number },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { administrator: AdministratorState };
      const { administratorInfo, lastFetched, currentAdministratorId } = state.administrator;

      // Check if we have fresh cached data for this administrator
      if (
        administratorInfo &&
        currentAdministratorId === administratorId &&
        lastFetched &&
        Date.now() - lastFetched < STALE_TIME_MS
      ) {
        return { administratorInfo, fromCache: true };
      }

      const response = await getAdministratorDetails(location, administratorId);
      
      if (!response || !response.success) {
        return rejectWithValue('Failed to fetch administrator details');
      }

      const transformedData = transformApiResponse(response);
      return { administratorInfo: transformedData, fromCache: false };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch administrator details');
    }
  }
);

/**
 * Async thunk to update administrator profile
 */
export const updateAdministratorDetailsThunk = createAsyncThunk(
  'administrator/updateAdministratorDetails',
  async (
    {
      location,
      administratorId,
      data,
    }: {
      location: string;
      administratorId: number;
      data: UpdateAdministratorDetailsData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateAdministratorProfile(location, administratorId, {
        firstname: data.firstName,
        lastname: data.lastName,
      });

      if (!response || !response.success) {
        return rejectWithValue(response?.message || 'Failed to update administrator details');
      }

      return { data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update administrator details');
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
      state.lastFetched = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCache: (state) => {
      state.lastFetched = null;
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
        if (state.currentAdministratorId !== null && state.currentAdministratorId !== administratorId) {
          state.administratorInfo = null;
          state.lastFetched = null;
        }
        state.currentAdministratorId = administratorId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdministrator.fulfilled, (state, action) => {
        state.isLoading = false;
        state.administratorInfo = action.payload.administratorInfo;
        if (!action.payload.fromCache) {
          state.lastFetched = Date.now();
        }
      })
      .addCase(fetchAdministrator.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update administrator details
      .addCase(updateAdministratorDetailsThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateAdministratorDetailsThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.administratorInfo) {
          // Update profile name from firstName and lastName
          const fullName = `${action.payload.data.firstName} ${action.payload.data.lastName}`.trim();
          state.administratorInfo.profile.name = fullName;
        }
        state.error = null;
      })
      .addCase(updateAdministratorDetailsThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearAdministrator, 
  clearError, 
  clearCache,
  updateDetails,
  updateEmails, 
  updatePhones, 
  updateAddresses 
} = administratorSlice.actions;
export default administratorSlice.reducer;


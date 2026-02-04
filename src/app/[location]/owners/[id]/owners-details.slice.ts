import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getOwnerDetails, 
  OwnerDetailsApiResponse,
  updateOwnerProfile
} from './owners-details.api';
import type { OwnerInfo } from './owners-details.interface';
import type { 
  OwnerBasicDetails, 
  OwnerEmail, 
  OwnerPhone, 
  OwnerAddress
} from '../types';

export interface UpdateOwnerDetailsData {
  firstName: string;
  lastName: string;
}

interface OwnerState {
  ownerInfo: OwnerInfo | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  currentOwnerId: number | null;
}

const initialState: OwnerState = {
  ownerInfo: null,
  isLoading: false,
  isSaving: false,
  error: null,
  currentOwnerId: null,
};

/**
 * Transforms API response to match the OwnerInfo interface
 */
function transformApiResponse(apiResponse: OwnerDetailsApiResponse): OwnerInfo {
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
      isPrimary: phone.isPrimary ?? false,
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
 * Async thunk to fetch owner details
 */
export const fetchOwner = createAsyncThunk(
  'ownerDetails/fetchOwner',
  async (
    { location, ownerId }: { location: string; ownerId: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await getOwnerDetails(location, ownerId);
      
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to fetch owner details');
      }

      const transformedData = transformApiResponse(response);
      return { ownerInfo: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch owner details');
    }
  }
);

/**
 * Async thunk to update owner profile
 */
export const updateOwnerDetailsThunk = createAsyncThunk(
  'ownerDetails/updateOwnerDetails',
  async (
    {
      location,
      ownerId,
      data,
    }: {
      location: string;
      ownerId: number;
      data: UpdateOwnerDetailsData;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateOwnerProfile(location, ownerId, {
        firstname: data.firstName,
        lastname: data.lastName,
      });

      if (!response || !response.success) {
        return rejectWithValue(response?.message || 'Failed to update owner details');
      }

      return { data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update owner details');
    }
  }
);

const ownerDetailsSlice = createSlice({
  name: 'ownerDetails',
  initialState,
  reducers: {
    clearOwner: (state) => {
      state.ownerInfo = null;
      state.currentOwnerId = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateDetails: (state, action: PayloadAction<Partial<OwnerBasicDetails>>) => {
      if (state.ownerInfo) {
        const { firstName, lastName } = action.payload;
        if (firstName !== undefined || lastName !== undefined) {
          const currentFirstName = firstName || state.ownerInfo.profile.name.split(' ')[0];
          const currentLastName = lastName || state.ownerInfo.profile.name.split(' ').slice(1).join(' ') || '';
          state.ownerInfo.profile.name = `${currentFirstName} ${currentLastName}`.trim();
        }
      }
    },
    updateEmails: (state, action: PayloadAction<OwnerEmail[]>) => {
      if (state.ownerInfo) {
        state.ownerInfo.email = action.payload;
      }
    },
    updatePhones: (state, action: PayloadAction<OwnerPhone[]>) => {
      if (state.ownerInfo) {
        state.ownerInfo.phone = action.payload;
      }
    },
    updateAddresses: (state, action: PayloadAction<OwnerAddress[]>) => {
      if (state.ownerInfo) {
        state.ownerInfo.addresses = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch owner
      .addCase(fetchOwner.pending, (state, action) => {
        const { ownerId } = action.meta.arg as { location: string; ownerId: number };
        if (state.currentOwnerId !== null && state.currentOwnerId !== ownerId) {
          state.ownerInfo = null;
        }
        state.currentOwnerId = ownerId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOwner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ownerInfo = action.payload.ownerInfo;
      })
      .addCase(fetchOwner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update owner details
      .addCase(updateOwnerDetailsThunk.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateOwnerDetailsThunk.fulfilled, (state, action) => {
        state.isSaving = false;
        if (state.ownerInfo) {
          // Update profile name from firstName and lastName
          const fullName = `${action.payload.data.firstName} ${action.payload.data.lastName}`.trim();
          state.ownerInfo.profile.name = fullName;
        }
        state.error = null;
      })
      .addCase(updateOwnerDetailsThunk.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      });
  },
});

export const { 
  clearOwner, 
  clearError, 
  updateDetails,
  updateEmails, 
  updatePhones, 
  updateAddresses 
} = ownerDetailsSlice.actions;
export default ownerDetailsSlice.reducer;


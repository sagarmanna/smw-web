import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { DEFAULT_LOCATION_FLAGS } from '@/utils/locationFlags';

interface LocationFlags {
  [feature: string]: 'modern' | 'legacy' | 'disabled';
}

interface LocationFlagsState {
  flags: { [location: string]: LocationFlags };
  isLoading: boolean;
  error: string | null;
  lastFetched: { [location: string]: number };
}

const initialState: LocationFlagsState = {
  flags: {},
  isLoading: false,
  error: null,
  lastFetched: {},
};

export const fetchLocationFlags = createAsyncThunk(
  'locationFlags/fetchLocationFlags',
  async (location: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/v2/locations/${location}/flags`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      // Merge API response with default flags to ensure all flags are present
      const apiFlags = response.data.data || {};
      const defaultFlags = DEFAULT_LOCATION_FLAGS[location] || {};
      const mergedFlags = { ...defaultFlags, ...apiFlags };
      
      return { location, flags: mergedFlags };
    } catch (error: unknown) {
      // Fallback to default flags when API fails
      const defaultFlags = DEFAULT_LOCATION_FLAGS[location] || {};
      return { location, flags: defaultFlags };
    }
  }
);

export const updateLocationFlags = createAsyncThunk(
  'locationFlags/updateLocationFlags',
  async (
    { location, flags }: { location: string; flags: LocationFlags },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/v2/locations/${location}/flags`,
        { flags },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return { location, flags: response.data.data };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const axiosError = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(axiosError.response?.data?.message || errorMessage);
    }
  }
);

const locationFlagsSlice = createSlice({
  name: 'locationFlags',
  initialState,
  reducers: {
    clearLocationFlagsError: (state) => {
      state.error = null;
    },
    clearLocationFlags: (state, action: PayloadAction<string>) => {
      const location = action.payload;
      delete state.flags[location];
      delete state.lastFetched[location];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch flags
      .addCase(fetchLocationFlags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLocationFlags.fulfilled, (state, action) => {
        state.isLoading = false;
        const { location, flags } = action.payload;
        state.flags[location] = flags;
        state.lastFetched[location] = Date.now();
      })
      .addCase(fetchLocationFlags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update flags
      .addCase(updateLocationFlags.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateLocationFlags.fulfilled, (state, action) => {
        state.isLoading = false;
        const { location, flags } = action.payload;
        state.flags[location] = flags;
        state.lastFetched[location] = Date.now();
      })
      .addCase(updateLocationFlags.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearLocationFlagsError, clearLocationFlags } = locationFlagsSlice.actions;
export default locationFlagsSlice.reducer;

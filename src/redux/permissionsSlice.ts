import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface UserPermissions {
  locationId: number;
  permissions: string[];
  dashboardPermissions: { [key: string]: boolean };
}

interface PermissionsState {
  permissions: UserPermissions | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: PermissionsState = {
  permissions: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunk for fetching user permissions
export const fetchUserPermissions = createAsyncThunk(
  'permissions/fetchUserPermissions',
  async (location: string, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found in localStorage');
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!apiUrl) {
        throw new Error('NEXT_PUBLIC_API_URL not found in environment variables');
      }

      const response = await fetch(`${apiUrl}/admin/v2/${location}/user/permissions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user permissions: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'API returned error');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user permissions');
    }
  }
);

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    clearPermissions: (state) => {
      state.permissions = null;
      state.error = null;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserPermissions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPermissions.fulfilled, (state, action: PayloadAction<UserPermissions>) => {
        state.isLoading = false;
        state.permissions = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUserPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPermissions, clearError } = permissionsSlice.actions;
export default permissionsSlice.reducer;

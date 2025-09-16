import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface UserInfo {
  id: number;
  fullName: string;
  role: string;
  displayRole: string;
  primaryEmail: string;
  emails: unknown[];
}

interface UserState {
  userInfo: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: UserState = {
  userInfo: null,
  isLoading: false,
  error: null,
  lastFetched: null,
};

// Async thunk for fetching user info
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
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

      const response = await fetch(`${apiUrl}/admin/v2/${location}/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.message || 'API returned error');
      }
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch user info');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.userInfo = null;
      state.error = null;
      state.lastFetched = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action: PayloadAction<UserInfo>) => {
        state.isLoading = false;
        state.userInfo = action.payload;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser, clearError } = userSlice.actions;
export default userSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getReleaseNotesList, 
  createReleaseNote as createReleaseNoteAPI,
  updateReleaseNote as updateReleaseNoteAPI,
  ReleaseNoteRow 
} from './releaseNotesListing.api';
import type { CreateReleaseNoteRequest, UpdateReleaseNoteRequest, CreateReleaseNoteResponse, UpdateReleaseNoteResponse } from './types';

/**
 * Helper function to transform API response data to ReleaseNoteRow format
 * Follows DRY principle - used by both add and update operations
 */
function transformReleaseNoteResponse(
  responseData: CreateReleaseNoteResponse['data'] | UpdateReleaseNoteResponse['data']
): ReleaseNoteRow | null {
  if (!responseData) return null;
  
  return {
    id: responseData.id,
    subject: responseData.subject,
    summary: responseData.summary,
    notes: responseData.notes,
    scheduleDate: responseData.scheduleDate,
    createdDate: responseData.createdDate,
    userPublicIdentity: responseData.userPublicIdentity,
    releaseVersion: undefined,
  };
}

/**
 * Helper function to handle API errors consistently
 * Follows DRY principle - used by all async thunks
 */
function handleApiError(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

interface ReleaseNotesListingState {
  // All release notes data (fetched once on initial load)
  allRows: ReleaseNoteRow[];
  isLoading: boolean;
  error: string | null;
  // Client-side pagination, sorting, and filtering
  page: number;
  pageSize: number;
  sortBy?: "subject" | "scheduleDate" | "createdDate";
  sortDir: 'asc' | 'desc';
  columnFilters: Record<string, unknown>;
}

const initialState: ReleaseNotesListingState = {
  allRows: [], // Store all data here
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 10,
  sortBy: 'createdDate', // Default to sorting by created date
  sortDir: 'desc',
  columnFilters: {},
};

// Constants for API pagination
const API_PAGE_LIMIT = 20; // Standard page size for fetching all data from API

// Async thunk for fetching all release notes once on initial load
// Called once in page.tsx during initial page load
// Fetches all pages using proper pagination parameters from API response
export const fetchReleaseNotes = createAsyncThunk(
  'releaseNotesListing/fetchReleaseNotes',
  async (
    { location }: { location: string },
    { rejectWithValue }
  ) => {
    try {
      const allRows: ReleaseNoteRow[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let hasMorePages = true;

      // Fetch all pages until we have all data
      while (hasMorePages) {
        const response = await getReleaseNotesList(location, { page: currentPage, limit: API_PAGE_LIMIT });
        
        if (response && response.success && response.data) {
          // Add the rows from this page to our collection
          allRows.push(...response.data.body);
          
          // Get pagination info from API response
          const pagination = response.data.pagination;
          totalPages = pagination.totalPages;
          
          // Check if there are more pages to fetch
          hasMorePages = currentPage < totalPages;
          currentPage++;
        } else {
          // If API call fails, stop fetching
          hasMorePages = false;
          if (currentPage === 1) {
            // If first page fails, return empty result
            return {
              rows: [],
            };
          }
        }
      }

      return {
        rows: allRows,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch release notes'));
    }
  }
);

// Async thunk for creating a new release note
export const addReleaseNote = createAsyncThunk(
  'releaseNotesListing/addReleaseNote',
  async (
    { location, data }: { location: string; data: CreateReleaseNoteRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await createReleaseNoteAPI(location, data);
      
      if (response && response.success && response.data) {
        const transformedNote = transformReleaseNoteResponse(response.data);
        if (!transformedNote) {
          return rejectWithValue('Failed to transform release note data');
        }
        return transformedNote;
      }

      return rejectWithValue('Failed to create release note');
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create release note'));
    }
  }
);

// Async thunk for updating an existing release note
export const updateReleaseNote = createAsyncThunk(
  'releaseNotesListing/updateReleaseNote',
  async (
    { location, id, data }: { location: string; id: number | string; data: UpdateReleaseNoteRequest },
    { rejectWithValue }
  ) => {
    try {
      const response = await updateReleaseNoteAPI(location, id, data);
      
      if (response && response.success && response.data) {
        const transformedNote = transformReleaseNoteResponse(response.data);
        if (!transformedNote) {
          return rejectWithValue('Failed to transform release note data');
        }
        return transformedNote;
      }

      return rejectWithValue('Failed to update release note');
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update release note'));
    }
  }
);

// Async thunk for deleting a release note
export const deleteReleaseNote = createAsyncThunk(
  'releaseNotesListing/deleteReleaseNote',
  async (
    { location, id }: { location: string; id: number },
    { rejectWithValue }
  ) => {
    try {
      // TODO: Implement API call to delete release note
      // Endpoint: DELETE /admin/v2/${location}/release-notes/{id}
      // For now, just return the id to remove from state
      // When API is implemented, call it here first, then return id on success
      void location; // Will be used when API is implemented
      return id;
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to delete release note'));
    }
  }
);

const releaseNotesListingSlice = createSlice({
  name: 'releaseNotesListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: "subject" | "scheduleDate" | "createdDate"; sortDir: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
      state.page = 1; // Reset to first page when sorting changes
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    clearError: (state) => {
      state.error = null;
    },
    clearReleaseNotes: (state) => {
      state.allRows = [];
      state.page = 1;
    },
    resetReleaseNotesState: (state) => {
      // Reset all state to initial values (useful when location changes)
      state.allRows = [];
      state.isLoading = false;
      state.error = null;
      state.page = 1;
      state.pageSize = 10;
      state.sortBy = 'createdDate';
      state.sortDir = 'desc';
      state.columnFilters = {};
    },
  },
  extraReducers: (builder) => {
    // Helper to clear error on pending actions (DRY principle)
    const clearErrorOnPending = (state: ReleaseNotesListingState) => {
      state.error = null;
    };

    // Helper to set error on rejected actions (DRY principle)
    const setErrorOnRejected = (state: ReleaseNotesListingState, action: { payload: unknown }) => {
      state.error = action.payload as string;
    };

    builder
      // Fetch all release notes (once on initial load)
      .addCase(fetchReleaseNotes.pending, (state) => {
        state.isLoading = true;
        clearErrorOnPending(state);
      })
      .addCase(fetchReleaseNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allRows = action.payload.rows;
        state.error = null;
      })
      .addCase(fetchReleaseNotes.rejected, (state, action) => {
        state.isLoading = false;
        setErrorOnRejected(state, action);
      })
      // Add new release note
      .addCase(addReleaseNote.pending, clearErrorOnPending)
      .addCase(addReleaseNote.fulfilled, (state, action) => {
        // Add the new note to the beginning of the array
        state.allRows.unshift(action.payload);
      })
      .addCase(addReleaseNote.rejected, setErrorOnRejected)
      // Update existing release note
      .addCase(updateReleaseNote.pending, clearErrorOnPending)
      .addCase(updateReleaseNote.fulfilled, (state, action) => {
        // Find and update the note in the array
        const index = state.allRows.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.allRows[index] = action.payload;
        }
      })
      .addCase(updateReleaseNote.rejected, setErrorOnRejected)
      // Delete release note
      .addCase(deleteReleaseNote.pending, clearErrorOnPending)
      .addCase(deleteReleaseNote.fulfilled, (state, action) => {
        // Remove the note from the array
        state.allRows = state.allRows.filter(note => note.id !== action.payload);
      })
      .addCase(deleteReleaseNote.rejected, setErrorOnRejected);
  },
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  clearError,
  clearReleaseNotes,
  resetReleaseNotesState,
} = releaseNotesListingSlice.actions;

export default releaseNotesListingSlice.reducer;


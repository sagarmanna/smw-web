import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { 
  getReleaseNotesList, 
  createReleaseNote as createReleaseNoteAPI,
  updateReleaseNote as updateReleaseNoteAPI,
  deleteReleaseNote as deleteReleaseNoteAPI,
  ReleaseNoteRow 
} from './releaseNotesListing.api';
import type { CreateReleaseNoteRequest, UpdateReleaseNoteRequest, CreateReleaseNoteResponse, UpdateReleaseNoteResponse } from './types';

/**
 * Helper function to format date from ISO string to display format (MMM dd, yyyy)
 * Follows DRY principle - uses date-fns for consistency
 */
function formatDateForDisplay(dateString: string): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      // If parsing fails, return original string
      return dateString;
    }
    return format(date, 'MMM dd, yyyy');
  } catch {
    return dateString;
  }
}

/**
 * Helper function to transform API response data to ReleaseNoteRow format
 * For create and update operations, merges API response with request data since API returns minimal fields
 * Follows DRY principle - used by both add and update operations
 */
function transformReleaseNoteResponse(
  responseData: CreateReleaseNoteResponse['data'] | UpdateReleaseNoteResponse['data'],
  requestData?: CreateReleaseNoteRequest | UpdateReleaseNoteRequest
): ReleaseNoteRow | null {
  if (!responseData) return null;
  
  // If requestData is provided (for both create and update), API returns minimal data
  // So we merge API response with request data
  if (requestData && 'summary' in requestData && 'notes' in requestData) {
    // Determine if this is a create or update operation
    // CreateReleaseNoteRequest has 'version' field, UpdateReleaseNoteRequest has 'releaseVersion' field
    const isCreate = 'version' in requestData;
    
    if (isCreate) {
      // For create operations, use current date for createdDate
      const createRequest = requestData as CreateReleaseNoteRequest;
      const currentDate = new Date();
      const createdDateFormatted = formatDateForDisplay(currentDate.toISOString());
      
      return {
        id: responseData.id,
        subject: responseData.subject,
        summary: createRequest.summary, // From request
        notes: createRequest.notes, // From request
        scheduleDate: formatDateForDisplay(responseData.scheduleDate), // Format from API
        createdDate: createdDateFormatted, // Use current date so new items appear at top
        userPublicIdentity: "Current User", // Placeholder - will be updated when we fetch full data
        releaseVersion: createRequest.version,
      };
    } else {
      // For update operations, merge with request data
      // Note: createdDate and userPublicIdentity should be preserved from existing note in Redux
      const updateRequest = requestData as UpdateReleaseNoteRequest;
      return {
        id: responseData.id,
        subject: responseData.subject,
        summary: updateRequest.summary, // From request
        notes: updateRequest.notes, // From request
        scheduleDate: formatDateForDisplay(responseData.scheduleDate), // Format from API
        createdDate: '', // Will be set from existing note in Redux
        userPublicIdentity: '', // Will be set from existing note in Redux
        releaseVersion: updateRequest.releaseVersion,
      };
    }
  }
  
  // Fallback: if response has all fields (legacy support)
  if ('summary' in responseData && 'notes' in responseData && 'createdDate' in responseData && 'userPublicIdentity' in responseData) {
    return {
      id: responseData.id,
      subject: responseData.subject,
      summary: responseData.summary,
      notes: responseData.notes,
      scheduleDate: formatDateForDisplay(responseData.scheduleDate),
      createdDate: formatDateForDisplay(responseData.createdDate),
      userPublicIdentity: responseData.userPublicIdentity,
      releaseVersion: undefined,
    };
  }
  
  return null;
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
const MAX_PAGES_LIMIT = 1000; // Safety limit to prevent infinite loops (prevents fetching too many pages)
const MAX_CONSECUTIVE_ERRORS = 3; // Maximum consecutive API errors before aborting fetch

/**
 * Async thunk for fetching all release notes once on initial load
 * 
 * IMPORTANT: This is called ONLY ONCE in page.tsx during initial page load.
 * It fetches all pages sequentially and stores the complete dataset in Redux.
 * 
 * After initial load, all operations use Redux state:
 * - Add/Update/Delete: Call API first, then update Redux state
 * - No refetching needed as mutations update Redux directly
 * 
 * @param location - Location parameter for the API call
 * @returns All release notes data to be stored in Redux
 */
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
      let consecutiveErrors = 0;

      // Fetch all pages until we have all data
      while (hasMorePages && currentPage <= MAX_PAGES_LIMIT) {
        const response = await getReleaseNotesList(location, { page: currentPage, limit: API_PAGE_LIMIT });
        
        if (response && response.success && response.data) {
          // Reset error counter on successful fetch
          consecutiveErrors = 0;
          
          // Add the rows from this page to our collection
          allRows.push(...response.data.body);
          
          // Get pagination info from API response
          const pagination = response.data.pagination;
          totalPages = pagination.totalPages;
          
          // Check if there are more pages to fetch
          hasMorePages = currentPage < totalPages;
          currentPage++;
        } else {
          // If API call fails, track consecutive errors
          consecutiveErrors++;
          
          // If too many consecutive errors, abort to prevent infinite loop
          if (consecutiveErrors >= MAX_CONSECUTIVE_ERRORS) {
            console.warn(`Aborted fetching after ${MAX_CONSECUTIVE_ERRORS} consecutive errors`);
            hasMorePages = false;
          } else {
            // Try next page (might be a temporary issue)
            currentPage++;
            hasMorePages = currentPage <= totalPages && currentPage <= MAX_PAGES_LIMIT;
          }
          
          // If first page fails completely, return empty result
          if (currentPage === 2 && allRows.length === 0) {
            return {
              rows: [],
            };
          }
        }
      }

      // Safety check: If we hit the max pages limit, log a warning
      if (currentPage > MAX_PAGES_LIMIT) {
        console.warn(`Reached maximum pages limit (${MAX_PAGES_LIMIT}). Some data may not be loaded.`);
      }

      return {
        rows: allRows,
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch release notes'));
    }
  }
);

/**
 * Async thunk for creating a new release note
 * 
 * Flow: API call first → Transform response → Update Redux state
 * No refetch needed as Redux is updated directly after successful API call
 * 
 * @param location - Location parameter for the API call
 * @param data - Release note data to create
 * @returns Transformed release note to be added to Redux state
 */
export const addReleaseNote = createAsyncThunk(
  'releaseNotesListing/addReleaseNote',
  async (
    { location, data }: { location: string; data: CreateReleaseNoteRequest },
    { rejectWithValue, getState }
  ) => {
    try {
      // Step 1: Call API first
      const response = await createReleaseNoteAPI(location, data);
      
      if (response && response.success && response.data) {
        // Step 2: Get user info from Redux state for userPublicIdentity
        const state = getState() as { user: { userInfo: { fullName?: string } | null } };
        const userPublicIdentity = state.user?.userInfo?.fullName || "Current User";
        
        // Step 3: Transform API response, merging with request data since API returns minimal fields
        const transformedNote = transformReleaseNoteResponse(response.data, data);
        if (!transformedNote) {
          return rejectWithValue('Failed to transform release note data');
        }
        
        // Step 4: Update userPublicIdentity from Redux state
        transformedNote.userPublicIdentity = userPublicIdentity;
        
        // Step 5: Return transformed note (will be added to Redux in extraReducers)
        return transformedNote;
      }

      return rejectWithValue('Failed to create release note');
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to create release note'));
    }
  }
);

/**
 * Async thunk for updating an existing release note
 * 
 * Flow: API call first → Transform response → Update Redux state
 * No refetch needed as Redux is updated directly after successful API call
 * 
 * @param location - Location parameter for the API call
 * @param id - Release note ID to update
 * @param data - Release note data to update
 * @returns Transformed release note to be updated in Redux state
 */
export const updateReleaseNote = createAsyncThunk(
  'releaseNotesListing/updateReleaseNote',
  async (
    { location, id, data }: { location: string; id: number | string; data: UpdateReleaseNoteRequest },
    { rejectWithValue, getState }
  ) => {
    try {
      // Step 1: Call API first
      const response = await updateReleaseNoteAPI(location, id, data);
      
      if (response && response.success && response.data) {
        // Step 2: Get the existing note from Redux state to preserve createdDate and userPublicIdentity
        const state = getState() as { releaseNotesListing: { allRows: ReleaseNoteRow[] } };
        const existingNote = state.releaseNotesListing.allRows.find(note => note.id === Number(id));
        
        // Step 3: Transform API response, merging with request data since API returns minimal fields
        const transformedNote = transformReleaseNoteResponse(response.data, data);
        
        if (!transformedNote) {
          return rejectWithValue('Failed to transform release note data');
        }

        // Step 4: Preserve createdDate and userPublicIdentity from existing note if available
        if (existingNote) {
          transformedNote.createdDate = existingNote.createdDate;
          transformedNote.userPublicIdentity = existingNote.userPublicIdentity;
        }

        // Step 5: Preserve releaseVersion from request data if it was provided
        if (data.releaseVersion) {
          transformedNote.releaseVersion = data.releaseVersion;
        }

        // Step 6: Return transformed note (will be updated in Redux in extraReducers)
        return transformedNote;
      }

      return rejectWithValue('Failed to update release note');
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update release note'));
    }
  }
);

/**
 * Async thunk for deleting a release note
 * 
 * Flow: API call first → Remove from Redux state
 * No refetch needed as Redux is updated directly after successful API call
 * 
 * @param location - Location parameter for the API call
 * @param id - Release note ID to delete
 * @returns The deleted note ID to be removed from Redux state
 */
export const deleteReleaseNote = createAsyncThunk(
  'releaseNotesListing/deleteReleaseNote',
  async (
    { location, id }: { location: string; id: number | string },
    { rejectWithValue }
  ) => {
    try {
      // Step 1: Call API first
      const response = await deleteReleaseNoteAPI(location, id);
      
      if (response && response.success) {
        // Step 2: Return the ID (will be removed from Redux in extraReducers)
        const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
        return numericId;
      }

      return rejectWithValue('Failed to delete release note');
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
      // Fetch all release notes (once on initial load in page.tsx)
      // This is the ONLY place where GET API is called
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
      // Add new release note (API called first, then Redux updated here)
      .addCase(addReleaseNote.pending, clearErrorOnPending)
      .addCase(addReleaseNote.fulfilled, (state, action) => {
        // Add the new note to the beginning of the array
        // No refetch needed - Redux state is updated directly
        state.allRows.unshift(action.payload);
        // Reset to page 1 to show the newly added item at the top
        state.page = 1;
      })
      .addCase(addReleaseNote.rejected, setErrorOnRejected)
      // Update existing release note (API called first, then Redux updated here)
      .addCase(updateReleaseNote.pending, clearErrorOnPending)
      .addCase(updateReleaseNote.fulfilled, (state, action) => {
        // Find and update the note in the array
        // No refetch needed - Redux state is updated directly
        const index = state.allRows.findIndex(note => note.id === action.payload.id);
        if (index !== -1) {
          state.allRows[index] = action.payload;
        }
      })
      .addCase(updateReleaseNote.rejected, setErrorOnRejected)
      // Delete release note (API called first, then Redux updated here)
      .addCase(deleteReleaseNote.pending, clearErrorOnPending)
      .addCase(deleteReleaseNote.fulfilled, (state, action) => {
        // Remove the note from the array
        // No refetch needed - Redux state is updated directly
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


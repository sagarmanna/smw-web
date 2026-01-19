import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  getEmailTemplatesList, 
  updateEmailTemplate as updateEmailTemplateAPI,
  EmailTemplateRow 
} from './emailTemplate.api';
import type { UpdateEmailTemplateRequest } from './types';

/**
 * Helper function to handle API errors consistently
 * Follows DRY principle - used by all async thunks
 */
function handleApiError(error: unknown, defaultMessage: string): string {
  return error instanceof Error ? error.message : defaultMessage;
}

interface EmailTemplateListingState {
  // Email templates data (fetched from API)
  rows: EmailTemplateRow[];
  isLoading: boolean;
  error: string | null;
  // Server-side pagination
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const initialState: EmailTemplateListingState = {
  rows: [], // Store current page data here
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 1,
};

/**
 * Async thunk for fetching email templates
 * 
 * IMPORTANT: This is called:
 * - Once on initial page load in page.tsx
 * - When pagination changes (triggers API call with new page)
 * 
 * After initial load, all operations use Redux state:
 * - Update: Call API first, then update Redux state
 * 
 * @param location - Location parameter for the API call
 * @param page - Page number (default: 1)
 * @param limit - Page size (default: 20)
 * @returns Email templates data to be stored in Redux
 */
export const fetchEmailTemplates = createAsyncThunk(
  'emailTemplateListing/fetchEmailTemplates',
  async (
    { 
      location, 
      page = 1,
      limit = 20
    }: { 
      location: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      // Fetch single page from API
      const response = await getEmailTemplatesList(location, { 
        page, 
        limit
      });
        
      if (response && response.success && response.data) {
        return {
          rows: response.data.body,
          pagination: response.data.pagination,
        };
      }

      return {
        rows: [],
        pagination: { page: 1, limit, total: 0, totalPages: 1 },
      };
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to fetch email templates'));
    }
  }
);

/**
 * Async thunk for updating an existing email template
 * 
 * Flow: API call first → Update Redux state
 * No refetch needed as Redux is updated directly after successful API call
 * 
 * @param location - Location parameter for the API call
 * @param id - Email template ID to update
 * @param data - Email template data to update
 * @returns Transformed email template to be updated in Redux state
 */
export const updateEmailTemplate = createAsyncThunk(
  'emailTemplateListing/updateEmailTemplate',
  async (
    { location, id, data }: { location: string; id: number | string; data: UpdateEmailTemplateRequest },
    { rejectWithValue, getState }
  ) => {
    try {
      // Step 1: Call API first
      const response = await updateEmailTemplateAPI(location, id, data);
      
      if (response && response.success && response.data) {
        // Step 2: Get the existing template from Redux state to preserve type field
        const state = getState() as { emailTemplateListing: { rows: EmailTemplateRow[] } };
        const existingTemplate = state.emailTemplateListing.rows.find(template => template.id === Number(id));
        
        // Step 3: Merge updated data with existing template (preserve type)
        const updatedTemplate: EmailTemplateRow = {
          id: Number(id),
          type: existingTemplate?.type || "", // Preserve type from existing template
          subject: response.data.subject,
          header: response.data.header,
          footer: response.data.footer,
        };

        // Step 4: Return updated template (will be updated in Redux in extraReducers)
        return updatedTemplate;
      }

      return rejectWithValue('Failed to update email template');
    } catch (error) {
      return rejectWithValue(handleApiError(error, 'Failed to update email template'));
    }
  }
);

const emailTemplateListingSlice = createSlice({
  name: 'emailTemplateListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    clearError: (state) => {
      state.error = null;
    },
    clearEmailTemplates: (state) => {
      state.rows = [];
      state.page = 1;
      state.total = 0;
      state.totalPages = 1;
    },
    resetEmailTemplateState: (state) => {
      // Reset all state to initial values (useful when location changes)
      state.rows = [];
      state.isLoading = false;
      state.error = null;
      state.page = 1;
      state.pageSize = 20;
      state.total = 0;
      state.totalPages = 1;
    },
  },
  extraReducers: (builder) => {
    // Helper to clear error on pending actions (DRY principle)
    const clearErrorOnPending = (state: EmailTemplateListingState) => {
      state.error = null;
    };

    // Helper to set error on rejected actions (DRY principle)
    const setErrorOnRejected = (state: EmailTemplateListingState, action: { payload: unknown }) => {
      state.error = action.payload as string;
    };

    builder
      // Fetch email templates (called on initial load and when pagination changes)
      .addCase(fetchEmailTemplates.pending, (state) => {
        state.isLoading = true;
        clearErrorOnPending(state);
      })
      .addCase(fetchEmailTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        if (action.payload.pagination) {
          state.total = action.payload.pagination.total;
          state.totalPages = action.payload.pagination.totalPages;
        }
        state.error = null;
      })
      .addCase(fetchEmailTemplates.rejected, (state, action) => {
        state.isLoading = false;
        setErrorOnRejected(state, action);
      })
      // Update existing email template (API called first, then update Redux state)
      .addCase(updateEmailTemplate.pending, clearErrorOnPending)
      .addCase(updateEmailTemplate.fulfilled, (state, action) => {
        // Update the template in Redux state
        const index = state.rows.findIndex(template => template.id === action.payload.id);
        if (index !== -1) {
          state.rows[index] = action.payload;
        }
      })
      .addCase(updateEmailTemplate.rejected, setErrorOnRejected);
  },
});

export const {
  setPage,
  setPageSize,
  clearError,
  clearEmailTemplates,
  resetEmailTemplateState,
} = emailTemplateListingSlice.actions;

export default emailTemplateListingSlice.reducer;

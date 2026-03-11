import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {
  getInvoiceDetails,
  getInvoiceHistory,
  getInvoiceComments,
  InvoiceDetailsApiResponse,
  PaginationInfo,
  updateInvoiceDetails,
  UpdateInvoiceDetailsRequest,
} from './invoices-details.api';
import type { InvoiceDetail, InvoiceComment, InvoiceHistoryEntry } from '../types';
import { recalculateTotals } from '../utils/totalsCalculator';

interface InvoiceState {
  invoiceDetail: InvoiceDetail | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastFetched: number | null;
  currentInvoiceId: number | null;
  // History state with pagination
  historyData: InvoiceHistoryEntry[];
  historyPagination: PaginationInfo | null;
  historyLoading: boolean;
  historyError: string | null;
  // Comments state with pagination
  commentsData: InvoiceComment[];
  commentsPagination: PaginationInfo | null;
  commentsLoading: boolean;
  commentsError: string | null;
}

const initialState: InvoiceState = {
  invoiceDetail: null,
  isLoading: false,
  isSaving: false,
  error: null,
  lastFetched: null,
  currentInvoiceId: null,
  historyData: [],
  historyPagination: null,
  historyLoading: false,
  historyError: null,
  commentsData: [],
  commentsPagination: null,
  commentsLoading: false,
  commentsError: null,
};

/**
 * Transforms API response to match the InvoiceDetail interface
 */
function transformApiResponse(apiResponse: InvoiceDetailsApiResponse): InvoiceDetail {
  return apiResponse.data.body;
}

// Async thunk for fetching invoice details
export const fetchInvoice = createAsyncThunk(
  'invoice/fetchInvoice',
  async (
    { location, invoiceId }: { location: string; invoiceId: number },
    { rejectWithValue }
  ) => {
    try {
      const result = await getInvoiceDetails(location, invoiceId);

      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to fetch invoice details');
      }

      const transformedData = transformApiResponse(result);

      return { data: transformedData };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invoice details');
    }
  }
);

// Async thunk for updating invoice details
export const updateInvoice = createAsyncThunk(
  'invoice/updateInvoice',
  async (
    { location, invoiceId, data }: { location: string; invoiceId: number; data: UpdateInvoiceDetailsRequest },
    { rejectWithValue }
  ) => {
    try {
      const result = await updateInvoiceDetails(location, invoiceId, data);
      
      if (!result || !result.success) {
        throw new Error(result?.message || 'Failed to update invoice details');
      }
      
      return { putResponse: result.data };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update invoice details');
    }
  }
);

// Async thunk for fetching invoice history with pagination
export const fetchInvoiceHistory = createAsyncThunk(
  'invoice/fetchInvoiceHistory',
  async (
    { location, invoiceId, page = 1 }: { location: string; invoiceId: number; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getInvoiceHistory(location, invoiceId, page);

      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch invoice history');
      }

      return {
        data: apiResult.data.body || [],
        pagination: apiResult.data.pagination,
      };
    } catch (error) {
      console.error('Error in fetchInvoiceHistory:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch invoice history data'
      );
    }
  }
);

// Async thunk for fetching invoice comments with pagination
export const fetchInvoiceComments = createAsyncThunk(
  'invoice/fetchInvoiceComments',
  async (
    { location, invoiceId, page = 1 }: { location: string; invoiceId: number; page?: number },
    { rejectWithValue }
  ) => {
    try {
      const apiResult = await getInvoiceComments(location, invoiceId, page);

      if (!apiResult || !apiResult.success) {
        throw new Error(apiResult?.message || 'Failed to fetch invoice comments');
      }

      return {
        data: apiResult.data.body || [],
        pagination: apiResult.data.pagination,
      };
    } catch (error) {
      console.error('Error in fetchInvoiceComments:', error);
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch invoice comments data'
      );
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearInvoice: (state) => {
      state.invoiceDetail = null;
      state.error = null;
      state.lastFetched = null;
      state.currentInvoiceId = null;
      state.historyData = [];
      state.historyPagination = null;
      state.historyError = null;
      state.commentsData = [];
      state.commentsPagination = null;
      state.commentsError = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Clear cache to force fresh fetch on next refresh
    clearCache: (state) => {
      state.lastFetched = null;
    },
    // Update invoice detail in local state
    updateInvoiceDetail: (state, action: PayloadAction<Partial<InvoiceDetail>>) => {
      if (state.invoiceDetail) {
        state.invoiceDetail = {
          ...state.invoiceDetail,
          ...action.payload,
        };
      }
    },
    // Update customer in local state
    updateCustomer: (state, action: PayloadAction<InvoiceDetail["customer"]>) => {
      if (state.invoiceDetail) {
        state.invoiceDetail.customer = action.payload;
      }
    },
    // Update items and recalculate totals
    updateItems: (state, action: PayloadAction<InvoiceDetail["items"]>) => {
      if (state.invoiceDetail) {
        state.invoiceDetail.items = action.payload;
        // Recalculate totals
        const totals = recalculateTotals(
          action.payload,
          state.invoiceDetail.totals.paid
        );
        state.invoiceDetail.totals = totals;
      }
    },
    // Update totals directly
    updateTotals: (state, action: PayloadAction<InvoiceDetail["totals"]>) => {
      if (state.invoiceDetail) {
        state.invoiceDetail.totals = action.payload;
      }
    },
    // Update message
    updateMessage: (state, action: PayloadAction<string | undefined>) => {
      if (state.invoiceDetail) {
        state.invoiceDetail.message = action.payload;
      }
    },
    // Add comment
    addComment: (state, action: PayloadAction<InvoiceComment>) => {
      if (state.invoiceDetail) {
        state.invoiceDetail.comments = [
          ...(state.invoiceDetail.comments || []),
          action.payload,
        ];
      }
    },
    // Update history
    addHistoryEntry: (state, action: PayloadAction<{ id: number; createdOn: string; message: string }>) => {
      if (state.invoiceDetail) {
        state.invoiceDetail.history = [
          ...(state.invoiceDetail.history || []),
          action.payload,
        ];
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Invoice fetch reducers
      .addCase(fetchInvoice.pending, (state, action) => {
        // Track which invoice we're loading
        const { invoiceId } = action.meta.arg as { location: string; invoiceId: number };
        
        // If switching to a different invoice, clear old data
        if (state.currentInvoiceId !== null && state.currentInvoiceId !== invoiceId) {
          state.invoiceDetail = null;
          state.lastFetched = null;
        }
        
        state.currentInvoiceId = invoiceId;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoiceDetail = action.payload.data;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(fetchInvoice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update invoice reducers
      .addCase(updateInvoice.pending, (state) => {
        state.isSaving = true;
        state.error = null;
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        state.isSaving = false;
        // Update state from API response
        if (state.invoiceDetail && action.payload) {
          const { putResponse } = action.payload;
          state.invoiceDetail = {
            ...state.invoiceDetail,
            ...putResponse,
          };
        }
        state.error = null;
      })
      .addCase(updateInvoice.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload as string;
      })
      // Fetch invoice history reducers
      .addCase(fetchInvoiceHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchInvoiceHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = action.payload.data as InvoiceHistoryEntry[];
        state.historyPagination = action.payload.pagination || null;
        state.historyError = null;
      })
      .addCase(fetchInvoiceHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload as string;
      })
      // Fetch invoice comments reducers
      .addCase(fetchInvoiceComments.pending, (state) => {
        state.commentsLoading = true;
        state.commentsError = null;
      })
      .addCase(fetchInvoiceComments.fulfilled, (state, action) => {
        state.commentsLoading = false;
        state.commentsData = action.payload.data as InvoiceComment[];
        state.commentsPagination = action.payload.pagination || null;
        state.commentsError = null;
      })
      .addCase(fetchInvoiceComments.rejected, (state, action) => {
        state.commentsLoading = false;
        state.commentsError = action.payload as string;
      });
  },
});

export const {
  clearInvoice,
  clearError,
  clearCache,
  updateInvoiceDetail,
  updateCustomer,
  updateItems,
  updateTotals,
  updateMessage,
  addComment,
  addHistoryEntry,
} = invoiceSlice.actions;
export default invoiceSlice.reducer;


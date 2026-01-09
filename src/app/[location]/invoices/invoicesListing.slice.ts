import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getInvoicesList, InvoiceRow, InvoicesQuery } from './invoicesListing.api';
import { startOfMonth, endOfMonth } from 'date-fns';
import { serializeColumnFilters } from '@/utils/dateRangeSerialization';

export type SortField = "number" | "date" | "customer" | "student";

interface InvoicesListingState {
  rows: InvoiceRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Sorting
  sortBy?: SortField;
  sortDir: 'asc' | 'desc';
  // Filters
  columnFilters: Record<string, unknown>;
  activeFilter?: string;
}

// Initialize default date filter to current month start and end (as ISO strings for Redux serialization)
const getDefaultDateFilter = () => {
  const today = new Date();
  return {
    from: startOfMonth(today).toISOString(),
    to: endOfMonth(today).toISOString(),
  };
};

const initialState: InvoicesListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: 'date', // Default to sorting by date
  sortDir: 'desc', // Default to descending order (newest first)
  columnFilters: {
    date: getDefaultDateFilter(),
  },
  activeFilter: undefined, // Default to showing all invoices
};

// Async thunk for fetching invoices list
export const fetchInvoices = createAsyncThunk(
  'invoicesListing/fetchInvoices',
  async (
    { location, query }: { location: string; query: InvoicesQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getInvoicesList(location, query);
      
      if (response && response.success) {
        return {
          rows: response.data.body,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        };
      }

      // Return empty result if API call fails or returns unsuccessful response
      return {
        rows: [],
        total: 0,
        totalPages: 0,
      };
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch invoices');
    }
  }
);

const invoicesListingSlice = createSlice({
  name: 'invoicesListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: SortField; sortDir: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
      state.page = 1; // Reset to first page when sorting changes
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      // Serialize Date objects to ISO strings for Redux compatibility
      state.columnFilters = serializeColumnFilters(action.payload);
      state.page = 1; // Reset to first page when filters change
    },
    setActiveFilter: (state, action: PayloadAction<string | undefined>) => {
      state.activeFilter = action.payload;
      state.page = 1; // Reset to first page when filter changes
    },
    clearError: (state) => {
      state.error = null;
    },
    clearInvoices: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setPageSize,
  setSorting,
  setColumnFilters,
  setActiveFilter,
  clearError,
  clearInvoices,
} = invoicesListingSlice.actions;

export default invoicesListingSlice.reducer;


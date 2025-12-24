import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getInvoicesList, InvoiceRow, InvoicesQuery } from './invoicesListing.api';
import { mockInvoiceData } from './mockData/invoiceMockData';
import { isValid, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { parseDateString } from '@/utils/dateUtils';
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

// Helper function to filter and paginate mock data
const filterAndPaginateMockData = (
  data: InvoiceRow[],
  query: InvoicesQuery
): { rows: InvoiceRow[]; total: number; totalPages: number } => {
  let filteredData = [...data];

  // Apply filters
  if (query.number) {
    filteredData = filteredData.filter(row => 
      row.number.toLowerCase().includes(query.number!.toLowerCase())
    );
  }
  if (query.customer) {
    filteredData = filteredData.filter(row => 
      row.customer.toLowerCase().includes(query.customer!.toLowerCase())
    );
  }
  if (query.student) {
    filteredData = filteredData.filter(row => 
      row.student.toLowerCase().includes(query.student!.toLowerCase())
    );
  }
  if (query.phone) {
    filteredData = filteredData.filter(row => 
      row.phone.toLowerCase().includes(query.phone!.toLowerCase())
    );
  }
  if (query.status) {
    // For dropdown filters, use exact match
    filteredData = filteredData.filter(row => 
      row.status.toLowerCase() === query.status!.toLowerCase()
    );
  }

  // Apply Date range filter
  if (query.dateFrom && query.dateTo) {
    const fromDate = new Date(query.dateFrom);
    const toDate = new Date(query.dateTo);
    if (isValid(fromDate) && isValid(toDate)) {
      filteredData = filteredData.filter(row => {
        const rowDate = parseDateString(row.date);
        if (!rowDate) return false;
        try {
          return isWithinInterval(rowDate, { start: fromDate, end: toDate });
        } catch (error) {
          return false;
        }
      });
    }
  }

  // Apply sorting
  if (query.sort) {
    filteredData.sort((a, b) => {
      const aValue = (a[query.sort as keyof InvoiceRow] || "") as string;
      const bValue = (b[query.sort as keyof InvoiceRow] || "") as string;
      
      const comparison = String(aValue).localeCompare(String(bValue));
      
      return query.order === "desc" ? -comparison : comparison;
    });
  }

  const total = filteredData.length;
  const page = query.page || 1;
  const limit = query.limit || 20;
  const totalPages = Math.ceil(total / limit);

  // Apply pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    rows: paginatedData,
    total,
    totalPages,
  };
};

// Async thunk for fetching invoices list
export const fetchInvoices = createAsyncThunk(
  'invoicesListing/fetchInvoices',
  async (
    { location, query }: { location: string; query: InvoicesQuery },
    { rejectWithValue }
  ) => {
    try {
      // Use mock data for now
      const result = filterAndPaginateMockData(mockInvoiceData, query);
      
      return {
        rows: result.rows,
        total: result.total,
        totalPages: result.totalPages,
      };

      // TODO: Uncomment when ready to use real API
      // const response = await getInvoicesList(location, query);
      // 
      // if (response && response.success) {
      //   return {
      //     rows: response.data.body,
      //     total: response.data.pagination.total,
      //     totalPages: response.data.pagination.totalPages,
      //   };
      // }

      // // Return empty result if API call fails or returns unsuccessful response
      // return {
      //   rows: [],
      //   total: 0,
      //   totalPages: 0,
      // };
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


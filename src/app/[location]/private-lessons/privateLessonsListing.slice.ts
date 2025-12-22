import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getPrivateLessonsList, PrivateLessonRow, PrivateLessonsQuery } from './privateLessonsListing.api';
import { SortField } from './utils/sortPrivateLessons';
import { mockPrivateLessonData } from './mockData/privateLessonMockData';
import { isValid, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { parseDateString } from '@/utils/dateUtils';

interface PrivateLessonsListingState {
  rows: PrivateLessonRow[];
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

// Initialize default date filter to today
const getDefaultDateFilter = () => {
  const today = new Date();
  return {
    from: startOfDay(today),
    to: endOfDay(today),
  };
};

const initialState: PrivateLessonsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: 'date', // Default to sorting by date
  sortDir: 'asc',
  columnFilters: {
    date: getDefaultDateFilter(),
  },
  activeFilter: undefined, // Default to showing all lessons
};

// Helper function to filter and paginate mock data
const filterAndPaginateMockData = (
  data: PrivateLessonRow[],
  query: PrivateLessonsQuery
): { rows: PrivateLessonRow[]; total: number; totalPages: number } => {
  let filteredData = [...data];

  // Apply filters
  if (query.student) {
    filteredData = filteredData.filter(row => 
      row.student.toLowerCase().includes(query.student!.toLowerCase())
    );
  }
  if (query.program) {
    filteredData = filteredData.filter(row => 
      row.program.toLowerCase().includes(query.program!.toLowerCase())
    );
  }
  if (query.teacher) {
    filteredData = filteredData.filter(row => 
      row.teacher.toLowerCase().includes(query.teacher!.toLowerCase())
    );
  }
  if (query.online) {
    // For dropdown filters, use exact match
    filteredData = filteredData.filter(row => 
      row.online.toLowerCase() === query.online!.toLowerCase()
    );
  }
  if (query.status) {
    filteredData = filteredData.filter(row => 
      row.status.toLowerCase() === query.status!.toLowerCase()
    );
  }
  if (query.payment) {
    filteredData = filteredData.filter(row => 
      row.payment.toLowerCase() === query.payment!.toLowerCase()
    );
  }

  // Apply Date range filter
  if (query.dateFrom && query.dateTo) {
    const fromDate = startOfDay(new Date(query.dateFrom));
    const toDate = endOfDay(new Date(query.dateTo));
    if (isValid(fromDate) && isValid(toDate)) {
      filteredData = filteredData.filter(row => {
        // Parse date from string like "Dec 19, 2025 @ 02:00 PM"
        const dateMatch = row.date.match(/(\w{3}\s+\d{1,2},\s+\d{4})/);
        if (!dateMatch) return false;
        const rowDate = parseDateString(dateMatch[1]);
        if (!rowDate) return false;
        // Normalize row date to start of day for comparison
        const normalizedRowDate = startOfDay(rowDate);
        try {
          return isWithinInterval(normalizedRowDate, { start: fromDate, end: toDate });
        } catch (error) {
          return false;
        }
      });
    }
  }

  // Apply sorting
  if (query.sort) {
    filteredData.sort((a, b) => {
      let aValue: string;
      let bValue: string;

      if (query.sort === "date") {
        aValue = a.date || "";
        bValue = b.date || "";
      } else {
        aValue = (a[query.sort as keyof PrivateLessonRow] || "") as string;
        bValue = (b[query.sort as keyof PrivateLessonRow] || "") as string;
      }

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

// Async thunk for fetching private lessons list
export const fetchPrivateLessons = createAsyncThunk(
  'privateLessonsListing/fetchPrivateLessons',
  async (
    { location, query }: { location: string; query: PrivateLessonsQuery },
    { rejectWithValue }
  ) => {
    try {
      // Use mock data for now
      const result = filterAndPaginateMockData(mockPrivateLessonData, query);
      
      return {
        rows: result.rows,
        total: result.total,
        totalPages: result.totalPages,
      };

      // TODO: Uncomment when ready to use real API
      // const response = await getPrivateLessonsList(location, query);
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch private lessons');
    }
  }
);

const privateLessonsListingSlice = createSlice({
  name: 'privateLessonsListing',
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
      state.columnFilters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setActiveFilter: (state, action: PayloadAction<string | undefined>) => {
      state.activeFilter = action.payload;
      state.page = 1; // Reset to first page when filter changes
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPrivateLessons: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrivateLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrivateLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchPrivateLessons.rejected, (state, action) => {
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
  clearPrivateLessons,
} = privateLessonsListingSlice.actions;

export default privateLessonsListingSlice.reducer;


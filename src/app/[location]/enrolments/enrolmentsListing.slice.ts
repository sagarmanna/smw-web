import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getEnrolmentsList, EnrolmentRow, EnrolmentsQuery } from './enrolmentsListing.api';
import { SortField } from './utils/sortEnrolments';
import { mockEnrolmentData } from './mockData/enrolmentMockData';
import { parse, isValid, isWithinInterval } from 'date-fns';

interface EnrolmentsListingState {
  rows: EnrolmentRow[];
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

const initialState: EnrolmentsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: 'program', // Default to sorting by program
  sortDir: 'asc',
  columnFilters: {},
  activeFilter: undefined, // Default to showing all enrolments
};

// Helper function to parse date string (format: "MMM dd, yyyy" or "MMM d, yyyy")
const parseDateString = (dateStr: string): Date | null => {
  try {
    // Try parsing with "MMM dd, yyyy" format (e.g., "Nov 17, 2025")
    const parsed = parse(dateStr, 'MMM dd, yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Try parsing with "MMM d, yyyy" format (e.g., "Nov 5, 2025")
    const parsed2 = parse(dateStr, 'MMM d, yyyy', new Date());
    if (isValid(parsed2)) {
      return parsed2;
    }
    
    return null;
  } catch (error) {
    return null;
  }
};

// Helper function to filter and paginate mock data
const filterAndPaginateMockData = (
  data: EnrolmentRow[],
  query: EnrolmentsQuery
): { rows: EnrolmentRow[]; total: number; totalPages: number } => {
  let filteredData = [...data];

  // Apply filters
  if (query.program) {
    filteredData = filteredData.filter(row => 
      row.program.toLowerCase().includes(query.program!.toLowerCase())
    );
  }
  if (query.student) {
    filteredData = filteredData.filter(row => 
      row.student.toLowerCase().includes(query.student!.toLowerCase())
    );
  }
  if (query.teacher) {
    filteredData = filteredData.filter(row => 
      row.teacher.toLowerCase().includes(query.teacher!.toLowerCase())
    );
  }
  if (query.autoRenewal) {
    // For dropdown filters, use exact match
    filteredData = filteredData.filter(row => 
      row.autoRenewal.toLowerCase() === query.autoRenewal!.toLowerCase()
    );
  }

  // Apply Lessons Remaining filter (numeric search)
  if (query.lessonsRemaining) {
    const searchValue = query.lessonsRemaining.trim();
    if (searchValue) {
      // Try to parse as number for exact match, otherwise use string contains
      const numericValue = Number(searchValue);
      if (!isNaN(numericValue)) {
        // Exact numeric match
        filteredData = filteredData.filter(row => 
          row.lessonsRemaining === numericValue
        );
      } else {
        // String contains match (e.g., "12" matches "12", "120", "1234")
        filteredData = filteredData.filter(row => 
          String(row.lessonsRemaining ?? '').includes(searchValue)
        );
      }
    }
  }

  // Apply Start Date range filter
  if (query.startDateFrom && query.startDateTo) {
    const fromDate = new Date(query.startDateFrom);
    const toDate = new Date(query.startDateTo);
    if (isValid(fromDate) && isValid(toDate)) {
      filteredData = filteredData.filter(row => {
        const rowStartDate = parseDateString(row.startDate);
        if (!rowStartDate) return false;
        try {
          return isWithinInterval(rowStartDate, { start: fromDate, end: toDate });
        } catch (error) {
          return false;
        }
      });
    }
  }

  // Apply End Date range filter
  if (query.endDateFrom && query.endDateTo) {
    const fromDate = new Date(query.endDateFrom);
    const toDate = new Date(query.endDateTo);
    if (isValid(fromDate) && isValid(toDate)) {
      filteredData = filteredData.filter(row => {
        const rowEndDate = parseDateString(row.endDate);
        if (!rowEndDate) return false;
        try {
          return isWithinInterval(rowEndDate, { start: fromDate, end: toDate });
        } catch (error) {
          return false;
        }
      });
    }
  }

  // Apply sorting
  if (query.sort) {
    filteredData.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (query.sort === "lessonsRemaining") {
        aValue = a.lessonsRemaining ?? 0;
        bValue = b.lessonsRemaining ?? 0;
      } else {
        aValue = (a[query.sort as keyof EnrolmentRow] || "") as string;
        bValue = (b[query.sort as keyof EnrolmentRow] || "") as string;
      }

      const comparison = typeof aValue === "number" && typeof bValue === "number"
        ? aValue - bValue
        : String(aValue).localeCompare(String(bValue));
      
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

// Async thunk for fetching enrolments list
export const fetchEnrolments = createAsyncThunk(
  'enrolmentsListing/fetchEnrolments',
  async (
    { location, query }: { location: string; query: EnrolmentsQuery },
    { rejectWithValue }
  ) => {
    try {
      // Use mock data for now
      const result = filterAndPaginateMockData(mockEnrolmentData, query);
      
      return {
        rows: result.rows,
        total: result.total,
        totalPages: result.totalPages,
      };

      // TODO: Uncomment when ready to use real API
      // const response = await getEnrolmentsList(location, query);
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch enrolments');
    }
  }
);

const enrolmentsListingSlice = createSlice({
  name: 'enrolmentsListing',
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
    clearEnrolments: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrolments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEnrolments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchEnrolments.rejected, (state, action) => {
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
  clearEnrolments,
} = enrolmentsListingSlice.actions;

export default enrolmentsListingSlice.reducer;


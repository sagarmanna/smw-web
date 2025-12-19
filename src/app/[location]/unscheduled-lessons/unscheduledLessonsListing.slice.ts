import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { UnscheduledLessonRow, UnscheduledLessonsQuery } from './unscheduledLessonsListing.api';
import { mockUnscheduledLessonData } from './mockData/unscheduledLessonMockData';
import { isLessonActive } from './utils/dateUtils';
// TODO: Uncomment when ready to use real API
// import { getUnscheduledLessonsList } from './unscheduledLessonsListing.api';

interface UnscheduledLessonsListingState {
  rows: UnscheduledLessonRow[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  // Pagination
  page: number;
  pageSize: number;
  // Filters
  columnFilters: Record<string, unknown>;
  activeFilter?: string;
}

const initialState: UnscheduledLessonsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  columnFilters: {},
  activeFilter: undefined, // Default to showing all unscheduled lessons
};

// Helper function to filter and paginate mock data
const filterAndPaginateMockData = (
  data: UnscheduledLessonRow[],
  query: UnscheduledLessonsQuery,
  activeFilter?: string
): { rows: UnscheduledLessonRow[]; total: number; totalPages: number } => {
  let filteredData = [...data];

  // Apply active/inactive filter
  if (activeFilter === "active") {
    filteredData = filteredData.filter(row => isLessonActive(row.expiryDate));
  } else if (activeFilter === "inactive") {
    filteredData = filteredData.filter(row => !isLessonActive(row.expiryDate));
  }

  // Apply column filters
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

// Async thunk for fetching unscheduled lessons list
export const fetchUnscheduledLessons = createAsyncThunk(
  'unscheduledLessonsListing/fetchUnscheduledLessons',
  async (
    { location, query, activeFilter }: { location: string; query: UnscheduledLessonsQuery; activeFilter?: string },
    { rejectWithValue }
  ) => {
    try {
      // Use mock data for now
      const result = filterAndPaginateMockData(mockUnscheduledLessonData, query, activeFilter);
      
      return {
        rows: result.rows,
        total: result.total,
        totalPages: result.totalPages,
      };

      // TODO: Uncomment when ready to use real API
      // const response = await getUnscheduledLessonsList(location, query);
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch unscheduled lessons');
    }
  }
);

const unscheduledLessonsListingSlice = createSlice({
  name: 'unscheduledLessonsListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1; // Reset to first page when page size changes
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setActiveFilter: (state, action: PayloadAction<string | undefined>) => {
      state.activeFilter = action.payload;
      state.page = 1; // Reset to first page when filter changes
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnscheduledLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnscheduledLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchUnscheduledLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setPage,
  setPageSize,
  setColumnFilters,
  setActiveFilter,
} = unscheduledLessonsListingSlice.actions;

export default unscheduledLessonsListingSlice.reducer;


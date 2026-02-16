import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getPrivateLessonsList, PrivateLessonRow, PrivateLessonsQuery } from './privateLessonsListing.api';
import { SortField } from './utils/sortPrivateLessons';
import { startOfDay, endOfDay } from 'date-fns';
import { serializeColumnFilters } from '@/utils/dateRangeSerialization';

// Discount form data interface - shared between components and Redux
export interface LessonDiscountData {
  paymentFrequencyDiscountPercent: string;
  customerDiscountPercent: string;
  multipleEnrollmentDiscountAmount: string; // fixed $
  lineItemDiscountType: "fixed" | "percentage";
  lineItemDiscountValue: string;
}

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
  showAll: boolean;
  // Discount history: maps lesson ID to discount data
  lessonDiscounts: Record<number, LessonDiscountData>;
}

// Initialize default date filter to today (as ISO strings for Redux serialization)
const getDefaultDateFilter = () => {
  const today = new Date();
  return {
    from: startOfDay(today).toISOString(),
    to: endOfDay(today).toISOString(),
  };
};

const initialState: PrivateLessonsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 200,
  sortBy: 'date', // Default to sorting by date
  sortDir: 'asc',
  columnFilters: {
    date: getDefaultDateFilter(),
  },
  showAll: false, // Default to showing current lessons only
  lessonDiscounts: {}, // Store discount data per lesson
};

// Async thunk for fetching private lessons list
export const fetchPrivateLessons = createAsyncThunk(
  'privateLessonsListing/fetchPrivateLessons',
  async (
    { location, query }: { location: string; query: PrivateLessonsQuery },
    { rejectWithValue }
  ) => {
    try {
      const response = await getPrivateLessonsList(location, query);

      if (response && response.success) {
        const pagination = response.data.pagination;
        return {
          rows: response.data.body,
          total: pagination?.total ?? response.data.body.length,
          totalPages: pagination?.totalPages ?? 1,
        };
      }

      // Return empty result if API call fails or returns unsuccessful response
      return {
        rows: [],
        total: 0,
        totalPages: 0,
      };
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
      // Serialize Date objects to ISO strings for Redux compatibility
      state.columnFilters = serializeColumnFilters(action.payload);
      state.page = 1; // Reset to first page when filters change
    },
    setShowAll: (state, action: PayloadAction<boolean>) => {
      state.showAll = action.payload;
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
    substituteTeacherForLessons: (
      state,
      action: PayloadAction<{ lessonIds: number[]; teacher: string }>
    ) => {
      const idSet = new Set(action.payload.lessonIds);
      state.rows = state.rows.map((row) =>
        idSet.has(row.id) ? { ...row, teacher: action.payload.teacher } : row
      );
    },
    updateLessonsPrices: (
      state,
      action: PayloadAction<{ lessonIds: number[]; newPrices: Map<number, string>; discountData?: LessonDiscountData }>
    ) => {
      const idSet = new Set(action.payload.lessonIds);
      state.rows = state.rows.map((row) =>
        idSet.has(row.id) && action.payload.newPrices.has(row.id)
          ? { ...row, price: action.payload.newPrices.get(row.id)! }
          : row
      );
      
      // Store discount data for each lesson if provided
      if (action.payload.discountData) {
        action.payload.lessonIds.forEach((lessonId) => {
          state.lessonDiscounts[lessonId] = action.payload.discountData!;
        });
      }
    },
    updateLessonsDuration: (
      state,
      action: PayloadAction<{ lessonIds: number[]; duration: string }>
    ) => {
      const idSet = new Set(action.payload.lessonIds);
      state.rows = state.rows.map((row) =>
        idSet.has(row.id) ? { ...row, duration: action.payload.duration } : row
      );
    },
    updateLessonsClassroom: (
      state,
      action: PayloadAction<{ lessonIds: number[]; classroomId: string; classroomName: string }>
    ) => {
      const idSet = new Set(action.payload.lessonIds);
      state.rows = state.rows.map((row) =>
        idSet.has(row.id) 
          ? { ...row, classroom: action.payload.classroomName }
          : row
      );
    },
    updateLessonsOnlineStatus: (
      state,
      action: PayloadAction<{ lessonIds: number[]; onlineStatus: string }>
    ) => {
      const idSet = new Set(action.payload.lessonIds);
      state.rows = state.rows.map((row) =>
        idSet.has(row.id) 
          ? { ...row, online: action.payload.onlineStatus }
          : row
      );
    },
    deleteLessons: (
      state,
      action: PayloadAction<{ lessonIds: number[] }>
    ) => {
      const idSet = new Set(action.payload.lessonIds);
      state.rows = state.rows.filter((row) => !idSet.has(row.id));
      // Update total count
      state.total = Math.max(0, state.total - action.payload.lessonIds.length);
      // Clean up discount data for deleted lessons
      action.payload.lessonIds.forEach((lessonId) => {
        delete state.lessonDiscounts[lessonId];
      });
    },
    updateLessonsStatus: (
      state,
      action: PayloadAction<{ lessonIds: number[]; status: string; newDate?: string; dateMap?: Map<number, string> }>
    ) => {
      const idSet = new Set(action.payload.lessonIds);
      state.rows = state.rows.map((row) => {
        if (idSet.has(row.id)) {
          const updatedRow = { ...row, status: action.payload.status };
          // If dateMap is provided, use it to update individual dates
          if (action.payload.dateMap && action.payload.dateMap.has(row.id)) {
            updatedRow.date = action.payload.dateMap.get(row.id)!;
          } else if (action.payload.newDate) {
            // Fallback to single newDate if dateMap not provided
            updatedRow.date = action.payload.newDate;
          }
          return updatedRow;
        }
        return row;
      });
    },
    /** After bulk-reschedule API: old rows get new ids and new dates */
    bulkRescheduleLessons: (
      state,
      action: PayloadAction<{
        rescheduledLessons: Array<{ oldLessonId: number; newLessonId: number }>;
        dateByOldLessonId: Record<number, string>;
      }>
    ) => {
      const { rescheduledLessons, dateByOldLessonId } = action.payload;
      const byOldId = new Map(rescheduledLessons.map((r) => [r.oldLessonId, r.newLessonId]));
      state.rows = state.rows.map((row) => {
        const newLessonId = byOldId.get(row.id);
        if (newLessonId == null) return row;
        const newDate = dateByOldLessonId[row.id] ?? row.date;
        return {
          ...row,
          id: newLessonId,
          date: newDate,
          status: "Rescheduled",
        };
      });
    },
    /** After teacher-substitute confirm: remove old lesson rows and add new ones from API */
    applyTeacherSubstituteResult: (
      state,
      action: PayloadAction<{ oldLessonIds: number[]; newRows: PrivateLessonRow[] }>
    ) => {
      const oldSet = new Set(action.payload.oldLessonIds);
      state.rows = state.rows.filter((row) => !oldSet.has(row.id));
      state.rows.push(...action.payload.newRows);
      state.total = Math.max(0, state.total - action.payload.oldLessonIds.length + action.payload.newRows.length);
      action.payload.oldLessonIds.forEach((id) => delete state.lessonDiscounts[id]);
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
  setShowAll,
  clearError,
  clearPrivateLessons,
  substituteTeacherForLessons,
  updateLessonsPrices,
  updateLessonsDuration,
  updateLessonsClassroom,
  updateLessonsOnlineStatus,
  deleteLessons,
  updateLessonsStatus,
  bulkRescheduleLessons,
  applyTeacherSubstituteResult,
} = privateLessonsListingSlice.actions;

// Selector to get discount data for a set of lessons
export const selectLessonDiscounts = (state: { privateLessonsListing: PrivateLessonsListingState }, lessonIds: number[]): LessonDiscountData | null => {
  if (lessonIds.length === 0) return null;
  
  // Check if all lessons have the same discount data
  const firstLessonDiscount = state.privateLessonsListing.lessonDiscounts[lessonIds[0]];
  if (!firstLessonDiscount) return null;
  
  // Verify all lessons have the same discount data
  const allHaveSameDiscount = lessonIds.every(
    (id) => {
      const discount = state.privateLessonsListing.lessonDiscounts[id];
      return discount && JSON.stringify(discount) === JSON.stringify(firstLessonDiscount);
    }
  );
  
  return allHaveSameDiscount ? firstLessonDiscount : null;
};

export default privateLessonsListingSlice.reducer;


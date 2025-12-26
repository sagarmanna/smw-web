import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getItemsList, ItemRow, ItemsQuery } from './itemsListing.api';
import { mockItemData } from './mockData/itemMockData';

export type SortField = "code" | "description";

interface ItemsListingState {
  rows: ItemRow[];
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
  // Show All
  showAll: boolean;
}

const initialState: ItemsListingState = {
  rows: [],
  total: 0,
  totalPages: 0,
  isLoading: false,
  error: null,
  page: 1,
  pageSize: 20,
  sortBy: 'code', // Default to sorting by code
  sortDir: 'asc',
  columnFilters: {},
  showAll: false,
};

// Helper function to filter and paginate mock data
const filterAndPaginateMockData = (
  data: ItemRow[],
  query: ItemsQuery
): { rows: ItemRow[]; total: number; totalPages: number } => {
  let filteredData = [...data];

  // Apply filters
  if (query.code) {
    filteredData = filteredData.filter(row =>
      row.code.toLowerCase().includes(query.code!.toLowerCase())
    );
  }

  if (query.itemCategory) {
    filteredData = filteredData.filter(row =>
      row.itemCategory.toLowerCase().includes(query.itemCategory!.toLowerCase())
    );
  }

  if (query.description) {
    filteredData = filteredData.filter(row =>
      row.description.toLowerCase().includes(query.description!.toLowerCase())
    );
  }

  // Apply sorting
  if (query.sort) {
    filteredData.sort((a, b) => {
      const aValue = (a[query.sort as keyof ItemRow] || "") as string;
      const bValue = (b[query.sort as keyof ItemRow] || "") as string;
      
      const comparison = String(aValue).localeCompare(String(bValue));
      
      return query.order === "desc" ? -comparison : comparison;
    });
  }

  const total = filteredData.length;
  const page = query.page || 1;
  const limit = query.limit || 20;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return {
    rows: paginatedData,
    total,
    totalPages,
  };
};

// Async thunk for fetching items list
export const fetchItems = createAsyncThunk(
  'itemsListing/fetchItems',
  async (
    { location, query }: { location: string; query: ItemsQuery },
    { rejectWithValue }
  ) => {
    try {
      // Use mock data for now
      const result = filterAndPaginateMockData(mockItemData, query);
      
      return {
        rows: result.rows,
        total: result.total,
        totalPages: result.totalPages,
      };

      // TODO: Uncomment when ready to use real API
      // const response = await getItemsList(location, query);
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
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch items');
    }
  }
);

const itemsListingSlice = createSlice({
  name: 'itemsListing',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },
    setSorting: (state, action: PayloadAction<{ sortBy?: SortField; sortDir: 'asc' | 'desc' }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortDir = action.payload.sortDir;
      state.page = 1;
    },
    setColumnFilters: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.columnFilters = action.payload;
      state.page = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearItems: (state) => {
      state.rows = [];
      state.total = 0;
      state.totalPages = 0;
      state.page = 1;
    },
    setShowAll: (state, action: PayloadAction<boolean>) => {
      state.showAll = action.payload;
      state.page = 1;
    },
    addItem: (state, action: PayloadAction<ItemRow>) => {
      // Add item to mock data (in real app, this would be handled by API)
      mockItemData.push(action.payload);
      // Refresh will happen on next fetch
    },
    updateItem: (state, action: PayloadAction<ItemRow>) => {
      // Update item in mock data (in real app, this would be handled by API)
      const index = mockItemData.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        mockItemData[index] = action.payload;
      }
      // Update in current rows if present
      const rowIndex = state.rows.findIndex(row => row.id === action.payload.id);
      if (rowIndex !== -1) {
        state.rows[rowIndex] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchItems.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchItems.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rows = action.payload.rows;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
        state.error = null;
      })
      .addCase(fetchItems.rejected, (state, action) => {
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
  clearError,
  clearItems,
  setShowAll,
  addItem,
  updateItem,
} = itemsListingSlice.actions;

export default itemsListingSlice.reducer;


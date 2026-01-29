import { apiClient } from '@/lib/api/client';

// ItemRow interface - matches API response structure directly
export interface ItemRow {
  id: number;
  code: string;
  itemCategory: string;
  description: string;
  price: number;
  royaltyFree: string; // "Yes" | "No"
  tax: string; // "No Tax" | "GST Only" | "Default" | etc.
  status: string; // "Enable" | "Disable"
}

// ItemsQuery interface for API queries (matches GET /admin/v2/training-location/items)
export interface ItemsQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  code?: string;
  description?: string;
  showAll?: 0 | 1;
  itemCategory?: string;
}

// API response structure
interface ItemsListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: ItemRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ItemsListResponse interface (internal representation)
export interface ItemsListResponse {
  success: boolean;
  message: string;
  data: {
    body: ItemRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const DEFAULT_SORT_BY = 'id';
const DEFAULT_SORT_ORDER = 'asc' as const;

// Helper to build query parameters - all server-side (pagination, sort, filter)
// When showAll=1 we still use limit from query (rows per page) so pagination and row-per-page work
const buildItemsQueryParams = (query: ItemsQuery): URLSearchParams => {
  const params = new URLSearchParams();
  const limit = query.limit == -1 ? 9999 : query.limit ?? DEFAULT_LIMIT;  

  params.append("page", (query.page ?? DEFAULT_PAGE).toString());
  params.append("limit", limit.toString());
  params.append("sortBy", query.sortBy ?? DEFAULT_SORT_BY);
  params.append("sortOrder", query.sortOrder ?? DEFAULT_SORT_ORDER);
  if (query.code) params.append("code", query.code);
  if (query.description) params.append("description", query.description);
  params.append("showAll", String(query.showAll ?? 0));
  if (query.itemCategory) params.append("itemCategory", query.itemCategory);

  return params;
};

// Helper to create empty response - DRY principle
const createEmptyItemsResponse = (): ItemsListResponse => ({
  success: false,
  message: "Failed to fetch items",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

export async function getItemsList(
  location: string,
  query: ItemsQuery
): Promise<ItemsListResponse> {
  try {
    const params = buildItemsQueryParams(query);

    const response = await apiClient.get<ItemsListApiResponse>(
      `/admin/v2/${location}/items`,
      { params }
    );

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        body: response.data.data.body,
        pagination: response.data.data.pagination,
      },
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyItemsResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch items";
    return emptyResponse;
  }
}


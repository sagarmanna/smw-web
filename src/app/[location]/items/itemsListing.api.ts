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

// ItemsQuery interface for API queries
export interface ItemsQuery {
  page?: number;
  limit?: number;
  code?: string;
  itemCategory?: string;
  description?: string;
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

const FETCH_ALL_LIMIT = 99999;

// Helper to build query parameters - DRY principle
const buildItemsQueryParams = (query: ItemsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  if (query.code) params.append("code", query.code);
  if (query.itemCategory) params.append("itemCategory", query.itemCategory);
  if (query.description) params.append("description", query.description);

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


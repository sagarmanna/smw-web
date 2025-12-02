import { apiClient } from '@/lib/api/client';

/**
 * Represents a single blog row in the listing table
 */
export interface BlogRow {
  userName: string | null;
  title: string;
  content: string;
  date: string;
}

/**
 * Response structure from the blogs API endpoint
 */
export interface BlogsListResponse {
  success: boolean;
  message: string;
  data: {
    body: BlogRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Query parameters for fetching blogs list
 */
export interface BlogsQuery {
  page?: number;
  limit?: number;
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

/**
 * Builds URL search parameters from query object
 * Validates and sanitizes input values
 */
const buildBlogsQueryParams = (query: BlogsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append("limit", query.limit.toString());
  }

  return params;
};

/**
 * Creates an empty response object for error cases
 */
const createEmptyBlogsResponse = (): BlogsListResponse => ({
  success: false,
  message: "Failed to fetch blogs",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

/**
 * Fetches blogs list from the API
 * 
 * @param _location - Location parameter (currently unused but kept for future location-scoped blogs)
 * @param query - Query parameters for pagination
 * @returns Promise resolving to blogs list response or null on error
 * 
 * @example
 * ```typescript
 * const blogs = await getBlogs('location1', { page: 1, limit: 20 });
 * ```
 */
export async function getBlogs(
  _location: string, // Prefixed with _ to indicate intentionally unused
  query: BlogsQuery
): Promise<BlogsListResponse | null> {
  try {
    // Validate query parameters
    const validatedQuery: BlogsQuery = {
      page: query.page && query.page > 0 ? query.page : 1,
      limit: query.limit && query.limit > 0 && query.limit <= 100 ? query.limit : 20,
    };

    const params = buildBlogsQueryParams(validatedQuery);

    const response = await apiClient.get<BlogsListResponse>(
      `/admin/v2/blogs`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error("Error fetching blogs:", error);
    const emptyResponse = createEmptyBlogsResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch blogs";
    return emptyResponse;
  }
}

/**
 * Request payload for creating a new blog
 */
export interface CreateBlogRequest {
  title: string;
  content: string;
}

/**
 * Response structure from the create blog API endpoint
 */
export interface CreateBlogResponse {
  success: boolean;
  message: string;
  data?: {
    id: number;
    title: string;
    content: string;
    date: string;
  };
}

/**
 * Creates a new blog post
 * 
 * @param location - Location parameter (currently unused but kept for consistency)
 * @param data - Blog data (title and content)
 * @returns Promise resolving to create blog response
 * 
 * @example
 * ```typescript
 * const blog = await createBlog('location1', { 
 *   title: 'My Blog Post', 
 *   content: '<p>Blog content</p>' 
 * });
 * ```
 */
export async function createBlog(
  location: string,
  data: CreateBlogRequest
): Promise<CreateBlogResponse> {
  try {
    const response = await apiClient.post<CreateBlogResponse>(
      `/admin/v2/blogs`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: CreateBlogResponse } };
    console.error("Error creating blog:", error);
    throw {
      message: apiError.response?.data?.message || "Failed to create blog",
      errorCode: apiError.response?.data?.success === false ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
    };
  }
}


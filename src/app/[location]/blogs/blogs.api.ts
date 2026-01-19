import { apiClient } from '@/lib/api/client';

/**
 * Represents a single blog row in the listing table
 */
export interface BlogRow {
  /**
   * Blog identifier (may be omitted by some list endpoints)
   */
  id?: number;
  userName: string | null;
  title: string;
  content: string;
  date: string;
}

/**
 * Represents a single blog item (full detail)
 */
export interface BlogDetails {
  id: number;
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

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

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

  // Always include page/limit for predictable backend behavior
  params.append("page", (query.page ?? DEFAULT_PAGINATION.page).toString());
  params.append("limit", (query.limit ?? DEFAULT_PAGINATION.limit).toString());

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
    const apiError = error as ApiErrorShape;
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
 * Response structure from get blog by id API endpoint
 */
export interface GetBlogByIdResponse {
  success: boolean;
  message: string;
  data?: BlogDetails;
}

/**
 * Request payload for updating a blog
 */
export interface UpdateBlogRequest {
  title: string;
  content: string;
}

/**
 * Response structure from update blog API endpoint
 */
export interface UpdateBlogResponse {
  success: boolean;
  message: string;
  data?: BlogDetails;
}

/**
 * Response structure from delete blog API endpoint
 */
export interface DeleteBlogResponse {
  success: boolean;
  message: string;
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
  _location: string, // Prefixed with _ to indicate intentionally unused
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

/**
 * Fetches a single blog by id
 *
 * @param _location - Location parameter (currently unused but kept for consistency)
 * @param blogId - Blog id
 * @returns Promise resolving to blog detail response (or an unsuccessful response on error)
 */
export async function getBlogById(
  _location: string,
  blogId: number
): Promise<GetBlogByIdResponse> {
  try {
    const response = await apiClient.get<GetBlogByIdResponse>(
      `/admin/v2/blogs/${blogId}`
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as ApiErrorShape;
    console.error("Error fetching blog by id:", error);
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to fetch blog",
      data: undefined,
    };
  }
}

/**
 * Updates an existing blog
 *
 * @param _location - Location parameter (currently unused but kept for consistency)
 * @param blogId - Blog id
 * @param data - Updated blog data
 * @returns Promise resolving to update blog response
 */
export async function updateBlog(
  _location: string,
  blogId: number,
  data: UpdateBlogRequest
): Promise<UpdateBlogResponse> {
  try {
    const response = await apiClient.put<UpdateBlogResponse>(
      `/admin/v2/blogs/${blogId}`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: UpdateBlogResponse } };
    console.error("Error updating blog:", error);
    throw {
      message: apiError.response?.data?.message || "Failed to update blog",
      errorCode: apiError.response?.data?.success === false ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
    };
  }
}

/**
 * Deletes an existing blog
 *
 * @param _location - Location parameter (currently unused but kept for consistency)
 * @param blogId - Blog id
 * @returns Promise resolving to delete blog response
 */
export async function deleteBlog(
  _location: string,
  blogId: number
): Promise<DeleteBlogResponse> {
  try {
    const response = await apiClient.delete<DeleteBlogResponse>(
      `/admin/v2/blogs/${blogId}`
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: DeleteBlogResponse } };
    console.error("Error deleting blog:", error);
    throw {
      message: apiError.response?.data?.message || "Failed to delete blog",
      errorCode: apiError.response?.data?.success === false ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR",
    };
  }
}


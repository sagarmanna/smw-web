import { apiClient } from '@/lib/api/client';
import {
  StudentApiResponse,
  mapApiResponseToStudentRows,
} from './utils/mapDataTransformers';

// StudentRow interface for listing table (internal representation)
export interface StudentRow {
  userId: string; // Using string to match id field
  isActive: boolean;
  firstName: string;
  lastName: string;
  customer: string;
  phoneNumber: string;
}

// StudentsQuery interface for API queries
export interface StudentsQuery {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  customer?: string;
  phone?: string;
  showActive?: boolean;
  showInActive?: boolean;
  sort?: "firstName" | "lastName" ;
  order?: "asc" | "desc";
}

// API response structure
interface StudentsListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: StudentApiResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}


// StudentsListResponse interface (internal representation)
export interface StudentsListResponse {
  success: boolean;
  message: string;
  data: {
    body: StudentRow[];
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
const buildStudentsQueryParams = (query: StudentsQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  if (query.firstName) params.append("firstName", query.firstName);
  if (query.lastName) params.append("lastName", query.lastName);
  if (query.customer) params.append("studentsName", query.customer);
  if (query.phone) params.append("phone", query.phone);
  if (query.showActive !== undefined) {
    params.append("showActive", query.showActive.toString());
  }
  if (query.showInActive !== undefined) {
    params.append("showInActive", query.showInActive.toString());
  }
  if (query.sort) {
    params.append("sort", query.sort);
    // Always include order when sort is provided
    // Use explicit order if provided, otherwise default to 'asc'
    const orderValue = query.order && query.order.trim() !== "" ? query.order : "asc";
    params.append("order", orderValue);
  }

  return params;
};

// Helper to create empty response - DRY principle
const createEmptyStudentsResponse = (): StudentsListResponse => ({
  success: false,
  message: "Failed to fetch students",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

export async function getStudentsList(
  location: string,
  query: StudentsQuery
): Promise<StudentsListResponse> {
  try {
    const params = buildStudentsQueryParams(query);

    const response = await apiClient.get<StudentsListApiResponse>(
      `/admin/v2/${location}/user/list/student`,
      { params }
    );

    // Map API response to internal format
    const mappedBody = mapApiResponseToStudentRows(response.data.data.body);

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        body: mappedBody,
        pagination: response.data.data.pagination,
      },
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyStudentsResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch students";
    return emptyResponse;
  }
}

import { apiClient } from '@/lib/api/client';

// Teacher Details Update API
export interface UpdateTeacherDetailsData {
  firstName: string;
  lastName: string;
  birthDate?: string;
}

export interface UpdateTeacherDetailsResponse {
  status: boolean;
  message?: string;
  errors?: string[];
}

export async function updateTeacherDetails(
  location: string,
  teacherId: number,
  data: UpdateTeacherDetailsData
): Promise<UpdateTeacherDetailsResponse> {
  try {
    const response = await apiClient.put<UpdateTeacherDetailsResponse>(
      `/admin/v2/${location}/teachers/${teacherId}/details`,
      data
    );
    return response.data;
  } catch (error) {
    console.error("Error updating teacher details:", error);
    return {
      status: false,
      message: "Failed to update teacher details",
    };
  }
}

export interface TeacherRow {
  userId: number;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface TeachersListResponse {
  success: boolean;
  message: string;
  data: {
    body: TeacherRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TeachersQuery {
  page?: number;
  limit?: number;
  firstName?: string;
  lastName?: string;
  studentsName?: string;
  email?: string;
  phone?: string;
  balance?: "all" | "credit" | "owing";
  showActive?: boolean;
  showInActive?: boolean;
  showAll?: boolean;
  sort?: "firstName" | "lastName" | "email";
  order?: "asc" | "desc";
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
const buildTeachersQueryParams = (query: TeachersQuery): URLSearchParams => {
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
  if (query.studentsName) params.append("studentsName", query.studentsName);
  if (query.email) params.append("email", query.email);
  if (query.phone) params.append("phone", query.phone);
  if (query.balance) params.append("balance", query.balance);
  if (query.showActive !== undefined) {
    params.append("showActive", query.showActive.toString());
  }
  if (query.showInActive !== undefined) {
    params.append("showInActive", query.showInActive.toString());
  }
  if (query.showAll !== undefined) {
    params.append("showAll", query.showAll.toString());
  }
  if (query.sort) params.append("sort", query.sort);
  if (query.order) params.append("order", query.order);

  // Always include role=teacher for the user/list endpoint
  params.append("role", "teacher");

  return params;
};

// Helper to create empty response - DRY principle
const createEmptyTeachersResponse = (): TeachersListResponse => ({
  success: false,
  message: "Failed to fetch teachers",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

export async function getTeachers(
  location: string,
  query: TeachersQuery
): Promise<TeachersListResponse | null> {
  try {
    const params = buildTeachersQueryParams(query);

    const response = await apiClient.get<TeachersListResponse>(
      `/admin/v2/${location}/user/list`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error("Error fetching teachers:", error);
    const emptyResponse = createEmptyTeachersResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch teachers";
    return emptyResponse;
  }
}

export async function getTeacherById(
  location: string,
  id: number
): Promise<TeacherRow | null> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: TeacherRow;
      message: string;
    }>(`/admin/v2/${location}/user/${id}`, {
      params: { role: "teacher" },
    });
    return response.data.success ? response.data.data : null;
  } catch (error: unknown) {
    console.error("Error fetching teacher by id:", error);
    return null;
  }
}

export interface Program {
  id: number;
  name: string;
  // MySQL DECIMAL often comes back as string; support both to avoid runtime issues
  rate?: number | string | null;
}

export interface ProgramsListResponse {
  success: boolean;
  message: string;
  data: Program[];
}

export async function getProgramsList(type?: 'private' | 'group'): Promise<Program[]> {
  try {
    const params = type ? { type } : {};
    const response = await apiClient.get<ProgramsListResponse>(
      `/admin/v2/programs/list`,
      { params }
    );
    return response.data.success ? response.data.data : [];
  } catch (error: unknown) {
    console.error("Error fetching programs list:", error);
    return [];
  }
}
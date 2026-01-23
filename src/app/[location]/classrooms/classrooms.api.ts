/**
 * Classrooms API and data types
 */

import {
  createCrudApi,
  StandardListResponse,
  StandardCrudResponse,
  StandardDeleteResponse,
  FETCH_ALL_LIMIT,
} from "@/utils/api/createCrudApi";

export interface ClassroomRow {
  id: number;
  name: string;
  description: string;
}

export type ClassroomsSortField = "name" | "description";
export type ClassroomsOrder = "ASC" | "DESC";

export interface ClassroomsQuery {
  page?: number;
  limit?: number;
  name?: string;
  description?: string;
  sort?: ClassroomsSortField;
  order?: ClassroomsOrder;
}

export type ClassroomsListResponse = StandardListResponse<ClassroomRow>;
export type CreateClassroomResponse = StandardCrudResponse<{ id: number }>;
export type UpdateClassroomResponse = StandardCrudResponse<{ id: number }>;
export type DeleteClassroomResponse = StandardDeleteResponse;
export type ClassroomDetailResponse = StandardCrudResponse<ClassroomRow>;

export interface CreateClassroomRequest {
  name: string;
  description: string;
}

export interface UpdateClassroomRequest {
  id: number;
  name: string;
  description: string;
}

const classroomsApi = createCrudApi<ClassroomRow, ClassroomsQuery, CreateClassroomRequest, UpdateClassroomRequest>({
  endpoint: (location) => `/admin/v2/${location}/classrooms`,
  entityName: "classroom",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.name) params.name = query.name;
    if (query.description) params.description = query.description;
    if (query.sort) params.sort = query.sort;
    if (query.order) params.order = query.order;
    return params;
  },
});

export const getClassrooms = async (location: string, query: ClassroomsQuery): Promise<ClassroomsListResponse | null> => {
  return classroomsApi.getList(location, query) as Promise<ClassroomsListResponse | null>;
};

export const createClassroom = async (
  location: string,
  payload: CreateClassroomRequest
): Promise<CreateClassroomResponse> => {
  return classroomsApi.create(location, payload) as Promise<CreateClassroomResponse>;
};

export const updateClassroom = async (
  location: string,
  payload: UpdateClassroomRequest
): Promise<UpdateClassroomResponse> => {
  return classroomsApi.update(location, payload) as Promise<UpdateClassroomResponse>;
};

export const deleteClassroom = async (location: string, id: number): Promise<DeleteClassroomResponse> => {
  return classroomsApi.delete(location, id) as Promise<DeleteClassroomResponse>;
};

export const getClassroomById = async (location: string, id: number): Promise<ClassroomDetailResponse | null> => {
  try {
    // The backend does not currently support GET /classrooms/{id} (404),
    // so we fetch from the list endpoint and resolve by id client-side.
    const list = await getClassrooms(location, { page: 1, limit: FETCH_ALL_LIMIT });
    const match = list?.data?.body?.find((c) => c.id === id);

    if (match) {
      return { success: true, data: match, message: "Classroom retrieved successfully" };
    }

    return { success: false, data: undefined, message: "Classroom not found" };
  } catch (error) {
    console.error("Error fetching classroom:", error);
    return null;
  }
};


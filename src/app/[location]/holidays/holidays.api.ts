/**
 * Holidays API and data types
 */

import {
  createCrudApi,
  StandardListResponse,
  StandardCrudResponse,
  StandardDeleteResponse,
  FETCH_ALL_LIMIT,
} from "@/utils/api/createCrudApi";

export interface HolidayRow {
  id: number;
  date: string; // Display format: "Dec 25, 2017"
  description: string;
}

export interface HolidayQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

/**
 * Response structure for paginated holidays list API
 */
export type HolidayListResponse = StandardListResponse<HolidayRow>;

export interface CreateHolidayRequest {
  date: string; // ISO format: "YYYY-MM-DD"
  description: string;
}

export interface UpdateHolidayRequest {
  id: number;
  date: string; // ISO format: "YYYY-MM-DD"
  description: string;
}

export type CreateHolidayResponse = StandardCrudResponse<
  HolidayRow & { createdByUserId?: number }
>;
export type UpdateHolidayResponse = StandardCrudResponse<
  HolidayRow & { updatedByUserId?: number }
>;
export type DeleteHolidayResponse = StandardDeleteResponse;

// Create CRUD API functions using the factory
const holidaysApi = createCrudApi<
  HolidayRow,
  HolidayQuery,
  CreateHolidayRequest,
  UpdateHolidayRequest
>({
  endpoint: "/admin/v2/holidays",
  entityName: "holiday",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined)
      params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.sort) {
      params.sort = query.sort;
      if (query.order) {
        params.order = query.order;
      }
    }
    return params;
  },
});

// Export typed functions
export const getHolidays = async (
  location: string,
  query?: HolidayQuery
): Promise<HolidayListResponse | null> => {
  return holidaysApi.getList(location, query || {}) as Promise<
    HolidayListResponse | null
  >;
};

export const createHoliday = async (
  location: string,
  payload: CreateHolidayRequest
): Promise<CreateHolidayResponse> => {
  return holidaysApi.create(location, payload) as Promise<CreateHolidayResponse>;
};

export const updateHoliday = async (
  location: string,
  payload: UpdateHolidayRequest
): Promise<UpdateHolidayResponse> => {
  return holidaysApi.update(location, payload) as Promise<UpdateHolidayResponse>;
};

export const deleteHoliday = async (
  location: string,
  id: number
): Promise<DeleteHolidayResponse> => {
  return holidaysApi.delete(location, id) as Promise<DeleteHolidayResponse>;
};

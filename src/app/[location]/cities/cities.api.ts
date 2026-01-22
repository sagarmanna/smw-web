/**
 * Cities API and data types
 */

import { createCrudApi, StandardListResponse, StandardCrudResponse, StandardDeleteResponse, FETCH_ALL_LIMIT } from "@/utils/api/createCrudApi";

export interface CityRow {
  id: number;
  name: string;
  province: string;
  provinceId?: number;
}

export type CitiesSortField = "name" | "province";
export type CitiesOrder = "ASC" | "DESC";

export interface CitiesQuery {
  page?: number;
  limit?: number;
  name?: string;
  province?: string;
  sort?: CitiesSortField;
  order?: CitiesOrder;
}

export type CitiesListResponse = StandardListResponse<CityRow>;
export type CreateCityResponse = StandardCrudResponse<{
  id: number;
  name: string;
  provinceId: number;
  createdOn?: string;
  createdByUserId?: number;
}>;
export type UpdateCityResponse = StandardCrudResponse<{
  id: number;
  name: string;
  provinceId: number;
  updatedOn?: string;
  updatedByUserId?: number;
}>;
export type DeleteCityResponse = StandardDeleteResponse;

export interface CreateCityRequest {
  name: string;
  provinceId: number;
}

export interface UpdateCityRequest {
  id: number;
  name: string;
  provinceId: number;
}

// Create CRUD API functions using the factory
const citiesApi = createCrudApi<CityRow, CitiesQuery, CreateCityRequest, UpdateCityRequest>({
  endpoint: (location) => `/admin/v2/${location}/cities`,
  entityName: "city",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.name) params.name = query.name;
    if (query.province) params.province = query.province;
    if (query.sort) params.sort = query.sort;
    if (query.order) params.order = query.order;
    return params;
  },
});

// Export typed functions
export const getCities = async (location: string, query: CitiesQuery): Promise<CitiesListResponse | null> => {
  return citiesApi.getList(location, query) as Promise<CitiesListResponse | null>;
};

export const createCity = async (location: string, payload: CreateCityRequest): Promise<CreateCityResponse> => {
  return citiesApi.create(location, payload) as Promise<CreateCityResponse>;
};

export const updateCity = async (location: string, payload: UpdateCityRequest): Promise<UpdateCityResponse> => {
  return citiesApi.update(location, payload) as Promise<UpdateCityResponse>;
};

export const deleteCity = async (location: string, id: number): Promise<DeleteCityResponse> => {
  return citiesApi.delete(location, id) as Promise<DeleteCityResponse>;
};

/**
 * Provinces API and data types
 */

import {
  createCrudApi,
  StandardListResponse,
  StandardCrudResponse,
  StandardDeleteResponse,
  FETCH_ALL_LIMIT,
} from "@/utils/api/createCrudApi";

export interface ProvinceRow {
  id: number;
  name: string;
  taxRate: number;
  country: string;
  countryId?: number;
}

export interface ProvincesQuery {
  page?: number;
  limit?: number;
  name?: string;
  sort?: "name";
  order?: "ASC" | "DESC";
}

export type ProvincesListResponse = StandardListResponse<ProvinceRow>;
export type CreateProvinceResponse = StandardCrudResponse<{
  id: number;
  name: string;
  taxRate: number;
  countryId: number;
  createdOn?: string;
  createdByUserId?: number;
}>;
export type UpdateProvinceResponse = StandardCrudResponse<{
  id: number;
  name: string;
  taxRate: number;
  countryId: number;
  updatedOn?: string;
  updatedByUserId?: number;
}>;
export type DeleteProvinceResponse = StandardDeleteResponse;

export interface CreateProvinceRequest {
  name: string;
  taxRate: number;
  countryId: number;
}

export interface UpdateProvinceRequest {
  id: number;
  name: string;
  taxRate: number;
  countryId: number;
}

// Create CRUD API functions using the factory
const provincesApi = createCrudApi<ProvinceRow, ProvincesQuery, CreateProvinceRequest, UpdateProvinceRequest>({
  endpoint: (location) => `/admin/v2/${location}/provinces`,
  entityName: "province",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.name) params.name = query.name;
    // Server-side sorting
    params.sort = query.sort || "name";
    params.order = query.order || "ASC";
    return params;
  },
});

export const getProvinces = async (location: string, query: ProvincesQuery): Promise<ProvincesListResponse | null> => {
  return provincesApi.getList(location, query) as Promise<ProvincesListResponse | null>;
};

export const createProvince = async (
  location: string,
  payload: CreateProvinceRequest
): Promise<CreateProvinceResponse> => {
  return provincesApi.create(location, payload) as Promise<CreateProvinceResponse>;
};

export const updateProvince = async (
  location: string,
  payload: UpdateProvinceRequest
): Promise<UpdateProvinceResponse> => {
  return provincesApi.update(location, payload) as Promise<UpdateProvinceResponse>;
};

export const deleteProvince = async (location: string, id: number): Promise<DeleteProvinceResponse> => {
  return provincesApi.delete(location, id) as Promise<DeleteProvinceResponse>;
};



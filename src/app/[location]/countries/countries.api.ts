/**
 * Countries API and data types
 */

import {
  createCrudApi,
  StandardCrudResponse,
  StandardDeleteResponse,
  StandardListResponse,
  FETCH_ALL_LIMIT,
} from "@/utils/api/createCrudApi";

export interface CountryRow {
  id: number;
  name: string;
}

export interface CountriesQuery {
  page?: number;
  limit?: number;
  name?: string;
}

export type CountriesListResponse = StandardListResponse<CountryRow>;
export type CreateCountryResponse = StandardCrudResponse<{
  id: number;
  name: string;
  createdOn?: string;
  createdByUserId?: number;
}>;
export type UpdateCountryResponse = StandardCrudResponse<{
  id: number;
  name: string;
  updatedOn?: string;
  updatedByUserId?: number;
}>;
export type DeleteCountryResponse = StandardDeleteResponse;

export interface CreateCountryRequest {
  name: string;
}

export interface UpdateCountryRequest {
  id: number;
  name: string;
}

const countriesApi = createCrudApi<CountryRow, CountriesQuery, CreateCountryRequest, UpdateCountryRequest>({
  endpoint: (location) => `/admin/v2/${location}/countries`,
  entityName: "country",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.name) params.name = query.name;
    // IMPORTANT: backend rejects unknown query keys (400 BAD_REQUEST)
    // Do NOT send sort/order until API explicitly supports them for this endpoint.
    return params;
  },
});

export const getCountries = async (location: string, query: CountriesQuery): Promise<CountriesListResponse | null> => {
  return countriesApi.getList(location, query) as Promise<CountriesListResponse | null>;
};

export const createCountry = async (location: string, payload: CreateCountryRequest): Promise<CreateCountryResponse> => {
  return countriesApi.create(location, payload) as Promise<CreateCountryResponse>;
};

export const updateCountry = async (location: string, payload: UpdateCountryRequest): Promise<UpdateCountryResponse> => {
  return countriesApi.update(location, payload) as Promise<UpdateCountryResponse>;
};

export const deleteCountry = async (location: string, id: number): Promise<DeleteCountryResponse> => {
  return countriesApi.delete(location, id) as Promise<DeleteCountryResponse>;
};



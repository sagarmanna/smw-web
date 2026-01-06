/**
 * Tax Codes API and data types
 */

import {
  createCrudApi,
  FETCH_ALL_LIMIT,
  StandardCrudResponse,
  StandardDeleteResponse,
  StandardListResponse,
} from "@/utils/api/createCrudApi";

export interface TaxCodeRow {
  id: number;
  taxName: string;
  taxNameId?: number;
  provinceName: string;
  provinceId?: number;
  rate: string;
  startDate?: string;
  code: string;
}

export interface TaxCodesQuery {
  page?: number;
  limit?: number;
  taxName?: string;
  provinceName?: string;
  code?: string;
}

export type TaxCodesListResponse = StandardListResponse<TaxCodeRow>;
export type CreateTaxCodeResponse = StandardCrudResponse<{ id: number }>;
export type UpdateTaxCodeResponse = StandardCrudResponse<{ id: number }>;
export type DeleteTaxCodeResponse = StandardDeleteResponse;

export interface CreateTaxCodeRequest {
  taxTypeId: number;
  provinceId: number;
  code: string;
  rate: number;
  startDate?: string;
}

export interface UpdateTaxCodeRequest {
  id: number;
  taxTypeId: number;
  provinceId: number;
  code: string;
  rate: number;
  startDate?: string;
}

const taxCodesApi = createCrudApi<TaxCodeRow, TaxCodesQuery, CreateTaxCodeRequest, UpdateTaxCodeRequest>({
  // User provided example: /admin/v2/training-location/tax-codes
  // We keep it dynamic by using the route `[location]` param.
  endpoint: (location) => `/admin/v2/${location}/tax-codes`,
  entityName: "tax code",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    // IMPORTANT: backend may reject unknown query keys (400 BAD_REQUEST)
    if (query.taxName) params.taxName = query.taxName;
    if (query.provinceName) params.provinceName = query.provinceName;
    if (query.code) params.code = query.code;
    return params;
  },
});

export const getTaxCodes = async (location: string, query: TaxCodesQuery): Promise<TaxCodesListResponse | null> => {
  return taxCodesApi.getList(location, query) as Promise<TaxCodesListResponse | null>;
};

export const createTaxCode = async (location: string, payload: CreateTaxCodeRequest): Promise<CreateTaxCodeResponse> => {
  return taxCodesApi.create(location, payload) as Promise<CreateTaxCodeResponse>;
};

export const updateTaxCode = async (location: string, payload: UpdateTaxCodeRequest): Promise<UpdateTaxCodeResponse> => {
  return taxCodesApi.update(location, payload) as Promise<UpdateTaxCodeResponse>;
};

export const deleteTaxCode = async (location: string, id: number): Promise<DeleteTaxCodeResponse> => {
  return taxCodesApi.delete(location, id) as Promise<DeleteTaxCodeResponse>;
};



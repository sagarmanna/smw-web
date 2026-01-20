/**
 * Item Categories API and data types
 *
 * Endpoint:
 * GET /admin/v2/:location/item-categories?page=1&limit=20
 */

import { createCrudApi, StandardListResponse, FETCH_ALL_LIMIT } from "@/utils/api/createCrudApi";

export interface ItemCategoryRow {
  id: number;
  name: string;
}

export interface ItemCategoriesQuery {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
}

export type ItemCategoriesListResponse = StandardListResponse<ItemCategoryRow>;

export type CreateItemCategoryRequest = Pick<ItemCategoryRow, "name">;
export type UpdateItemCategoryRequest = Pick<ItemCategoryRow, "id" | "name">;

const itemCategoriesApi = createCrudApi<
  ItemCategoryRow,
  ItemCategoriesQuery,
  CreateItemCategoryRequest,
  UpdateItemCategoryRequest
>({
  endpoint: (location) => `/admin/v2/${location}/item-categories`,
  entityName: "item category",
  buildQueryParams: (query) => {
    const params: Record<string, unknown> = {};
    if (query.page !== undefined) params.page = query.page;
    if (query.limit !== undefined) params.limit = query.limit === -1 ? FETCH_ALL_LIMIT : query.limit;
    if (query.sort) params.sort = query.sort;
    if (query.order) params.order = query.order;
    return params;
  },
});

export const getItemCategories = async (
  location: string,
  query: ItemCategoriesQuery
): Promise<ItemCategoriesListResponse | null> => {
  return itemCategoriesApi.getList(location, query) as Promise<ItemCategoriesListResponse | null>;
};

export const createItemCategory = async (
  location: string,
  payload: CreateItemCategoryRequest
): Promise<{ success: boolean; message?: string }> => {
  return itemCategoriesApi.create(location, payload);
};

export const updateItemCategory = async (
  location: string,
  payload: UpdateItemCategoryRequest
): Promise<{ success: boolean; message?: string }> => {
  return itemCategoriesApi.update(location, payload);
};

export const deleteItemCategory = async (
  location: string,
  id: number
): Promise<{ success: boolean; message?: string }> => {
  return itemCategoriesApi.delete(location, id);
};



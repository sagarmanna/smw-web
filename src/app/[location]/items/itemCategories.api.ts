import { apiClient } from "@/lib/api/client";

export interface ItemCategoryOption {
  id: number;
  name: string;
}

export interface ItemCategoriesResponse {
  success: boolean;
  data: ItemCategoryOption[];
  message?: string;
}

export interface CreateItemCategoryRequest {
  name: string;
}

export interface CreateItemCategoryResponse {
  success: boolean;
  data: {
    id: number;
    name: string;
    createdByUserId?: number;
  };
  message?: string;
}

export async function getItemCategories(location: string): Promise<ItemCategoriesResponse> {
  try {
    const response = await apiClient.get<ItemCategoriesResponse>(
      `/admin/v2/${location}/item-categories`
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message: apiError.response?.data?.message || "Failed to fetch item categories",
    };
  }
}

export async function createItemCategory(
  location: string,
  data: CreateItemCategoryRequest
): Promise<CreateItemCategoryResponse> {
  try {
    const response = await apiClient.post<CreateItemCategoryResponse>(
      `/admin/v2/${location}/item-categories`,
      data
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; data?: { message?: string } } };
    return {
      success: false,
      data: { id: 0, name: "" },
      message: apiError.response?.data?.message || "Failed to create item category",
    };
  }
}



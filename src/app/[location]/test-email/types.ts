/**
 * Types for Test Email feature
 */
 
import type { StandardCrudResponse, StandardListResponse } from "@/utils/api/createCrudApi";

export interface TestEmailRow {
  id: number;
  email: string;
  updatedOn?: string;
  updatedByUserId?: number;
}

export type TestEmailListResponse = StandardListResponse<TestEmailRow>;

export interface UpdateTestEmailRequest {
  email: string;
}

export type UpdateTestEmailResponse = StandardCrudResponse<TestEmailRow>;


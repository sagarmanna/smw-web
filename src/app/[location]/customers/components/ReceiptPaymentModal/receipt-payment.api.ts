// api/payment-receipt.api.ts
import { apiClient } from '@/lib/api/client';

// ==========================================
// INTERFACES
// ==========================================

export interface LocationDetails {
  name: string;
  address: string;
  city: string;
  province: string;
  country: string;
  postalCode: string;
  phoneNumber: string;
  email: string;
  hstRegistrationNo: string;
}

export interface PaymentReceiptInfoResponse {
  success: boolean;
  message: string;
  data: {
    body: [{
      userId: number;
      reference: string;
      date: string;
      paymentMethod: string;
      amount: number;
    }];
    locationDetails: LocationDetails;
    locationHstRegistrationNo: string;
    acknowledgmentMessage: string;
  };
}

export interface PaymentUsedLesson {
  id: number;
  originalDate: string;
  date: string;
  student: string;
  program: string;
  teacher: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface PaymentUsedLessonsResponse {
  success: boolean;
  message: string;
  data: {
    body: PaymentUsedLesson[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaymentGroupLesson {
  id: number;
  date: string;
  student: string;
  program: string;
  invoiced: string;
  amount: string;
  balance: string;
}

export interface PaymentGroupLessonsResponse {
  success: boolean;
  message: string;
  data: {
    body: PaymentGroupLesson[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaymentInvoice {
  id: number;
  date: string;
  number: string;
  amount: string;
  payment: string;
  balance: string;
}

export interface PaymentInvoicesResponse {
  success: boolean;
  message: string;
  data: {
    body: PaymentInvoice[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaymentMethod {
  id: number;
  name: string;
}

export interface PaymentMethodsResponse {
  success: boolean;
  message?: string;
  data: {
    body: PaymentMethod[];
  };
}

// Generic pagination interface
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Generic paginated response
interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

// Generic API response with body
interface ApiResponseWithBody<T> {
  success: boolean;
  message: string;
  data: {
    body: T[];
    pagination?: Pagination;
  };
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Build query parameters for pagination
 * @param page - Page number
 * @param limit - Items per page (-1 for all items)
 * @returns URLSearchParams object
 */
function buildPaginationParams(page: number = 1, limit: number = 10): URLSearchParams {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit === -1 ? '99999' : limit.toString());
  return params;
}

/**
 * Create default pagination object
 * @param dataLength - Length of data array
 * @returns Default pagination object
 */
function createDefaultPagination(dataLength: number = 0): Pagination {
  return {
    page: 1,
    limit: 10,
    total: dataLength,
    totalPages: dataLength > 0 ? 1 : 0,
  };
}

/**
 * Generic function to fetch paginated data
 * DRY helper to avoid repeating pagination logic
 * @param endpoint - API endpoint
 * @param page - Page number
 * @param limit - Items per page
 * @param errorMessage - Error message prefix
 * @returns Paginated response with data and pagination info
 */
async function fetchPaginatedData<T>(
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  errorMessage: string = 'Error fetching data'
): Promise<PaginatedResponse<T>> {
  try {
    const params = buildPaginationParams(page, limit);
    const response = await apiClient.get<ApiResponseWithBody<T>>(endpoint, { params });

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || createDefaultPagination(response.data.data.body.length),
      };
    }

    return {
      data: [],
      pagination: createDefaultPagination(),
    };
  } catch (error: unknown) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
}

// ==========================================
// API FUNCTIONS
// ==========================================

/**
 * Fetch payment receipt info
 * Endpoint: GET /admin/v2/{location}/payment/{paymentId}/info/payment-used
 */
export async function getPaymentReceiptInfo(
  location: string,
  paymentId: number | string
): Promise<{
  userId: number;
  reference: string;
  date: string;
  paymentMethod: string;
  amount: number;
  locationDetails: LocationDetails | null;
  locationHstRegistrationNo: string;
  acknowledgmentMessage: string;
} | null> {
  try {
    const response = await apiClient.get<PaymentReceiptInfoResponse>(
      `/admin/v2/${location}/payment/${paymentId}/info/payment-used`
    );

    if (response.data.success && response.data.data.body && response.data.data.body.length > 0) {
      const body = response.data.data.body[0];
      return {
        userId: body.userId,
        reference: body.reference,
        date: body.date,
        paymentMethod: body.paymentMethod,
        amount: body.amount,
        locationDetails: response.data.data.locationDetails || null,
        locationHstRegistrationNo: response.data.data.locationHstRegistrationNo,
        acknowledgmentMessage: response.data.data.acknowledgmentMessage,
      };
    }

    return null;
  } catch (error: unknown) {
    console.error('Error fetching payment receipt info:', error);
    throw error;
  }
}

/**
 * Fetch payment used lessons
 * Endpoint: GET /admin/v2/{location}/payment/{paymentId}/info/lessons
 */
export function getPaymentUsedLessons(
  location: string,
  paymentId: number | string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<PaymentUsedLesson>> {
  return fetchPaginatedData<PaymentUsedLesson>(
    `/admin/v2/${location}/payment/${paymentId}/info/lessons`,
    page,
    limit,
    'Error fetching payment used lessons'
  );
}

/**
 * Fetch payment group lessons
 * Endpoint: GET /admin/v2/{location}/payment/{paymentId}/info/group-lessons
 */
export function getPaymentGroupLessons(
  location: string,
  paymentId: number | string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<PaymentGroupLesson>> {
  return fetchPaginatedData<PaymentGroupLesson>(
    `/admin/v2/${location}/payment/${paymentId}/info/group-lessons`,
    page,
    limit,
    'Error fetching payment group lessons'
  );
}

/**
 * Fetch payment invoices
 * Endpoint: GET /admin/v2/{location}/payment/{paymentId}/info/invoices
 */
export function getPaymentInvoices(
  location: string,
  paymentId: number | string,
  page: number = 1,
  limit: number = 10
): Promise<PaginatedResponse<PaymentInvoice>> {
  return fetchPaginatedData<PaymentInvoice>(
    `/admin/v2/${location}/payment/${paymentId}/info/invoices`,
    page,
    limit,
    'Error fetching payment invoices'
  );
}

/**
 * Fetch available payment methods
 * Endpoint: GET /admin/v2/{location}/payment-methods
 */
export async function getPaymentMethods(location: string): Promise<PaymentMethod[]> {
  try {
    const response = await apiClient.get<PaymentMethodsResponse>(
      `/admin/v2/${location}/payment-methods`
    );

    if (response.data.success && response.data.data.body) {
      return response.data.data.body;
    }

    return [];
  } catch (error: unknown) {
    console.error('Error fetching payment methods:', error);
    throw error;
  }
}

/**
 * Fetch all payment receipt data in parallel
 * This is a convenience function that fetches all related data at once
 * Uses Promise.all for parallel execution and better performance
 */
export async function getPaymentReceiptData(
  location: string,
  paymentId: number | string
): Promise<{
  info: Awaited<ReturnType<typeof getPaymentReceiptInfo>>;
  lessons: PaginatedResponse<PaymentUsedLesson>;
  groupLessons: PaginatedResponse<PaymentGroupLesson>;
  invoices: PaginatedResponse<PaymentInvoice>;
  paymentMethods: PaymentMethod[];
}> {
  try {
    const [info, lessons, groupLessons, invoices, paymentMethods] = await Promise.all([
      getPaymentReceiptInfo(location, paymentId),
      getPaymentUsedLessons(location, paymentId, 1, -1), // Fetch all
      getPaymentGroupLessons(location, paymentId, 1, -1), // Fetch all
      getPaymentInvoices(location, paymentId, 1, -1), // Fetch all
      getPaymentMethods(location),
    ]);

    return {
      info,
      lessons,
      groupLessons,
      invoices,
      paymentMethods,
    };
  } catch (error: unknown) {
    console.error('Error fetching payment receipt data:', error);
    throw error;
  }
}
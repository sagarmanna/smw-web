import { apiClient } from '@/lib/api/client';

// InvoiceRow interface - matches API response structure directly
export interface InvoiceRow {
  id: number;
  number: string;
  date: string;
  customer: string;
  student: string;
  phone: string;
  status: string; // "Owing" | "Paid" | "Cancelled" | etc.
  total: number;
}

// InvoicesQuery interface for API queries
export interface InvoicesQuery {
  page?: number;
  limit?: number;
  number?: string;
  customer?: string;
  student?: string;
  phone?: string;
  status?: string;
  dateFrom?: string; // Date range filter for date
  dateTo?: string;
  sort?: "number" | "date" | "customer" | "student";
  order?: "asc" | "desc";
}

// API response structure
interface InvoicesListApiResponse {
  success: boolean;
  message: string;
  data: {
    body: InvoiceRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// InvoicesListResponse interface (internal representation)
export interface InvoicesListResponse {
  success: boolean;
  message: string;
  data: {
    body: InvoiceRow[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
} as const;

const FETCH_ALL_LIMIT = 99999;

// Helper to build query parameters - DRY principle
const buildInvoicesQueryParams = (query: InvoicesQuery): URLSearchParams => {
  const params = new URLSearchParams();

  if (query.page) params.append("page", query.page.toString());
  if (query.limit) {
    params.append(
      "limit",
      query.limit === -1 ? FETCH_ALL_LIMIT.toString() : query.limit.toString()
    );
  }
  if (query.number) params.append("number", query.number);
  if (query.customer) params.append("customer", query.customer);
  if (query.student) params.append("student", query.student);
  if (query.phone) params.append("phone", query.phone);
  if (query.status) params.append("status", query.status);
  if (query.dateFrom) params.append("dateFrom", query.dateFrom);
  if (query.dateTo) params.append("dateTo", query.dateTo);
  if (query.sort) {
    params.append("sort", query.sort);
    // Always include order when sort is provided
    // Use explicit order if provided, otherwise default to 'asc'
    const orderValue = query.order && query.order.trim() !== "" ? query.order : "asc";
    params.append("order", orderValue);
  }

  return params;
};

// Helper to create empty response - DRY principle
const createEmptyInvoicesResponse = (): InvoicesListResponse => ({
  success: false,
  message: "Failed to fetch invoices",
  data: {
    body: [],
    pagination: { ...DEFAULT_PAGINATION },
  },
});

export async function getInvoicesList(
  location: string,
  query: InvoicesQuery
): Promise<InvoicesListResponse> {
  try {
    const params = buildInvoicesQueryParams(query);

    const response = await apiClient.get<InvoicesListApiResponse>(
      `/admin/v2/${location}/user/list/invoice`,
      { params }
    );

    return {
      success: response.data.success,
      message: response.data.message,
      data: {
        body: response.data.data.body,
        pagination: response.data.data.pagination,
      },
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    const emptyResponse = createEmptyInvoicesResponse();
    emptyResponse.message =
      apiError.response?.data?.message || "Failed to fetch invoices";
    return emptyResponse;
  }
}


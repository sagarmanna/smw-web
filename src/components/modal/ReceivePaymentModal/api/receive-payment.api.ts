// api/receivePayment.Api.ts
import { apiClient } from '@/lib/api/client';
import { format } from 'date-fns';

// ==========================================
// INTERFACES
// ==========================================

export interface ReceivePaymentLesson {
  id: number;
  date: string;
  dueDate: string;
  studentName: string;
  programName: string;
  teacherName: string;
  total: string;
  balance: string;
  payments: string;
}

export interface ReceivePaymentGroupLesson {
  id: number;
  date: string;
  dueDate: string;
  studentName: string;
  programName: string;
  teacherName: string;
  total: string;
  balance: string;
  payments: string;
}

export interface ReceivePaymentLessonsResponse {
  success: boolean;
  message: string;
  data: {
    body: ReceivePaymentLesson[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ReceivePaymentGroupLessonsResponse {
  success: boolean;
  message: string;
  data: {
    body: ReceivePaymentGroupLesson[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ReceivePaymentInvoice {
  id: number;
  number: string;
  date: string;
  status: string;
  total: string;
  balance: string;
  payments: string;
}

export interface ReceivePaymentInvoicesResponse {
  success: boolean;
  message: string;
  data: {
    body: ReceivePaymentInvoice[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// NEW: Payment Credit Interface
export interface PaymentCredit {
  id: number;
  type: string;
  reference: string;
  amount: string;
  payment: string;
}

export interface PaymentCreditsResponse {
  success: boolean;
  message?: string;
  data: {
    body: PaymentCredit[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// NEW: Invoice Credit Interface
export interface InvoiceCredit {
  id: number;
  type: string;
  reference: string;
  amount: string;
  payment: string;
}

export interface InvoiceCreditsResponse {
  success: boolean;
  message?: string;
  data: {
    body: InvoiceCredit[];
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

export interface CustomerViewData {
  id: number;
  fullName: string;
}

export interface CustomerViewResponse {
  success: boolean;
  message: string;
  data: {
    body: CustomerViewData;
  };
}

// NEW: Customer List Interface
export interface Customer {
  id: number;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  allEmails: string;
  students: string;
  balance: string;
}

export interface CustomerListResponse {
  success: boolean;
  message: string;
  data: {
    body: Customer[];
    footer: {
      id: string;
      isActive: string;
      firstName: string;
      lastName: string;
      email: string;
      students: string;
      balance: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ==========================================
// API FUNCTIONS WITH PAGINATION SUPPORT
// ==========================================

/**
 * Fetch lessons for receive payment modal with pagination
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/receive-payment-lesson
 */
export async function getReceivePaymentLessons(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<{
  data: ReceivePaymentLesson[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit === -1 ? '99999' : limit.toString());

    // Optional date range filters (inclusive). When not provided, backend keeps
    // existing behaviour (only past-due lessons). When provided, backend
    // returns lessons whose dueDate falls within the requested range,
    // including future lessons.
    if (startDate) {
      params.append('startDate', format(startDate, 'yyyy-MM-dd'));
    }
    if (endDate) {
      params.append('endDate', format(endDate, 'yyyy-MM-dd'));
    }

    const response = await apiClient.get<ReceivePaymentLessonsResponse>(
      `/admin/v2/${location}/customers/${customerId}/receive-payment-lesson`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || {
          page: 1,
          limit: 10,
          total: response.data.data.body.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    console.error('Error fetching receive payment lessons:', error);
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Fetch group lessons for receive payment modal with pagination
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/receive-payment-group-lesson
 */
export async function getReceivePaymentGroupLessons(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10,
  startDate?: Date,
  endDate?: Date
): Promise<{
  data: ReceivePaymentGroupLesson[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit === -1 ? '99999' : limit.toString());

    if (startDate) {
      params.append('startDate', format(startDate, 'yyyy-MM-dd'));
    }
    if (endDate) {
      params.append('endDate', format(endDate, 'yyyy-MM-dd'));
    }

    const response = await apiClient.get<ReceivePaymentGroupLessonsResponse>(
      `/admin/v2/${location}/customers/${customerId}/receive-payment-group-lesson`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || {
          page: 1,
          limit: 10,
          total: response.data.data.body.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    console.error('Error fetching receive payment group lessons:', error);
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

/**
 * Fetch invoices for receive payment modal with pagination
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/receive-payment-invoice
 */
export async function getReceivePaymentInvoices(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: ReceivePaymentInvoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<ReceivePaymentInvoicesResponse>(
      `/admin/v2/${location}/customers/${customerId}/receive-payment-invoice`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || {
          page: 1,
          limit: 10,
          total: response.data.data.body.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    console.error('Error fetching receive payment invoices:', error);
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

/**
 * NEW: Fetch payment credits with pagination
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/payment-credits
 */
export async function getPaymentCredits(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: PaymentCredit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<PaymentCreditsResponse>(
      `/admin/v2/${location}/customers/${customerId}/payment-credits`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || {
          page: 1,
          limit: 10,
          total: response.data.data.body.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    console.error('Error fetching payment credits:', error);
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

/**
 * NEW: Fetch invoice credits with pagination
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/invoice-credits
 */
export async function getInvoiceCredits(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: InvoiceCredit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<InvoiceCreditsResponse>(
      `/admin/v2/${location}/customers/${customerId}/invoice-credits`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || {
          page: 1,
          limit: 10,
          total: response.data.data.body.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    console.error('Error fetching invoice credits:', error);
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
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
    return [];
  }
}

/**
 * Fetch customer view data (name, etc.)
 * Endpoint: GET /admin/v2/{location}/customers/{customerId}/customer-view
 * Only called when route contains "customer" keyword
 */
export async function getCustomerView(
  location: string,
  customerId: number
): Promise<CustomerViewData | null> {
  try {
    const response = await apiClient.get<CustomerViewResponse>(
      `/admin/v2/${location}/customers/${customerId}/customer-view`
    );

    if (response.data.success && response.data.data.body) {
      return response.data.data.body;
    }

    return null;
  } catch (error: unknown) {
    console.error('Error fetching customer view:', error);
    return null;
  }
}

/**
 * NEW: Fetch customers list for dropdown
 * Endpoint: GET /admin/v2/{location}/customers
 * Called when route does NOT contain "customer" keyword
 */
export async function getCustomersList(
  location: string,
  page: number = 1,
  limit: number = 1000,
  showActive: boolean = true,
  showInActive: boolean = false,
  order: 'asc' | 'desc' = 'asc'
): Promise<{
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  try {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    params.append('showActive', showActive.toString());
    params.append('showInActive', showInActive.toString());
    params.append('order', order);

    const response = await apiClient.get<CustomerListResponse>(
      `/admin/v2/${location}/customers`,
      { params }
    );

    if (response.data.success && response.data.data.body) {
      return {
        data: response.data.data.body,
        pagination: response.data.data.pagination || {
          page: 1,
          limit: 20,
          total: response.data.data.body.length,
          totalPages: 1,
        },
      };
    }

    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    console.error('Error fetching customers list:', error);
    return {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    };
  }
}

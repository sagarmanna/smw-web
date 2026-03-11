import { apiClient } from "@/lib/api/client";
import type { InvoiceDetail, InvoiceItem, InvoicePayment, InvoiceComment } from "@/app/[location]/invoices/types";
import { parseMoney, formatDateToISO } from "./invoices-details.utils";

// ---------------------------------------------
// Invoice Details API Response Types
// ---------------------------------------------

export interface InvoiceDetailsApiResponse {
  success: boolean;
  data: {
    body: InvoiceDetail;
  };
  message?: string;
}

// ---------------------------------------------
// Update Invoice Details API Types
// ---------------------------------------------

export interface UpdateInvoiceDetailsRequest {
  date?: string;
  status?: string;
  customer?: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
  };
  message?: string;
}

export interface UpdateInvoiceDetailsResponse {
  success: boolean;
  data: {
    id: number;
    date: string;
  };
  message?: string;
}

export interface UpdateInvoiceMessageRequest {
  message: string;
}

export interface CreateInvoiceMessageRequest {
  message: string;
}

export interface UpdateInvoiceMessageResponse {
  success: boolean;
  data: {
    id: number;
    message: string;
  };
  message?: string;
}

export type CreateInvoiceMessageResponse = UpdateInvoiceMessageResponse;

export interface CreateInvoiceWalkInRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface CreateInvoiceWalkInResponse {
  success: boolean;
  data?: {
    body?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      customerId?: number;
    };
    id?: number;
    customerId?: number;
    customerName?: string;
    email?: string;
    type?: number;
  };
  errorCode?: string;
  message?: string;
}

export interface AssignInvoiceCustomerRequest {
  customerId: number;
}

export interface AssignInvoiceCustomerResponse {
  success: boolean;
  data?: {
    id?: number;
    customerId?: number;
    customerName?: string;
    email?: string;
    phoneNumber?: string;
    type?: number;
  };
  errorCode?: string;
  message?: string;
}

// ---------------------------------------------
// Adjust Tax API Types
// ---------------------------------------------

export interface AdjustInvoiceTaxResponse {
  success: boolean;
  data: {
    body: {
      id: number;
      tax: number | string;
      total: number | string;
      balance: number | string;
    };
  };
  message?: string;
}

export interface AddInvoiceLineItemRequest {
  itemId: number;
}

export interface AddInvoiceLineItemResponse {
  success: boolean;
  data: {
    id: number;
  };
  message?: string;
}

export interface UpdateInvoiceLineItemRequest {
  description: string;
  amount: number;
  unit: number;
  cost: number;
  royaltyFree: number;
}

export interface UpdateInvoiceLineItemResponse {
  success: boolean;
  data: {
    id: number;
  };
  message?: string;
}

export interface DeleteInvoiceLineItemResponse {
  success: boolean;
  data: {
    id: number;
  };
  message?: string;
}

export interface EditInvoiceItemsTaxRequest {
  lineItemIds: number[];
  taxStatus: string;
}

export interface InvoiceItemsTaxStatusOption {
  id: number;
  name: string;
  rate: number;
}

export interface GetInvoiceItemsTaxEditConfigResponse {
  success: boolean;
  data: {
    currentTaxStatus: string;
    currentTaxRate: number;
    availableTaxStatuses: InvoiceItemsTaxStatusOption[];
  };
  message?: string;
}

export type InvoiceItemsTaxEditConfigData = GetInvoiceItemsTaxEditConfigResponse["data"];

export interface EditInvoiceItemsTaxResponse {
  success: boolean;
  data: {
    updatedCount: number;
    taxRate: number;
  };
  message?: string;
}

type EditInvoiceItemsTaxBackendResponse = {
  success: boolean;
  data?: {
    updatedCount?: number;
    taxRate?: number | string;
    body?: {
      updatedCount?: number;
      taxRate?: number | string;
    };
  };
  message?: string;
};

type GetInvoiceItemsTaxEditConfigBackendResponse = {
  success: boolean;
  data?: {
    currentTaxStatus?: string;
    currentTaxRate?: number | string;
    availableTaxStatuses?: Array<{
      id?: number | string;
      name?: string;
      rate?: number | string;
    }>;
  };
  message?: string;
};
export interface InvoiceLineItemsDiscountValues {
  lineItemIds?: number[];
  lineItemDiscount?: number | string | null;
  lineItemDiscountValueType?: number;
  customerDiscount?: number | string | null;
  paymentFrequencyDiscount?: number | string | null;
  multiEnrolmentDiscount?: number | string | null;
  isLessonItem?: boolean;
}

export interface GetInvoiceLineItemsDiscountResponse {
  success: boolean;
  data: InvoiceLineItemsDiscountValues & {
    body?: InvoiceLineItemsDiscountValues;
  };
  message?: string;
}

export interface UpdateInvoiceLineItemsDiscountRequest {
  lineItemIds: number[];
  lineItemDiscount?: number;
  lineItemDiscountValueType?: 0 | 1;
  customerDiscount?: number;
  paymentFrequencyDiscount?: number;
  multiEnrolmentDiscount?: number;
}

export interface UpdateInvoiceLineItemsDiscountResponse {
  success: boolean;
  data?: {
    lineItemIds?: number[];
  };
  message?: string;
}

export function extractInvoiceLineItemsDiscountValues(
  response: GetInvoiceLineItemsDiscountResponse | null | undefined
): InvoiceLineItemsDiscountValues | null {
  if (!response?.success || !response.data) {
    return null;
  }

  return response.data.body ?? response.data;
}

export interface VoidInvoiceResponse {
  success: boolean;
  data?: {
    status?: boolean;
  };
  message?: string;
}

export interface InvoicePrintDataResponse {
  success: boolean;
  data: {
    invoice: {
      id: number;
      number: string;
      date: string;
      status: string;
      type: string;
      notes: string;
      reminderNotes: string;
    };
    customer: {
      id: number;
      name: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      phone: string;
      email: string;
    };
    location: {
      name: string;
      address: string;
      city: string;
      province: string;
      postalCode: string;
      phone: string;
      email: string;
      hstRegistrationNo: string;
    };
    lineItems: Array<{
      id: number;
      code: string;
      description: string;
      qty: number;
      price: string;
      unitPrice: string;
      tax: string;
    }>;
    payments: Array<{
      date: string;
      type: string;
      reference: string;
      notes: string;
      amount: string;
    }>;
    totals: {
      discount: string;
      subTotal: string;
      tax: string;
      total: string;
      paid: string;
      balance: string;
    };
  };
  message?: string;
}

type InvoiceDetailsBackendBody = {
  invoice?: {
    id?: number;
    number?: string;
    date?: string;
    status?: string;
  };
  customer?: {
    customerId?: number;
    customerName?: string;
    phoneNumber?: string;
    email?: string;
    type?: number;
    customerType?: number;
  };
  payments?: InvoiceDetail["payments"];
  message?: string;
  comments?: InvoiceDetail["comments"];
  history?: InvoiceDetail["history"];
};

type InvoiceDetailsBackendResponse = {
  success: boolean;
  data?: {
    body?: InvoiceDetailsBackendBody;
  };
  message?: string;
};

type InvoiceItemsBackendResponse = {
  success: boolean;
  data?: {
    body?: {
      lineItems?: Array<{
        id?: number | string;
        code?: string;
        itemCode?: string;
        royaltyFree?: string;
        description?: string;
        qty?: number | string;
        discount?: number | string;
        taxStatus?: string;
        tax?: number | string;
        unitPrice?: number | string;
        cost?: number | string;
        price?: number | string; // e.g. "$26.68"
      }>;
    };
  };
  message?: string;
};

type InvoiceTotalsBackendResponse = {
  success: boolean;
  data?: {
    body?: {
      discounts?: number | string; // e.g. "$2.08"
      subTotal?: number | string;  // e.g. "$26.68"
      tax?: number | string;       // e.g. "$0.00"
      total?: number | string;     // e.g. "$26.68"
      paid?: number | string;      // e.g. "$0.00"
      balance?: number | string;   // e.g. "$26.68"
    };
  };
  message?: string;
};

type InvoiceMessageBackendResponse = {
  success: boolean;
  data?: {
    body?: {
      id?: number;
      message?: string;
    };
  };
  message?: string;
};

type InvoicePaymentsBackendResponse = {
  success: boolean;
  data?: {
    body?: InvoicePayment[];
  };
  message?: string;
};

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type PaginatedListResponse<T> = {
  success: boolean;
  data: { body: T[]; pagination?: PaginationInfo };
  message?: string;
};

export interface InvoiceCommentsApiResponse {
  success: boolean;
  data: {
    body: InvoiceComment[];
    pagination?: PaginationInfo;
  };
  message?: string;
}

export interface InvoiceHistoryResponseBody {
  id: number;
  createdOn: string;
  message: string;
}

export interface InvoiceHistoryApiResponse {
  success: boolean;
  data: {
    body: InvoiceHistoryResponseBody[];
    pagination?: PaginationInfo;
  };
  message?: string;
}

type InvoiceDetailsUpdateResponse = {
  success: boolean;
  data: { body: { id: number; date: string } };
  message?: string;
};

type ApiErrorShape = {
  response?: {
    data?: {
      message?: string;
      success?: boolean;
    };
  };
};

type LineItemMutationFailure = {
  success: false;
  data: { id: number };
  message: string;
};

// ---------------------------------------------
// Internal Transformation Helpers
// ---------------------------------------------

function normalizeLineItems(itemsResponse: InvoiceItemsBackendResponse | undefined): InvoiceItem[] {
  const lineItems = itemsResponse?.data?.body?.lineItems ?? [];
  const normalized: InvoiceItem[] = [];

  for (const li of lineItems) {
    if (!li || (li.id === undefined && !li.description)) continue;

    const qty = parseMoney(li.qty);
    const price = parseMoney(li.price);
    const backendUnitPrice = parseMoney(li.unitPrice);
    const unitPrice = backendUnitPrice > 0 ? backendUnitPrice : qty !== 0 ? price / qty : price;

    normalized.push({
      id: li.id !== undefined ? String(li.id) : `${Date.now()}`,
      code: li.code ?? li.itemCode ?? "",
      royalty: li.royaltyFree ?? "No",
      description: li.description ?? "",
      qty,
      discount: parseMoney(li.discount),
      taxStatus: li.taxStatus ?? "",
      tax: parseMoney(li.tax),
      price,
      unitPrice,
      cost: parseMoney(li.cost),
    });
  }

  return normalized;
}

function normalizeTotals(
  totalsResponse: InvoiceTotalsBackendResponse | undefined,
  items: InvoiceItem[]
): InvoiceDetail["totals"] {
  const body = totalsResponse?.data?.body;
  if (body) {
    return {
      discounts: parseMoney(body.discounts),
      subtotal: parseMoney(body.subTotal),
      tax: parseMoney(body.tax),
      total: parseMoney(body.total),
      paid: parseMoney(body.paid),
      balance: parseMoney(body.balance),
    };
  }

  // Fallback: compute from items if totals endpoint unavailable
  const subtotal = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const discounts = items.reduce((sum, item) => sum + (item.discount || 0), 0);
  const tax = 0;
  const paid = 0;
  const total = subtotal + tax;
  const balance = total - paid;
  return { discounts, subtotal, tax, total, paid, balance };
}

function buildInvoiceDetail(params: {
  detailsBody: InvoiceDetailsBackendBody | undefined;
  invoiceId: number;
  itemsResponse?: InvoiceItemsBackendResponse;
  totalsResponse?: InvoiceTotalsBackendResponse;
  messageResponse?: InvoiceMessageBackendResponse;
  paymentsResponse?: InvoicePaymentsBackendResponse;
}): InvoiceDetail {
  const { detailsBody, invoiceId, itemsResponse, totalsResponse, messageResponse, paymentsResponse } = params;
  const invoice = detailsBody?.invoice;
  const customer = detailsBody?.customer;

  const parsedCustomerTypeRaw = customer?.type ?? customer?.customerType;
  const parsedCustomerType = Number(parsedCustomerTypeRaw);

  const items = normalizeLineItems(itemsResponse);
  const totals = normalizeTotals(totalsResponse, items);

  return {
    id: invoice?.id ?? invoiceId,
    number: invoice?.number ?? `Invoice #${invoiceId}`,
    date: invoice?.date ?? "",
    status: (invoice?.status ?? "Owing") as InvoiceDetail["status"],
    customer: {
      customerId: customer?.customerId,
      name: customer?.customerName ?? "",
      phone: customer?.phoneNumber ?? "",
      email: customer?.email ?? "",
      type: parsedCustomerType === 1 ? 1 : parsedCustomerType === 2 ? 2 : undefined,
    },
    items,
    payments: paymentsResponse?.data?.body ?? detailsBody?.payments ?? [],
    totals,
    message: messageResponse?.data?.body?.message ?? detailsBody?.message ?? "",
    comments: detailsBody?.comments ?? [],
    history: detailsBody?.history ?? [],
  };
}

// ---------------------------------------------
// Shared Fetch Helper
// ---------------------------------------------

async function fetchPaginatedList<T>(
  url: string,
  params: Record<string, string | number | boolean>,
  entityName: string
): Promise<PaginatedListResponse<T>> {
  try {
    const response = await apiClient.get<PaginatedListResponse<T>>(url, { params });

    if (!response.data.success) {
      return response.data;
    }

    if (!response.data.data?.body) {
      console.warn(`Invoice ${entityName} API returned no body:`, response.data);
      return response.data;
    }

    return response.data;
  } catch (error: unknown) {
    const errorMessage = getApiErrorMessage(error, `Failed to fetch invoice ${entityName}`);
    return {
      success: false,
      data: { body: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
      message: errorMessage,
    };
  }
}

function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  const apiError = error as ApiErrorShape;
  return apiError.response?.data?.message || fallbackMessage;
}

function createLineItemFailureResponse(id: number, fallbackMessage: string, error: unknown): LineItemMutationFailure {
  return {
    success: false,
    data: { id },
    message: getApiErrorMessage(error, fallbackMessage),
  };
}

// ---------------------------------------------
// API Functions
// ---------------------------------------------

/**
 * Fetches detailed invoice information.
 *
 * Endpoint: `GET /admin/v2/${location}/invoices/details/${invoiceId}`
 */
export async function getInvoiceDetails(
  location: string,
  invoiceId: number
): Promise<InvoiceDetailsApiResponse | null> {
  try {
    const [detailsRes, itemsRes, totalsRes, messageRes, paymentsRes] = await Promise.allSettled([
      apiClient.get<InvoiceDetailsBackendResponse>(
        `/admin/v2/${location}/invoices/details/${invoiceId}`
      ),
      apiClient.get<InvoiceItemsBackendResponse>(
        `/admin/v2/${location}/invoices/items/${invoiceId}`,
        { params: { enable: true } }
      ),
      apiClient.get<InvoiceTotalsBackendResponse>(
        `/admin/v2/${location}/invoices/${invoiceId}/totals`
      ),
      apiClient.get<InvoiceMessageBackendResponse>(
        `/admin/v2/${location}/invoices/message/${invoiceId}`
      ),
      apiClient.get<InvoicePaymentsBackendResponse>(
        `/admin/v2/${location}/invoices/payments/${invoiceId}`
      ),
    ]);

    if (detailsRes.status === "rejected") {
      throw detailsRes.reason;
    }

    const detail = buildInvoiceDetail({
      detailsBody: detailsRes.value.data?.data?.body,
      invoiceId,
      itemsResponse: itemsRes.status === "fulfilled" ? itemsRes.value.data : undefined,
      totalsResponse: totalsRes.status === "fulfilled" ? totalsRes.value.data : undefined,
      messageResponse: messageRes.status === "fulfilled" ? messageRes.value.data : undefined,
      paymentsResponse: paymentsRes.status === "fulfilled" ? paymentsRes.value.data : undefined,
    });

    return {
      success: detailsRes.value.data.success,
      data: { body: detail },
      message: detailsRes.value.data.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: { body: {} as InvoiceDetail },
      message: getApiErrorMessage(error, "Failed to fetch invoice details"),
    };
  }
}

/**
 * Fetches invoice history from the API with pagination.
 *
 * Endpoint: GET /admin/v2/{location}/history?type=invoice&id={invoiceId}&page={page}
 */
export async function getInvoiceHistory(
  location: string,
  invoiceId: number,
  page: number = 1
): Promise<InvoiceHistoryApiResponse | null> {
  return fetchPaginatedList<InvoiceHistoryResponseBody>(
    `/admin/v2/${location}/history`,
    { type: "invoice", id: invoiceId, page },
    "history"
  );
}

/**
 * Fetches invoice comments from the API with pagination.
 *
 * Endpoint: GET /admin/v2/{location}/comments?id={invoiceId}&type=invoice&page={page}&limit=20
 */
export async function getInvoiceComments(
  location: string,
  invoiceId: number,
  page: number = 1
): Promise<InvoiceCommentsApiResponse | null> {
  try {
    const response = await apiClient.get<InvoiceCommentsApiResponse>(
      `/admin/v2/${location}/comments`,
      {
        params: {
          id: invoiceId,
          type: "invoice",
          page,
          limit: 20,
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      data: {
        body: [],
        pagination: { page, limit: 20, total: 0, totalPages: 0 },
      },
      message: getApiErrorMessage(error, "Failed to fetch invoice comments"),
    };
  }
}

/**
 * Updates invoice details.
 *
 * Endpoint: `PUT /admin/v2/${location}/invoices/details/${invoiceId}`
 */
export async function updateInvoiceDetails(
  location: string,
  invoiceId: number,
  data: UpdateInvoiceDetailsRequest
): Promise<UpdateInvoiceDetailsResponse | null> {
  try {
    const payload = {
      ...(data.date !== undefined && { date: formatDateToISO(data.date) }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.customer && {
        customer: {
          customerId: data.customer.customerId,
          customerName: data.customer.name,
          phoneNumber: data.customer.phone,
          email: data.customer.email,
        },
      }),
      ...(data.message !== undefined && { message: data.message }),
    };

    const response = await apiClient.put<InvoiceDetailsUpdateResponse>(
      `/admin/v2/${location}/invoices/details/${invoiceId}`,
      payload
    );

    return {
      success: response.data.success,
      data: response.data.data.body,
      message: response.data.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: { id: invoiceId, date: "" },
      message: getApiErrorMessage(error, "Failed to update invoice details"),
    };
  }
}

async function saveInvoiceMessage(
  location: string,
  invoiceId: number,
  data: { message: string },
  method: "post" | "put",
  fallbackMessage: string
): Promise<UpdateInvoiceMessageResponse | null> {
  try {
    const response = await apiClient[method]<UpdateInvoiceMessageResponse>(
      `/admin/v2/${location}/invoices/message/${invoiceId}`,
      { message: data.message }
    );

    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      data: { id: invoiceId, message: data.message },
      message: getApiErrorMessage(error, fallbackMessage),
    };
  }
}

/**
 * Creates invoice message.
 *
 * Endpoint: `POST /admin/v2/${location}/invoices/message/${invoiceId}`
 */
export async function createInvoiceMessage(
  location: string,
  invoiceId: number,
  data: CreateInvoiceMessageRequest
): Promise<CreateInvoiceMessageResponse | null> {
  return saveInvoiceMessage(
    location,
    invoiceId,
    data,
    "post",
    "Failed to create invoice message"
  );
}

/**
 * Updates invoice message.
 *
 * Endpoint: `PUT /admin/v2/${location}/invoices/message/${invoiceId}`
 */
export async function updateInvoiceMessage(
  location: string,
  invoiceId: number,
  data: UpdateInvoiceMessageRequest
): Promise<UpdateInvoiceMessageResponse | null> {
  return saveInvoiceMessage(
    location,
    invoiceId,
    data,
    "put",
    "Failed to update invoice message"
  );
}

/**
 * Adjusts the tax amount for an invoice on the server.
 *
 * Endpoint: PUT /admin/v2/${location}/invoices/adjust-tax/{invoiceId}
 *
 * Body: { taxAdjusted: number } – the new tax amount to set on the invoice
 *
 * Returns the updated totals for the invoice (tax, total, balance).
 */
export async function adjustInvoiceTax(
  location: string,
  invoiceId: number,
  taxAdjusted: number
): Promise<AdjustInvoiceTaxResponse | null> {
  try {
    const response = await apiClient.put<AdjustInvoiceTaxResponse>(
      `/admin/v2/${location}/invoices/adjust-tax/${invoiceId}`,
      { taxAdjusted }
    );

    return response.data;
  } catch (error: unknown) {
    console.error("adjustInvoiceTax API error:", error);
    return null;
  }
}

export async function createInvoiceWalkIn(
  location: string,
  invoiceId: number,
  payload: CreateInvoiceWalkInRequest
): Promise<CreateInvoiceWalkInResponse | null> {
  return saveInvoiceWalkIn(location, invoiceId, payload, "post");
}

export async function updateInvoiceWalkIn(
  location: string,
  invoiceId: number,
  payload: CreateInvoiceWalkInRequest
): Promise<CreateInvoiceWalkInResponse | null> {
  return saveInvoiceWalkIn(location, invoiceId, payload, "put");
}

async function saveInvoiceWalkIn(
  location: string,
  invoiceId: number,
  payload: CreateInvoiceWalkInRequest,
  method: "post" | "put"
): Promise<CreateInvoiceWalkInResponse | null> {
  try {
    const response = await apiClient[method]<CreateInvoiceWalkInResponse>(
      `/admin/v2/${location}/invoices/${invoiceId}/walkin`,
      {
        firstName: payload.firstName,
        lastName: payload.lastName,
        email: payload.email,
      }
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      errorCode: apiError.response?.data?.errorCode,
      message: apiError.response?.data?.message || (method === "put" ? "Failed to update walk-in customer" : "Failed to add walk-in customer"),
    };
  }
}

export async function assignInvoiceCustomer(
  location: string,
  invoiceId: number,
  payload: AssignInvoiceCustomerRequest
): Promise<AssignInvoiceCustomerResponse | null> {
  try {
    const response = await apiClient.put<AssignInvoiceCustomerResponse>(
      `/admin/v2/${location}/invoices/${invoiceId}/customer`,
      {
        customerId: payload.customerId,
      }
    );
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    return {
      success: false,
      errorCode: apiError.response?.data?.errorCode,
      message: apiError.response?.data?.message || "Failed to assign customer to invoice",
    };
}
}
/**
 * Adds a catalog item as an invoice line item.
 *
 * Endpoint: POST /admin/v2/${location}/invoices/${invoiceId}/line-items
 *
 * Body: { itemId: number }
 */
export async function addInvoiceLineItem(
  location: string,
  invoiceId: number,
  payload: AddInvoiceLineItemRequest
): Promise<AddInvoiceLineItemResponse | null> {
  try {
    const response = await apiClient.post<AddInvoiceLineItemResponse>(
      `/admin/v2/${location}/invoices/${invoiceId}/line-items`,
      payload
    );

    return response.data;
  } catch (error: unknown) {
    return createLineItemFailureResponse(0, "Failed to add line item", error);
  }
}

/**
 * Updates an existing invoice line item.
 *
 * Endpoint: PUT /admin/v2/${location}/invoices/line-items/${lineItemId}
 */
export async function updateInvoiceLineItem(
  location: string,
  lineItemId: number,
  payload: UpdateInvoiceLineItemRequest
): Promise<UpdateInvoiceLineItemResponse | null> {
  try {
    const response = await apiClient.put<UpdateInvoiceLineItemResponse>(
      `/admin/v2/${location}/invoices/line-items/${lineItemId}`,
      payload
    );

    return response.data;
  } catch (error: unknown) {
    return createLineItemFailureResponse(lineItemId, "Failed to update line item", error);
  }
}

/**
 * Deletes an invoice line item.
 *
 * Endpoint: DELETE /admin/v2/${location}/invoices/line-items/${lineItemId}
 */
export async function deleteInvoiceLineItem(
  location: string,
  lineItemId: number
): Promise<DeleteInvoiceLineItemResponse | null> {
  try {
    const response = await apiClient.delete<DeleteInvoiceLineItemResponse>(
      `/admin/v2/${location}/invoices/line-items/${lineItemId}`
    );

    return response.data;
  } catch (error: unknown) {
    return createLineItemFailureResponse(lineItemId, "Failed to delete line item", error);
  }
}

/**
 * Bulk updates tax status for invoice line items.
 *
 * Endpoint: PUT /admin/v2/${location}/invoices/line-items/edit-tax
 * Body: { lineItemIds: number[], taxStatus: string }
 */
export async function editInvoiceItemsTax(
  location: string,
  payload: EditInvoiceItemsTaxRequest
): Promise<EditInvoiceItemsTaxResponse | null> {
  try {
    const response = await apiClient.put<EditInvoiceItemsTaxBackendResponse>(
      `/admin/v2/${location}/invoices/line-items/edit-tax`,
      payload
    );

    const responseData = response.data?.data;
    const body = responseData?.body;
    const updatedCount = Number(body?.updatedCount ?? responseData?.updatedCount ?? 0);
    const taxRate = Number(body?.taxRate ?? responseData?.taxRate ?? 0);

    return {
      success: response.data.success,
      data: {
        updatedCount: Number.isFinite(updatedCount) ? updatedCount : 0,
        taxRate: Number.isFinite(taxRate) ? taxRate : 0,
      },
      message: response.data.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: {
        updatedCount: 0,
        taxRate: 0,
      },
      message: getApiErrorMessage(error, "Failed to update item tax"),
    };
  }
}

/**
 * Fetches available tax statuses and current tax selection for selected invoice line items.
 *
 * Endpoint: GET /admin/v2/${location}/invoices/line-items/edit-tax?lineItemIds=1&lineItemIds=2
 */
export async function getInvoiceItemsTaxEditConfig(
  location: string,
  lineItemIds: number[]
): Promise<GetInvoiceItemsTaxEditConfigResponse | null> {
  try {
    const searchParams = new URLSearchParams();
    lineItemIds.forEach((id) => {
      searchParams.append("lineItemIds", String(id));
    });

    const response = await apiClient.get<GetInvoiceItemsTaxEditConfigBackendResponse>(
      `/admin/v2/${location}/invoices/line-items/edit-tax?${searchParams.toString()}`
    );

    const responseData = response.data?.data;
    const rawOptions = responseData?.availableTaxStatuses ?? [];

    return {
      success: response.data.success,
      data: {
        currentTaxStatus: responseData?.currentTaxStatus ?? "Default",
        currentTaxRate: Number(responseData?.currentTaxRate ?? 0) || 0,
        availableTaxStatuses: rawOptions
          .map((option) => ({
            id: Number(option.id),
            name: (option.name || "").trim(),
            rate: Number(option.rate ?? 0) || 0,
          }))
          .filter((option) => Number.isFinite(option.id) && option.name.length > 0),
      },
      message: response.data.message,
    };
  } catch (error: unknown) {
    return {
      success: false,
      data: {
        currentTaxStatus: "Default",
        currentTaxRate: 0,
        availableTaxStatuses: [],
      },
      message: getApiErrorMessage(error, "Failed to load tax settings"),
    };
  }
}

/**
 * Fetches discount values for selected invoice line items.
 *
 * Endpoint: GET /admin/v2/${location}/invoices/line-items/discount?ids=1,2,3
 */
export async function getInvoiceLineItemsDiscount(
  location: string,
  ids: number[]
): Promise<GetInvoiceLineItemsDiscountResponse | null> {
  try {
    const params = new URLSearchParams();
    params.set("ids", ids.join(","));

    const response = await apiClient.get<GetInvoiceLineItemsDiscountResponse>(
      `/admin/v2/${location}/invoices/line-items/discount`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      data: {},
      message: getApiErrorMessage(error, "Failed to fetch discount values"),
    };
  }
}

/**
 * Updates discount values for selected invoice line items.
 *
 * Endpoint: PUT /admin/v2/${location}/invoices/line-items/discount
 */
export async function updateInvoiceLineItemsDiscount(
  location: string,
  payload: UpdateInvoiceLineItemsDiscountRequest
): Promise<UpdateInvoiceLineItemsDiscountResponse | null> {
  try {
    const response = await apiClient.put<UpdateInvoiceLineItemsDiscountResponse>(
      `/admin/v2/${location}/invoices/line-items/discount`,
      payload
    );

    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to update discount values"),
    };
  }
}

/**
 * Voids an invoice.
 *
 * Endpoint: POST /admin/v2/${location}/invoices/${invoiceId}/void
 */
export async function voidInvoice(
  location: string,
  invoiceId: number,
  canBeUnscheduled: boolean = true
): Promise<VoidInvoiceResponse | null> {
  try {
    const response = await apiClient.post<VoidInvoiceResponse>(
      `/admin/v2/${location}/invoices/${invoiceId}/void`,
      { canBeUnscheduled }
    );
    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      message: getApiErrorMessage(error, "Failed to void invoice"),
    };
  }
}

export async function getInvoicePrintData(
  location: string,
  invoiceId: number
): Promise<InvoicePrintDataResponse | null> {
  try {
    const response = await apiClient.get<InvoicePrintDataResponse>(
      `/admin/v2/${location}/invoices/${invoiceId}/print`
    );

    return response.data;
  } catch (error: unknown) {
    return {
      success: false,
      data: {
        invoice: {
          id: invoiceId,
          number: "",
          date: "",
          status: "",
          type: "Invoice",
          notes: "",
          reminderNotes: "",
        },
        customer: {
          id: 0,
          name: "",
          address: "",
          city: "",
          province: "",
          postalCode: "",
          phone: "",
          email: "",
        },
        location: {
          name: "",
          address: "",
          city: "",
          province: "",
          postalCode: "",
          phone: "",
          email: "",
          hstRegistrationNo: "",
        },
        lineItems: [],
        payments: [],
        totals: {
          discount: "$0.00",
          subTotal: "$0.00",
          tax: "$0.00",
          total: "$0.00",
          paid: "$0.00",
          balance: "$0.00",
        },
      },
      message: getApiErrorMessage(error, "Failed to fetch invoice print data"),
    };
  }
}

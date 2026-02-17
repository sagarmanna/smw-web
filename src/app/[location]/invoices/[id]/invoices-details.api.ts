import { apiClient } from "@/lib/api/client";
import type { InvoiceDetail, InvoiceItem } from "@/app/[location]/invoices/types";

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
  data: InvoiceDetail;
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
  };
  // If backend adds these later, we will pass through.
  items?: InvoiceDetail["items"];
  payments?: InvoiceDetail["payments"];
  totals?: Partial<InvoiceDetail["totals"]>;
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
        description?: string;
        qty?: number | string;
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
      subTotal?: number | string; // e.g. "$26.68"
      tax?: number | string; // e.g. "$0.00"
      total?: number | string; // e.g. "$26.68"
      paid?: number | string; // e.g. "$0.00"
      balance?: number | string; // e.g. "$26.68"
    };
  };
  message?: string;
};

function parseMoney(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value !== "string") return 0;
  const cleaned = value.replace(/[$,]/g, "").trim();
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLineItems(itemsResponse: InvoiceItemsBackendResponse | undefined): InvoiceItem[] {
  const lineItems = itemsResponse?.data?.body?.lineItems ?? [];
  const normalized: InvoiceItem[] = [];

  for (const li of lineItems) {
    if (!li || (li.id === undefined && !li.description)) continue;

    const qty = parseMoney(li.qty);
    const price = parseMoney(li.price);
    const unitPrice = qty !== 0 ? price / qty : price;

    normalized.push({
      id: li.id !== undefined ? String(li.id) : `${Date.now()}`,
      description: li.description ?? "",
      qty,
      price,
      unitPrice,
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
}): InvoiceDetail {
  const { detailsBody, invoiceId, itemsResponse, totalsResponse } = params;
  const invoice = detailsBody?.invoice;
  const customer = detailsBody?.customer;

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
    },
    items,
    payments: detailsBody?.payments ?? [],
    totals,
    message: detailsBody?.message ?? "",
    comments: detailsBody?.comments ?? [],
    history: detailsBody?.history ?? [],
  };
}

/**
 * Fetches detailed invoice information.
 *
 * Backend endpoint (as per Postman screenshot):
 * `GET /admin/v2/${location}/invoices/details/${invoiceId}`
 * 
 * @param location - The location identifier
 * @param invoiceId - The invoice ID
 * @returns Promise resolving to the invoice details response
 */
export async function getInvoiceDetails(
  location: string,
  invoiceId: number
): Promise<InvoiceDetailsApiResponse | null> {
  try {
    const [detailsRes, itemsRes, totalsRes] = await Promise.allSettled([
      apiClient.get<InvoiceDetailsBackendResponse>(
        `/admin/v2/${location}/invoices/details/${invoiceId}`
      ),
      apiClient.get<InvoiceItemsBackendResponse>(
        `/admin/v2/${location}/invoices/items/${invoiceId}`,
        // Based on Postman screenshot query param
        { params: { enable: false } }
      ),
      apiClient.get<InvoiceTotalsBackendResponse>(
        `/admin/v2/${location}/invoices/${invoiceId}/totals`
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
    });

    return {
      success: detailsRes.value.data.success,
      data: { body: detail },
      message: detailsRes.value.data.message,
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {
        body: {} as InvoiceDetail,
      },
      message: apiError.response?.data?.message || "Failed to fetch invoice details",
    };
  }
}

/**
 * Updates invoice information.
 *
 * NOTE: Backend contract may differ; this uses the most likely endpoint:
 * `PUT /admin/v2/${location}/invoices/details/${invoiceId}`
 * 
 * @param location - The location identifier
 * @param invoiceId - The invoice ID
 * @param data - The invoice data to update
 * @returns Promise resolving to the update response
 */
export async function updateInvoiceDetails(
  location: string,
  invoiceId: number,
  data: UpdateInvoiceDetailsRequest
): Promise<UpdateInvoiceDetailsResponse | null> {
  try {
    const response = await apiClient.put<InvoiceDetailsBackendResponse>(
      `/admin/v2/${location}/invoices/details/${invoiceId}`,
      data
    );

    const detail = buildInvoiceDetail({
      detailsBody: response.data.data?.body,
      invoiceId,
    });

    return {
      success: response.data.success,
      data: detail,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      data: {} as InvoiceDetail,
      message: apiError.response?.data?.message || "Failed to update invoice details",
    };
  }
}


import { apiClient } from "@/lib/api/client";

export interface SalesRow {
  itemCategory: string;
  subtotal: number;
  tax: number;
  total: number;
}

export interface PaymentsRow {
  paymentMethod: string;
  subtotal: number;
}

export interface SalesFooter {
  subtotal: number;
  tax: number;
  total: number;
}

export interface PaymentsFooter {
  subtotal: number;
}

export interface SalesApiResponse {
  success: boolean;
  data: SalesRow[];
  message?: string;
  footer?: SalesFooter;
  meta?: { startDate?: string; endDate?: string; location?: string };
}

export interface PaymentsApiResponse {
  success: boolean;
  data: PaymentsRow[];
  message?: string;
  footer?: PaymentsFooter;
  meta?: { startDate?: string; endDate?: string; location?: string };
}

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value)
    .replace(/[$,]/g, "")
    .trim();
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
};

const ensureArray = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return [data];
  return [];
};

const extractBodyArray = (responseData: unknown): unknown[] => {
  const d = responseData as Record<string, unknown>;
  if (Array.isArray(d)) return d;
  if (d?.data && typeof d.data === 'object' && d.data !== null) {
    const dataObj = d.data as Record<string, unknown>;
    if (Array.isArray(dataObj.body)) return dataObj.body;
    if (Array.isArray(dataObj.results)) return dataObj.results;
    if (Array.isArray(dataObj.items)) return dataObj.items;
    if (Array.isArray(dataObj.data)) return dataObj.data;
  }
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.body)) return d.body;
  return ensureArray(d);
};

export async function getSales(
  location: string,
  startDate: string,
  endDate: string
): Promise<SalesApiResponse> {
  try {
    const url = `/admin/v2/${location}/report/sales`;
    const params = { startDate, endDate };

    const response = await apiClient.get(url, { params });

    const body = extractBodyArray(response.data);
    const rows = body.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      const subtotal = toNumber(
        r.subtotal ?? r.Subtotal ?? r.SUBTOTAL ?? r.total_without_tax ?? r.sub_total
      );
      const tax = toNumber(r.tax ?? r.Tax ?? r.TAX ?? r.total_tax);
      const total = toNumber(r.total ?? r.Total ?? r.TOTAL ?? r.grand_total);
      return {
        itemCategory:
          r.itemCategory ?? r.itemCategoryName ?? r.ItemCategory ?? r["Item Category"] ?? r.category ?? r.Category ?? "",
        subtotal,
        tax,
        total: total || subtotal + tax,
      } as SalesRow;
    });

    // extract footer totals if provided
    let footer: SalesFooter | undefined;
    const d = response.data as Record<string, unknown>;
    let f: unknown;
    if (d?.data && typeof d.data === 'object' && d.data !== null) {
      const dataObj = d.data as Record<string, unknown>;
      f = dataObj.footer;
    } else {
      f = d?.footer;
    }
    if (Array.isArray(f) && f.length > 0) {
      const footerData = f[0] as Record<string, unknown>;
      footer = {
        subtotal: toNumber(footerData.subtotal),
        tax: toNumber(footerData.tax),
        total: toNumber(footerData.total),
      };
    }

    let meta: unknown;
    if (d?.data && typeof d.data === 'object' && d.data !== null) {
      const dataObj = d.data as Record<string, unknown>;
      meta = dataObj.meta;
    } else {
      meta = d?.meta;
    }

    return { success: true, data: rows, footer, meta: meta as { startDate?: string; endDate?: string; location?: string } | undefined };
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; statusText?: string; data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message:
        apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch sales",
    };
  }
}

export async function getPayments(
  location: string,
  startDate: string,
  endDate: string
): Promise<PaymentsApiResponse> {
  try {
    const url = `/admin/v2/${location}/report/payments`;
    const params = { startDate, endDate };

    const response = await apiClient.get(url, { params });
    const body = extractBodyArray(response.data);
    const rows = body.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      return {
        paymentMethod:
          r.paymentMethod ?? r.paymentMethodName ?? r.PaymentMethod ?? r["Payment Method"] ?? r.method ?? r.Method ?? r.type ?? "",
        subtotal: toNumber(r.subtotal ?? r.Subtotal ?? r.amount ?? r.total ?? r.Total),
      } as PaymentsRow;
    });

    // extract footer totals if provided
    let footer: PaymentsFooter | undefined;
    const d = response.data as Record<string, unknown>;
    let f: unknown;
    if (d?.data && typeof d.data === 'object' && d.data !== null) {
      const dataObj = d.data as Record<string, unknown>;
      f = dataObj.footer;
    } else {
      f = d?.footer;
    }
    if (Array.isArray(f) && f.length > 0) {
      const footerData = f[0] as Record<string, unknown>;
      footer = { subtotal: toNumber(footerData.subtotal) };
    }
    let meta: unknown;
    if (d?.data && typeof d.data === 'object' && d.data !== null) {
      const dataObj = d.data as Record<string, unknown>;
      meta = dataObj.meta;
    } else {
      meta = d?.meta;
    }

    return { success: true, data: rows, footer, meta: meta as { startDate?: string; endDate?: string; location?: string } | undefined };
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; statusText?: string; data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message:
        apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch payments",
    };
  }
}



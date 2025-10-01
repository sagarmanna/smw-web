import { apiClient } from "@/lib/api/client";

export interface DiscountRow {
  customer: string;
  code: string;
  description: string;
  pf: string; // e.g., "Monthly", "Quarterly"
  qty: string; // keep exact decimal string from API
  pfPercent: string;
  enrolDollar: string;
  customerPercent: string;
  itemDollar: string;
  netDollar: string;
  price: string;
}

export interface DiscountFooter {
  pf: string;
  qty: string;
  pfPercent: string;
  enrolDollar: string;
  customerPercent: string;
  itemDollar: string;
  netDollar: string;
  price: string;
}

export interface DiscountApiResponse {
  success: boolean;
  data: DiscountRow[];
  message?: string;
  footer?: DiscountFooter;
  meta?: { startDate?: string; endDate?: string; location?: string };
}

// keep exact strings for rendering; helper only for optional totals if needed later
const toStringExact = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  return String(value);
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
    // common array containers
    if (Array.isArray(dataObj.body)) return dataObj.body;
    if (Array.isArray(dataObj.results)) return dataObj.results;
    if (Array.isArray(dataObj.items)) return dataObj.items;
    if (Array.isArray(dataObj.data)) return dataObj.data;
    if (Array.isArray((dataObj as { discounts?: unknown[] }).discounts)) return (dataObj as { discounts?: unknown[] }).discounts as unknown[];
  }
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.body)) return d.body;
  return ensureArray(d);
};

export async function getDiscounts(
  location: string,
  startDate: string,
  endDate: string
): Promise<DiscountApiResponse> {
  try {
    const url = `/admin/v2/${location}/report/discounts`;
    const params = { startDate, endDate };

    const response = await apiClient.get(url, { params });

    const body = extractBodyArray(response.data);
    const rows = body.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      return {
        customer: toStringExact(r.customer ?? r.Customer ?? r.customerName ?? r["Customer Name"] ?? ""),
        code: toStringExact(r.code ?? r.Code ?? r.discountCode ?? r["Discount Code"] ?? ""),
        description: toStringExact(r.description ?? r.Description ?? r.discountDescription ?? r["Discount Description"] ?? ""),
        pf: toStringExact(r.pf ?? r.PF ?? ""),
        qty: toStringExact(r.qty ?? r.Qty ?? r.quantity ?? r.Quantity),
        pfPercent: toStringExact(r.pfPercent ?? r["PF(%)"] ?? r.pfPercentage ?? r["PF Percentage"]),
        enrolDollar: toStringExact(r.enrolDollar ?? r["Enrol($)"] ?? r.enrolAmount ?? r["Enrol Amount"]),
        customerPercent: toStringExact(r.customerPercent ?? r["Customer(%)"] ?? r.customerPercentage ?? r["Customer Percentage"]),
        itemDollar: toStringExact(r.itemDollar ?? r["Item($)"] ?? r.itemAmount ?? r["Item Amount"]),
        netDollar: toStringExact(r.netDollar ?? r["Net($)"] ?? r.netAmount ?? r["Net Amount"]),
        price: toStringExact(r.price ?? r.Price ?? r.unitPrice ?? r["Unit Price"]),
      } as DiscountRow;
    });

    // extract footer totals if provided
    let footer: DiscountFooter | undefined;
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
        pf: toStringExact(footerData.pf),
        qty: toStringExact(footerData.qty),
        pfPercent: toStringExact(footerData.pfPercent),
        enrolDollar: toStringExact(footerData.enrolDollar),
        customerPercent: toStringExact(footerData.customerPercent),
        itemDollar: toStringExact(footerData.itemDollar),
        netDollar: toStringExact(footerData.netDollar),
        price: toStringExact(footerData.price),
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
        apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch discounts",
    };
  }
}

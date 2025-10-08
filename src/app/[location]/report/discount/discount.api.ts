import { apiClient } from "@/lib/api/client";

export interface DiscountRow {
  customer: string;
  code: string;
  description: string;
  pf: string;
  qty: string;
  pfPercent: string;
  enrolDollar: string;
  customerPercent: string;
  itemDollar: string;
  netDollar: string;
  price: string;
}

export interface DiscountFooter {
  pf?: string;
  qty?: string;
  pfPercent?: string;
  enrolDollar?: string;
  customerPercent?: string;
  itemDollar?: string;
  netDollar: string;
  price: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DiscountApiResponse {
  success: boolean;
  data: DiscountRow[];
  message?: string;
  footer?: DiscountFooter;
  pagination?: PaginationInfo;
  meta?: { startDate?: string; endDate?: string; location?: string };
}

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

// Helper function to apply client-side filter
function applyFilter(rows: DiscountRow[], filter?: string): DiscountRow[] {
  if (!filter || filter === 'all') return rows;

  return rows.filter(row => {
    const netDollarNum = parseFloat(String(row.netDollar).replace(/[$,]/g, '') || '0');
    
    if (filter === 'high-value') {
      return netDollarNum > 1000;
    }
    if (filter === 'low-value') {
      return netDollarNum < 1000;
    }
    
    return true;
  });
}

// Helper function to apply client-side pagination
function paginateRows(rows: DiscountRow[], page: number, limit: number): {
  paginatedRows: DiscountRow[];
  total: number;
  totalPages: number;
} {
  const total = rows.length;
  const totalPages = Math.ceil(total / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedRows = rows.slice(startIndex, endIndex);

  return {
    paginatedRows,
    total,
    totalPages
  };
}

// Helper function to calculate footer totals
function calculateFooter(rows: DiscountRow[]): DiscountFooter {
  if (rows.length === 0) {
    return {
      pf: "",
      qty: "",
      pfPercent: "",
      enrolDollar: "",
      customerPercent: "",
      itemDollar: "",
      netDollar: "$0.00",
      price: "$0.00",
    };
  }

  const netTotal = rows.reduce((sum, r) => {
    const val = parseFloat(String(r.netDollar).replace(/[$,]/g, '') || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  const priceTotal = rows.reduce((sum, r) => {
    const val = parseFloat(String(r.price).replace(/[$,]/g, '') || '0');
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return {
    pf: "",
    qty: "",
    pfPercent: "",
    enrolDollar: "",
    customerPercent: "",
    itemDollar: "",
    netDollar: `${netTotal.toFixed(2)}`,
    price: `${priceTotal.toFixed(2)}`,
  };
}

export async function getDiscounts(
  location: string,
  startDate: string,
  endDate: string,
  page: number = 1,
  limit: number = 20,
  filter?: string
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


    // Apply filter
    const filteredRows = applyFilter(rows, filter);

    // Apply pagination
    const { paginatedRows, total, totalPages } = paginateRows(filteredRows, page, limit);

    // Calculate footer for ONLY the current page rows (not all filtered data)
    const footer = calculateFooter(paginatedRows);

    // Extract meta information
    let meta: unknown;
    const d = response.data as Record<string, unknown>;
    if (d?.data && typeof d.data === 'object' && d.data !== null) {
      const dataObj = d.data as Record<string, unknown>;
      meta = dataObj.meta;
    } else {
      meta = d?.meta;
    }

    return {
      success: true,
      data: paginatedRows,
      footer,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      meta: meta as { startDate?: string; endDate?: string; location?: string } | undefined
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; statusText?: string; data?: { message?: string } } };
    const errorMessage = apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch discounts";
    
    return {
      success: false,
      data: [],
      message: errorMessage,
    };
  }
}
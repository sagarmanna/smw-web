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
  totalDiscount?: string;
}


export interface DiscountApiResponse {
  success: boolean;
  data: {
    body: DiscountRow[];
    footer: DiscountFooter;
    meta: { startDate?: string; endDate?: string; location?: string };
  };
  message?: string;
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
  filter?: string
): Promise<DiscountApiResponse> {
  try {
    const url = `/admin/v2/${location}/report/discounts`;
    const params = { startDate, endDate };

    const response = await apiClient.get(url, { params });

    // Handle different response data structures
    let discountData: {
      body: Record<string, unknown>[];
      footer: DiscountFooter;
      meta: { startDate?: string; endDate?: string; location?: string };
    } = {
      body: [],
      footer: {
        netDollar: "$0.00",
        price: "$0.00",
      },
      meta: {}
    };

    if (response.data && typeof response.data === 'object') {
      // Check for nested data structures
      if (response.data.data && response.data.data.body && Array.isArray(response.data.data.body)) {
        // Handle: { data: { body: [...], footer: {...}, meta: {...} } }
        discountData = response.data.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        // Handle: { data: [...] }
        discountData.body = response.data.data;
      } else if (response.data.body && Array.isArray(response.data.body)) {
        // Handle: { body: [...] }
        discountData = response.data;
      } else if (Array.isArray(response.data)) {
        // Handle: [...] directly
        discountData.body = response.data;
      }
    }

    // Transform data to ensure consistent field names
    const transformedData = discountData.body.map((item: Record<string, unknown>): DiscountRow => {
      return {
        customer: toStringExact(item.customer ?? item.Customer ?? item.customerName ?? item["Customer Name"] ?? ""),
        code: toStringExact(item.code ?? item.Code ?? item.discountCode ?? item["Discount Code"] ?? ""),
        description: toStringExact(item.description ?? item.Description ?? item.discountDescription ?? item["Discount Description"] ?? ""),
        pf: toStringExact(item.pf ?? item.PF ?? ""),
        qty: toStringExact(item.qty ?? item.Qty ?? item.quantity ?? item.Quantity),
        pfPercent: toStringExact(item.pfPercent ?? item["PF(%)"] ?? item.pfPercentage ?? item["PF Percentage"]),
        enrolDollar: toStringExact(item.enrolDollar ?? item["Enrol($)"] ?? item.enrolAmount ?? item["Enrol Amount"]),
        customerPercent: toStringExact(item.customerPercent ?? item["Customer(%)"] ?? item.customerPercentage ?? item["Customer Percentage"]),
        itemDollar: toStringExact(item.itemDollar ?? item["Item($)"] ?? item.itemAmount ?? item["Item Amount"]),
        netDollar: toStringExact(item.netDollar ?? item["Net($)"] ?? item.netAmount ?? item["Net Amount"]),
        price: toStringExact(item.price ?? item.Price ?? item.unitPrice ?? item["Unit Price"]),
      };
    });

    // Apply filter if needed
    const filteredRows = applyFilter(transformedData, filter);

    // Use footer from API response or calculate from all data
    const footer = discountData.footer || calculateFooter(filteredRows);

    return {
      success: true,
      data: {
        body: filteredRows,
        footer,
        meta: discountData.meta || {}
      },
      message: 'Discount data fetched successfully'
    };
  } catch (error: unknown) {
    const apiError = error as { 
      response?: { 
        status?: number;
        statusText?: string;
        data?: { message?: string } 
      };
      code?: string;
    };
    
    return {
      success: false,
      data: {
        body: [],
        footer: {
          netDollar: "$0.00",
          price: "$0.00",
        },
        meta: {}
      },
      message: apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch discounts"
    };
  }
}
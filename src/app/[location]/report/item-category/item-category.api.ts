import { apiClient } from "@/lib/api/client";

export interface ItemCategoryRow {
  itemCategory: string;
  id: string;
  customer: string;
  description: string;
  subtotal: number;
  tax: number;
  total: number;
  date?: string;
}

export interface ItemCategoryFooter {
  subtotal: number;
  tax: number;
  total: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ItemCategoryApiResponse {
  success: boolean;
  data: ItemCategoryRow[];
  message?: string;
  footer?: ItemCategoryFooter;
  meta?: { startDate?: string; endDate?: string; location?: string };
  pagination?: Pagination;
}

export interface ItemCategoryOption {
  id: string;
  name: string;
  description?: string;
}

export interface ItemCategoryOptionsResponse {
  success: boolean;
  data: ItemCategoryOption[];
  message?: string;
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

export async function getItemCategory(
  location: string,
  startDate: string,
  endDate: string,
  categoryId?: string,
  page: number = 1,
  limit?: number
): Promise<ItemCategoryApiResponse> {
  try {
    const url = `/admin/v2/${location}/report/item-category`;
    const params: Record<string, string | number> = { startDate, endDate, page };
    
    if (categoryId && categoryId !== "All") {
      params.categoryId = categoryId;
    }
    
    // Add limit parameter if provided
    if (limit) {
      params.limit = limit;
    }

    const response = await apiClient.get(url, { params });

    const body = extractBodyArray(response.data);
    
    // Debug logging
    console.log('Raw API response data:', response.data);
    console.log('Extracted body array:', body);
    console.log('Sample raw row:', body[0]);
    
    const rows = body.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      const subtotal = toNumber(
        r.subtotal ?? r.Subtotal ?? r.SUBTOTAL ?? r.total_without_tax ?? r.sub_total
      );
      const tax = toNumber(r.tax ?? r.Tax ?? r.TAX ?? r.total_tax);
      const total = toNumber(r.total ?? r.Total ?? r.TOTAL ?? r.grand_total);
      
      const mappedRow = {
        itemCategory:
          r.itemCategory ?? r.itemCategoryName ?? r.ItemCategory ?? r["Item Category"] ?? r.category ?? r.Category ?? r.categoryName ?? "",
        id: String(r.id ?? r.ID ?? r.Id ?? r.itemId ?? r.item_id ?? r.transactionId ?? r.transaction_id ?? r.lessonId ?? r.lesson_id ?? r.orderId ?? r.order_id ?? r.receiptId ?? r.receipt_id ?? r.invoiceId ?? r.invoice_id ?? r.bookingId ?? r.booking_id ?? ""),
        customer:
          r.customer ?? r.customerName ?? r.Customer ?? r["Customer"] ?? r.client ?? r.Client ?? "",
        description:
          r.description ?? r.Description ?? r.DESCRIPTION ?? r.itemDescription ?? r.item_description ?? "",
        subtotal,
        tax,
        total: total || subtotal + tax,
        date: r.invoiceDate ?? r.invoice_date ?? r.date ?? r.Date ?? r.createdAt ?? r.created_at ?? r.transactionDate ?? r.transaction_date,
      } as ItemCategoryRow;
      
      // Debug logging for ID and date mapping
      console.log('Raw row fields:', {
        id: r.id,
        ID: r.ID,
        Id: r.Id,
        itemId: r.itemId,
        item_id: r.item_id,
        transactionId: r.transactionId,
        transaction_id: r.transaction_id,
        lessonId: r.lessonId,
        lesson_id: r.lesson_id,
        orderId: r.orderId,
        order_id: r.order_id,
        receiptId: r.receiptId,
        receipt_id: r.receipt_id,
        invoiceId: r.invoiceId,
        invoice_id: r.invoice_id,
        bookingId: r.bookingId,
        booking_id: r.booking_id,
        mappedId: mappedRow.id,
        // Date fields
        invoiceDate: r.invoiceDate,
        invoice_date: r.invoice_date,
        date: r.date,
        Date: r.Date,
        createdAt: r.createdAt,
        created_at: r.created_at,
        transactionDate: r.transactionDate,
        transaction_date: r.transaction_date,
        mappedDate: mappedRow.date,
        allKeys: Object.keys(r)
      });
      
      return mappedRow;
    });

    // extract footer totals if provided
    let footer: ItemCategoryFooter | undefined;
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

    let pagination: Pagination | undefined;
    let p: unknown;
    if (d?.data && typeof d.data === 'object' && d.data !== null) {
      const dataObj = d.data as Record<string, unknown>;
      p = dataObj.pagination;
    } else {
      p = d?.pagination;
    }
    if (p) {
      pagination = p as Pagination;
    }

    return { 
      success: true, 
      data: rows, 
      footer, 
      meta: meta as { startDate?: string; endDate?: string; location?: string } | undefined,
      pagination,
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; statusText?: string; data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message:
        apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch item category data",
    };
  }
}

export async function getItemCategories(
  location: string
): Promise<ItemCategoryOptionsResponse> {
  try {
    const url = `/admin/v2/training-location/item-categories`;
    const params = { location };

    const response = await apiClient.get(url, { params });

    const body = extractBodyArray(response.data);
    const categories = body.map((category: unknown) => {
      const c = category as Record<string, unknown>;
      return {
        id: String(c.id ?? c.ID ?? c.Id ?? c.categoryId ?? c.category_id ?? ""),
        name: String(c.name ?? c.Name ?? c.categoryName ?? c.category_name ?? c.title ?? c.Title ?? ""),
        description: c.description ? String(c.description ?? c.Description ?? "") : undefined,
      } as ItemCategoryOption;
    });

    return {
      success: true,
      data: categories,
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { status?: number; statusText?: string; data?: { message?: string } } };
    return {
      success: false,
      data: [],
      message:
        apiError.response?.data?.message || `${apiError.response?.status}: ${apiError.response?.statusText}` || "Failed to fetch item categories",
    };
  }
}

// Function to fetch all data by making multiple API calls for all pages
export async function getAllItemCategoryData(
  location: string,
  startDate: string,
  endDate: string,
  categoryId?: string
): Promise<ItemCategoryApiResponse> {
  try {
    console.log('Fetching all data for date range:', startDate, 'to', endDate);
    
    // First, get page 1 to understand pagination structure
    const firstPageResponse = await getItemCategory(location, startDate, endDate, categoryId, 1);
    
    if (!firstPageResponse.success) {
      return firstPageResponse;
    }
    
    // Check if there's pagination info in the response
    const paginationInfo = (firstPageResponse as ItemCategoryApiResponse & { pagination?: { totalPages: number; total: number; limit: number } }).pagination;
    
    if (!paginationInfo || paginationInfo.totalPages <= 1) {
      // No pagination or only one page, return the first page data
      console.log('No pagination or single page, returning first page data');
      return firstPageResponse;
    }
    
    console.log('Pagination info:', paginationInfo);
    console.log(`Fetching all ${paginationInfo.totalPages} pages...`);
    
    // Fetch all remaining pages
    const allData = [...firstPageResponse.data];
    const promises = [];
    
    for (let page = 2; page <= paginationInfo.totalPages; page++) {
      promises.push(getItemCategory(location, startDate, endDate, categoryId, page));
    }
    
    // Wait for all pages to load
    const remainingPages = await Promise.all(promises);
    
    // Combine all data
    for (const pageResponse of remainingPages) {
      if (pageResponse.success) {
        allData.push(...pageResponse.data);
      } else {
        console.warn(`Failed to fetch page:`, pageResponse.message);
      }
    }
    
    console.log(`Successfully fetched ${allData.length} total records from ${paginationInfo.totalPages} pages`);
    
    return {
      success: true,
      data: allData,
      message: `Successfully loaded ${allData.length} records from ${paginationInfo.totalPages} pages`
    };
    
  } catch (error) {
    console.error("Error fetching all item category data:", error);
    return {
      success: false,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error occurred while fetching all data",
    };
  }
}

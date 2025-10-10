/* eslint-disable @typescript-eslint/no-unused-vars */
// financial-summary.api.ts

import { apiClient } from "@/lib/api/client";

// ============================================================================
// BASE INTERFACES
// ============================================================================

interface LessonRecord {
  lessonId: string;
  studentName: string;
  customerName: string;
  date: string;
  duration: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

interface InvoiceRecord {
  invoiceId: string;
  customerName: string;
  date: string;
  amount: number;
  paidAmount: number;
  balance: number;
}

interface CustomerCreditRecord {
  customerId: string;
  customerName: string;
  balance: number;
}

// ============================================================================
// PUBLIC TYPES (using type aliases to avoid empty interface warning)
// ============================================================================

export type PaidUnscheduledGroupLesson = LessonRecord;
export type PrepaidFutureGroupLesson = LessonRecord;
export type PrepaidFuturePrivateLesson = LessonRecord;
export type PaidUnscheduledPrivateLesson = LessonRecord;
export type ActiveOutstandingInvoice = InvoiceRecord;
export type InactiveOutstandingInvoice = InvoiceRecord;
export type ActiveCustomerWithCredit = CustomerCreditRecord;
export type InactiveCustomerWithCredit = CustomerCreditRecord;

export interface FinancialSummaryData {
  prepaidFutureGroupLessons: PrepaidFutureGroupLesson[];
  paidUnscheduledGroupLessons: PaidUnscheduledGroupLesson[];
  prepaidFuturePrivateLessons: PrepaidFuturePrivateLesson[];
  paidUnscheduledPrivateLessons: PaidUnscheduledPrivateLesson[];
  activeOutstandingInvoices: ActiveOutstandingInvoice[];
  inactiveOutstandingInvoices: InactiveOutstandingInvoice[];
  activeCustomersWithCredit: ActiveCustomerWithCredit[];
  inactiveCustomersWithCredit: InactiveCustomerWithCredit[];
}

export interface SummaryData {
  particulars: string;
  count: number;
  total: number | null;
}

export interface FinancialSummaryResponse {
  success: boolean;
  data: FinancialSummaryData;
  message?: string;
  metadata?: {
    duration: number;
    timestamp: string;
  };
}

export interface SummaryStatsResponse {
  success: boolean;
  data: SummaryData[];
  message?: string;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const toNumber = (value: unknown): number => {
  if (value === null || value === undefined) return 0;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/[$,]/g, "").trim();
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
  if (d?.data && typeof d.data === "object" && d.data !== null) {
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

// ============================================================================
// ERROR HANDLING
// ============================================================================

interface ApiError {
  response?: {
    status?: number;
    statusText?: string;
    data?: unknown;
  };
  message?: string;
}

function logApiError(endpoint: string, error: unknown): void {
  const err = error as ApiError;
  // console.error(`❌ [${endpoint}] ERROR:`, {
  //   status: err.response?.status,
  //   statusText: err.response?.statusText,
  //   data: err.response?.data,
  //   message: err.message,
  // });
}

// ============================================================================
// GENERIC SAFE GET WITH TIMEOUT
// ============================================================================

const API_TIMEOUT = 10000; // 10 seconds

async function safeGet<T>(
  endpoint: string,
  url: string,
  params?: Record<string, unknown>
): Promise<T[]> {
  try {
    // console.log(`📤 [${endpoint}] REQUEST:`, { url, params });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), API_TIMEOUT)
    );

    const requestPromise = params
      ? apiClient.get(url, { params })
      : apiClient.get(url);

    const response = await Promise.race([requestPromise, timeoutPromise]);

    // console.log(`📥 [${endpoint}] RESPONSE:`, response.data);

    const body = extractBodyArray(response.data);

    // console.log(`✅ [${endpoint}] PARSED:`, { count: body.length, data: body });

    return body as T[];
  } catch (error: unknown) {
    logApiError(endpoint, error);
    return [];
  }
}

// ============================================================================
// MAPPING FUNCTIONS
// ============================================================================

function mapToLessonRecord(row: unknown): LessonRecord {
  const r = row as Record<string, unknown>;
  return {
    lessonId: String(r.lessonId ?? r.lesson_id ?? r.id ?? ""),
    studentName: String(r.studentName ?? r.student_name ?? r.student ?? ""),
    customerName: String(r.customerName ?? r.customer_name ?? r.customer ?? ""),
    date: String(r.date ?? r.lesson_date ?? ""),
    duration: String(r.duration ?? ""),
    amount: toNumber(r.amount ?? r.total_amount),
    paidAmount: toNumber(r.paidAmount ?? r.paid_amount ?? r.paid),
    balance: toNumber(r.balance ?? r.remaining_balance),
  };
}

function mapToInvoiceRecord(row: unknown): InvoiceRecord {
  const r = row as Record<string, unknown>;
  return {
    invoiceId: String(r.invoiceId ?? r.invoice_id ?? r.id ?? ""),
    customerName: String(r.customerName ?? r.customer_name ?? r.customer ?? ""),
    date: String(r.date ?? r.invoice_date ?? ""),
    amount: toNumber(r.amount ?? r.total_amount ?? r.total),
    paidAmount: toNumber(r.paidAmount ?? r.paid_amount ?? r.paid),
    balance: toNumber(r.balance ?? r.remaining_balance ?? r.outstanding),
  };
}

function mapToCustomerCreditRecord(row: unknown): CustomerCreditRecord {
  const r = row as Record<string, unknown>;
  return {
    customerId: String(r.customerId ?? r.customer_id ?? r.id ?? ""),
    customerName: String(r.customerName ?? r.customer_name ?? r.name ?? ""),
    balance: toNumber(r.balance ?? r.credit_balance ?? r.credit),
  };
}

// ============================================================================
// INDIVIDUAL API FETCH FUNCTIONS
// ============================================================================

async function fetchPrepaidFuturePrivateLessons(
  location: string,
  startDate: string,
  endDate: string
): Promise<PrepaidFuturePrivateLesson[]> {
  const url = `/admin/v2/${location}/report/financial-summary/prepaid-future-private-lessons`;
  const params = { goToDate: endDate };
  const rawData = await safeGet<unknown>(
    "Prepaid Future Private Lessons",
    url,
    params
  );
  return rawData.map(mapToLessonRecord);
}

async function fetchPrepaidFutureGroupLessons(
  location: string,
  startDate: string,
  endDate: string
): Promise<PrepaidFutureGroupLesson[]> {
  const url = `/admin/v2/${location}/report/financial-summary/prepaid-future-group-lessons`;
  const params = { goToDate: endDate };
  const rawData = await safeGet<unknown>(
    "Prepaid Future Group Lessons",
    url,
    params
  );
  return rawData.map(mapToLessonRecord);
}

async function fetchPaidUnscheduledGroupLessons(
  location: string,
  startDate: string,
  endDate: string
): Promise<PaidUnscheduledGroupLesson[]> {
  const url = `/admin/v2/${location}/report/financial-summary/paid-unscheduled-group-lessons`;
  const params = { goToDate: endDate, page: 1, limit: 100 };
  const rawData = await safeGet<unknown>(
    "Paid Unscheduled Group Lessons",
    url,
    params
  );
  return rawData.map(mapToLessonRecord);
}

async function fetchPaidUnscheduledPrivateLessons(
  location: string,
  startDate: string,
  endDate: string
): Promise<PaidUnscheduledPrivateLesson[]> {
  const url = `/admin/v2/${location}/report/financial-summary/paid-unscheduled-private-lessons`;
  const rawData = await safeGet<unknown>(
    "Paid Unscheduled Private Lessons",
    url
  );
  return rawData.map(mapToLessonRecord);
}

async function fetchActiveOutstandingInvoices(
  location: string,
  startDate: string,
  endDate: string
): Promise<ActiveOutstandingInvoice[]> {
  const url = `/admin/v2/${location}/report/financial-summary/active-outstanding-invoices`;
  const rawData = await safeGet<unknown>("Active Outstanding Invoices", url);
  return rawData.map(mapToInvoiceRecord);
}

async function fetchInactiveOutstandingInvoices(
  location: string,
  startDate: string,
  endDate: string
): Promise<InactiveOutstandingInvoice[]> {
  const url = `/admin/v2/${location}/report/financial-summary/inactive-outstanding-invoices`;
  const rawData = await safeGet<unknown>("Inactive Outstanding Invoices", url);
  return rawData.map(mapToInvoiceRecord);
}

async function fetchActiveCustomersWithCredit(
  location: string,
  startDate: string,
  endDate: string
): Promise<ActiveCustomerWithCredit[]> {
  const url = `/admin/v2/${location}/report/financial-summary/active-customers-with-credit`;
  const params = { goToDate: endDate };
  const rawData = await safeGet<unknown>(
    "Active Customers With Credit",
    url,
    params
  );
  return rawData.map(mapToCustomerCreditRecord);
}

async function fetchInactiveCustomersWithCredit(
  location: string,
  startDate: string,
  endDate: string
): Promise<InactiveCustomerWithCredit[]> {
  const url = `/admin/v2/${location}/report/financial-summary/inactive-customers-with-credit`;
  const rawData = await safeGet<unknown>("Inactive Customers With Credit", url);
  return rawData.map(mapToCustomerCreditRecord);
}

// ============================================================================
// MAIN EXPORT FUNCTIONS
// ============================================================================

export async function getFinancialSummary(
  location: string,
  startDate: string,
  endDate: string
): Promise<FinancialSummaryResponse> {
  // console.log("🚀 [FINANCIAL SUMMARY] STARTING FETCH");
  // console.log("📋 [FINANCIAL SUMMARY] INPUT PARAMS:", {
  //   location,
  //   startDate,
  //   endDate,
  // });

  try {
    // console.log("⏳ [FINANCIAL SUMMARY] Fetching all endpoints in parallel...");

    const startTime = performance.now();
    const timestamp = new Date().toISOString();

    const [
      prepaidFuturePrivateLessons,
      prepaidFutureGroupLessons,
      paidUnscheduledGroupLessons,
      paidUnscheduledPrivateLessons,
      activeOutstandingInvoices,
      inactiveOutstandingInvoices,
      activeCustomersWithCredit,
      inactiveCustomersWithCredit,
    ] = await Promise.all([
      fetchPrepaidFuturePrivateLessons(location, startDate, endDate),
      fetchPrepaidFutureGroupLessons(location, startDate, endDate),
      fetchPaidUnscheduledGroupLessons(location, startDate, endDate),
      fetchPaidUnscheduledPrivateLessons(location, startDate, endDate),
      fetchActiveOutstandingInvoices(location, startDate, endDate),
      fetchInactiveOutstandingInvoices(location, startDate, endDate),
      fetchActiveCustomersWithCredit(location, startDate, endDate),
      fetchInactiveCustomersWithCredit(location, startDate, endDate),
    ]);

    const endTime = performance.now();
    const duration = Number((endTime - startTime).toFixed(2));

    const finalData: FinancialSummaryData = {
      prepaidFutureGroupLessons,
      paidUnscheduledGroupLessons,
      prepaidFuturePrivateLessons,
      paidUnscheduledPrivateLessons,
      activeOutstandingInvoices,
      inactiveOutstandingInvoices,
      activeCustomersWithCredit,
      inactiveCustomersWithCredit,
    };

    // console.log("✅ [FINANCIAL SUMMARY] ALL FETCHES COMPLETED");
    // console.log("📊 [FINANCIAL SUMMARY] SUMMARY:", {
    //   duration: `${duration}ms`,
    //   timestamp,
    //   counts: {
    //     prepaidFuturePrivateLessons: prepaidFuturePrivateLessons.length,
    //     prepaidFutureGroupLessons: prepaidFutureGroupLessons.length,
    //     paidUnscheduledGroupLessons: paidUnscheduledGroupLessons.length,
    //     paidUnscheduledPrivateLessons: paidUnscheduledPrivateLessons.length,
    //     activeOutstandingInvoices: activeOutstandingInvoices.length,
    //     inactiveOutstandingInvoices: inactiveOutstandingInvoices.length,
    //     activeCustomersWithCredit: activeCustomersWithCredit.length,
    //     inactiveCustomersWithCredit: inactiveCustomersWithCredit.length,
    //   },
    // });

    return {
      success: true,
      data: finalData,
      metadata: {
        duration,
        timestamp,
      },
    };
  } catch (error: unknown) {
    const apiError = error as ApiError & { message?: string };

    // console.error("❌ [FINANCIAL SUMMARY] FAILED:", apiError);

    return {
      success: false,
      data: {
        prepaidFutureGroupLessons: [],
        paidUnscheduledGroupLessons: [],
        prepaidFuturePrivateLessons: [],
        paidUnscheduledPrivateLessons: [],
        activeOutstandingInvoices: [],
        inactiveOutstandingInvoices: [],
        activeCustomersWithCredit: [],
        inactiveCustomersWithCredit: [],
      },
      message:
        (apiError.response?.data as { message?: string })?.message ||
        apiError.message ||
        `${apiError.response?.status}: ${apiError.response?.statusText}` ||
        "Failed to fetch financial summary",
    };
  }
}

export async function getFinancialSummaryStats(
  location: string,
  startDate: string,
  endDate: string
): Promise<SummaryStatsResponse> {
  try {
    const url = `/admin/v2/${location}/report/financial-summary/summary`;
    const params = { goToDate: endDate };

    // console.log("📤 [Financial Summary Stats] REQUEST:", { url, params });

    const response = await apiClient.get(url, { params });

    // console.log("📥 [Financial Summary Stats] RESPONSE:", response.data);

    const body = extractBodyArray(response.data);

    // console.log("✅ [Financial Summary Stats] PARSED:", {
    //   count: body.length,
    //   data: body,
    // });

    const summaryData: SummaryData[] = body.map((row: unknown) => {
      const r = row as Record<string, unknown>;
      return {
        particulars: String(r.particulars ?? r.category ?? r.name ?? ""),
        count: toNumber(r.count ?? r.total_count ?? 0),
        total: r.total !== undefined ? toNumber(r.total ?? r.amount) : null,
      };
    });

    // console.log("📊 [Financial Summary Stats] FINAL:", summaryData);

    return { success: true, data: summaryData };
  } catch (error: unknown) {
    logApiError("Financial Summary Stats", error);
    return {
      success: false,
      data: [],
      message: "Failed to fetch summary statistics",
    };
  }
}
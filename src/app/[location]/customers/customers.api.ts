import { apiClient } from "@/lib/api/client";
import {
  InvoiceData,
  OutstandingInvoiceData,
  EquipmentRentalData,
  RecurringPaymentData,
  PrivateLessonDueData,
  GroupLessonDueData,
  PaymentData,
} from "./tableConfigs";
import {
  StudentData,
  EnrolmentData,
  PrivateLessonData,
  GroupLessonData,
  ProformaInvoiceData,
  CommentData,
  HistoryData,
} from "./tabConfigs";

export interface CustomerRow {
  id: number;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
  allEmails: string;
  students: string;
  balance: string;
  totalBalance?: string;
}

export interface CustomersListResponse {
  success: boolean;
  message: string;
  data: {
    body: CustomerRow[];
    footer: {
      id: string;
      isActive: string;
      firstName: string;
      lastName: string;
      email: string;
      students: string;
      balance: string;
      totalBalance?: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CustomersQuery {
  page?: number;
  limit?: number;
  showActive?: boolean;
  showInActive?: boolean;
  firstName?: string;
  lastName?: string;
  email?: string;
  student?: string;
  balance?: "all" | "credit" | "owing";
  sort?: "firstName" | "lastName" | "email";
  order?: "asc" | "desc";
}

export interface CustomerSummaryData {
  lessonsDue: string;
  outstandingInvoice: string;
  totalCredits: string;
  balance: string;
}

export interface CustomerSummaryResponse {
  success: boolean;
  message: string;
  data: CustomerSummaryData;
}

export interface CustomerInfoData {
  profile: {
    name: string;
    role: string;
    referralSource: string;
    referralSourceDescription?: string;
    status: string;
  };
  email: Array<{
    id: number;
    email: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }>;
  phone: Array<{
    id: number;
    number: string;
    extension?: number;
    note?: string;
    label: string;
    isPrimary: boolean;
  }>;
  addresses: Array<{
    id: number;
    address: string;
    city: string;
    cityId: number;
    provinceId: number;
    countryId: number;
    province: string;
    country: string;
    postalCode: string;
    note?: string;
    label: string;
    isPrimary: boolean;
  }>;
  discount: {
    id: number;
    value: number;
  } | null;
  openingBalance: {
    id: number;
    amount: number;
    type: string;
  } | null;
  paymentPreference: Record<string, unknown> | null;
}

export interface CustomerInfoResponse {
  success: boolean;
  message: string;
  data: CustomerInfoData;
}

export interface InvoicesResponse {
  success: boolean;
  data: {
    body: Array<{
      id: string;
      date: string;
      status: string;
      total: string | number;
      balance: string | number;
      url: string;
      studentName?: string;
    }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Outstanding Invoices Response with pagination and footer
export interface OutstandingInvoicesResponse {
  success: boolean;
  data: {
    body: Array<{
      id: string;
      date: string;
      amount: string;
      payments: string;
      balanceDue: string;
      url: string;
    }>;
    footer: Array<{
      totalAmount: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface OutstandingInvoicesResult {
  data: OutstandingInvoiceData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  footer: {
    totalAmount: number;
  };
}

// Equipment Rentals API Response Interface
export interface EquipmentRentalsResponse {
  success: boolean;
  data: {
    body: Array<{
      id: number;
      studentName: string;
      startDate: string;
      returnDate: string;
      rentalTerm: string;
      depositAmount: string | number;
      equipmentReturned: string;
      equipmentReturnedDate: string;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message: string;
}

export interface EquipmentRentalsResult {
  data: EquipmentRentalData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomers(
  location: string,
  query: CustomersQuery
): Promise<CustomersListResponse | null> {
  try {
    const params = new URLSearchParams();

    if (query.page) params.append("page", query.page.toString());
    if (query.limit)
      params.append(
        "limit",
        query.limit == -1 ? "99999" : query.limit.toString()
      );
    if (query.showActive !== undefined)
      params.append("showActive", query.showActive.toString());
    if (query.showInActive !== undefined)
      params.append("showInActive", query.showInActive.toString());
    if (query.firstName) params.append("firstName", query.firstName);
    if (query.lastName) params.append("lastName", query.lastName);
    if (query.email) params.append("email", query.email);
    if (query.student) params.append("student", query.student);
    if (query.balance) params.append("balance", query.balance);
    if (query.sort) params.append("sort", query.sort);
    if (query.order) params.append("order", query.order);

    const response = await apiClient.get<CustomersListResponse>(
      `/admin/v2/${location}/customers`,
      { params }
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || "Failed to fetch customers",
      data: {
        body: [],
        footer: {
          id: "",
          isActive: "",
          firstName: "",
          lastName: "",
          email: "",
          students: "",
          balance: "$0.00",
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        },
      },
    };
  }
}

export async function getCustomerById(
  location: string,
  id: number
): Promise<CustomerRow | null> {
  try {
    const response = await apiClient.get<{
      success: boolean;
      data: CustomerRow;
      message: string;
    }>(`/admin/v2/${location}/customers/${id}`);
    return response.data.success ? response.data.data : null;
  } catch (error: unknown) {
    return null;
  }
}

export async function getCustomerSummary(
  location: string,
  customerId: number
): Promise<CustomerSummaryResponse | null> {
  try {
    const response = await apiClient.get<CustomerSummaryResponse>(
      `/admin/v2/${location}/customers/${customerId}/summary`
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error("Error fetching customer summary:", error);
    return {
      success: false,
      message:
        apiError.response?.data?.message || "Failed to fetch customer summary",
      data: {
        lessonsDue: "$0.00",
        outstandingInvoice: "$0.00",
        totalCredits: "$0.00",
        balance: "$0.00",
      },
    };
  }
}

export async function getCustomerInfo(
  location: string,
  customerId: number
): Promise<CustomerInfoResponse | null> {
  try {
    const response = await apiClient.get<CustomerInfoResponse>(
      `/admin/v2/${location}/customers/${customerId}/info`
    );

    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error("Error fetching customer info:", error);
    return null;
  }
}

// --------------------
// Table data functions
// --------------------

export async function getCustomerInvoices(
  location: string,
  customerId: number,
  page: number = 1
): Promise<InvoiceData[]> {
  try {
    const response = await apiClient.get<InvoicesResponse>(
      `/admin/v2/${location}/customers/${customerId}/invoices`,
      { params: { page } }
    );

    if (response.data.success && response.data.data.body) {
      return response.data.data.body.map((invoice) => ({
        id: invoice.id,
        date: invoice.date,
        status: invoice.status,
        total:
          typeof invoice.total === "string"
            ? parseFloat(invoice.total.replace(/[$,]/g, ""))
            : invoice.total,
        balance:
          typeof invoice.balance === "string"
            ? parseFloat(invoice.balance.replace(/[$,]/g, ""))
            : invoice.balance,
        url: invoice.url,
        studentName: invoice.studentName || "",
      }));
    }

    return [];
  } catch (error: unknown) {
    console.error("Error fetching customer invoices:", error);
    return [];
  }
}

export async function getCustomerOutstandingInvoices(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<OutstandingInvoicesResult> {
  try {
    const response = await apiClient.get<OutstandingInvoicesResponse>(
      `/admin/v2/${location}/customers/${customerId}/outstanding-invoices`,
      { params: { page, limit } }
    );

    if (response.data.success && response.data.data.body) {
      const data = response.data.data.body.map((invoice) => ({
        id: invoice.id,
        date: invoice.date,
        amount: parseFloat(invoice.amount.replace(/[$,]/g, "")),
        payments: parseFloat(invoice.payments.replace(/[$,]/g, "")),
        balanceDue: parseFloat(invoice.balanceDue.replace(/[$,]/g, "")),
        url: invoice.url,
      }));

      const totalAmount = response.data.data.footer?.[0]?.totalAmount
        ? parseFloat(
            response.data.data.footer[0].totalAmount.replace(/[$,]/g, "")
          )
        : 0;

      return {
        data,
        pagination: response.data.data.pagination,
        footer: {
          totalAmount,
        },
      };
    }

    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      footer: {
        totalAmount: 0,
      },
    };
  } catch (error: unknown) {
    console.error("Error fetching customer outstanding invoices:", error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
      footer: {
        totalAmount: 0,
      },
    };
  }
}

export async function getCustomerEquipmentRentals(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<EquipmentRentalsResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    params.append("showAll", "true");

    const url = `/admin/v2/${location}/customers/${customerId}/equipment-rentals`;

    const response = await apiClient.get<EquipmentRentalsResponse>(url, {
      params,
    });

    if (response.data.success && response.data.data.body) {
      const data = response.data.data.body.map(rental => ({
        id: rental.id,
        student: rental.studentName,
        startDate: rental.startDate,
        returnDate: rental.returnDate,
        rentalTerm: rental.rentalTerm,
        depositAmount: rental.depositAmount,
        equipmentReturned: rental.equipmentReturned,
        equipmentReturnedDate: rental.equipmentReturnedDate,
      }));

      return {
        data,
        pagination: response.data.data.pagination,
      };
    }

    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export interface RecurringPaymentsResponse {
  success: boolean;
  message?: string;
  data: {
    body: RecurringPaymentData[];
    footer?: Array<Record<string, string>>; // optional footer if provided
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface RecurringPaymentsResult {
  data: RecurringPaymentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomerRecurringPayments(
  location: string,
  customerId: number,
  page?: number,
  limit?: number
): Promise<RecurringPaymentsResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<RecurringPaymentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/recurring-payments`,
      { params }
    );
    return {
      data: response.data.data?.body || [],
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

export interface RecurringPaymentInfoResponse {
  success: boolean;
  message: string;
  data: {
    body: {
      payment: {
        customerId: number;
        amount: number;
        entryDay: number;
        paymentDay: number;
        paymentMethodId: number;
        paymentFrequencyId: number;
        startDate: string;
        expiryMonth: number | null;
        expiryYear: number | null;
        isEnabled: boolean;
      };
      enrolments: Array<{
        id: number;
        programName: string;
        paymentFrequency: string;
        studentName: string;
        teacherName: string;
        dueAmount?: number;
        isSelected?: boolean;
      }>;
      paymentMethods: Array<{
        id: number;
        name: string;
      }>;
      paymentFrequencies: Array<{
        id: number;
        name: string;
      }>;
    };
  };
}

export interface RecurringPaymentInfoData {
  payment: {
    customerId: number;
    amount: number;
    entryDay: number;
    paymentDay: number;
    paymentMethodId: number;
    paymentFrequencyId: number;
    startDate: string;
    expiryMonth: number | null;
    expiryYear: number | null;
    isEnabled: boolean;
  };
  enrolments: Array<{
    id: number;
    programName: string;
    paymentFrequency: string;
    studentName: string;
    teacherName: string;
    dueAmount?: number;
    isSelected?: boolean;
  }>;
  paymentMethods: Array<{
    id: number;
    name: string;
  }>;
  paymentFrequencies: Array<{
    id: number;
    name: string;
  }>;
}

export async function getCustomerRecurringPaymentInfo(
  location: string,
  customerId: number,
  recurringPaymentId?: number
): Promise<RecurringPaymentInfoData | null> {
  try {
    const url = recurringPaymentId
      ? `/admin/v2/${location}/customers/${customerId}/recurring-payments/info?id=${recurringPaymentId}`
      : `/admin/v2/${location}/customers/${customerId}/recurring-payments/info`;
    
    const response = await apiClient.get<RecurringPaymentInfoResponse>(url);
    return response.data.data?.body || null;
  } catch (error: unknown) {
    console.error('Error fetching recurring payment info:', error);
    return null;
  }
}

export interface PrivateLessonDuesResponse {
  success: boolean;
  message?: string;
  data: {
    body: PrivateLessonDueData[];
    footer?: Array<{ totalAmount: string }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PrivateLessonDuesResult {
  data: PrivateLessonDueData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  footer?: { totalAmount: string };
}

export async function getCustomerPrivateLessonDue(
  location: string,
  customerId: number,
  page?: number,
  limit?: number
): Promise<PrivateLessonDuesResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<PrivateLessonDuesResponse>(
      `/admin/v2/${location}/customers/${customerId}/private-lesson-due`,
      { params }
    );
    const pagination = response.data.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    const footerArr = response.data.data?.footer || [];

    const data = (response.data.data?.body || []).map((lesson) => ({
      ...lesson,
      url: lesson.url,
    }));

    return {
      data,
      pagination,
      footer: footerArr[0]
        ? { totalAmount: footerArr[0].totalAmount }
        : undefined,
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      footer: { totalAmount: "$0.00" },
    };
  }
}

export interface GroupLessonDuesResponse {
  success: boolean;
  message?: string;
  data: {
    body: GroupLessonDueData[];
    footer?: Array<{ totalAmount: string }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GroupLessonDuesResult {
  data: GroupLessonDueData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  footer?: { totalAmount: string };
}

export async function getCustomerGroupLessonDue(
  location: string,
  customerId: number,
  page?: number,
  limit?: number
): Promise<GroupLessonDuesResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<GroupLessonDuesResponse>(
      `/admin/v2/${location}/customers/${customerId}/group-lesson-dues`,
      { params }
    );
    const pagination = response.data.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    const footerArr = response.data.data?.footer || [];

    // Map the response to include url
    const data =
      response.data.data?.body.map((lesson) => ({
        lessonDate: lesson.lessonDate,
        studentName: lesson.studentName,
        programName: lesson.programName,
        teacherName: lesson.teacherName,
        amount: lesson.amount,
        url: lesson.url,
      })) || [];

    return {
      data,
      pagination,
      footer: footerArr[0]
        ? { totalAmount: footerArr[0].totalAmount }
        : undefined,
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      footer: { totalAmount: "$0.00" },
    };
  }
}

export interface PaymentsResponse {
  success: boolean;
  message?: string;
  data: {
    body: PaymentData[];
    footer?: Array<{ totalRemaining: string }>;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PaymentsResult {
  data: PaymentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  footer?: { totalRemaining: string };
}

export async function getCustomerPayments(
  location: string,
  customerId: number,
  page?: number,
  limit?: number,
  orderBy?: string
): Promise<PaymentsResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());
    if (orderBy) params.append("orderBy", orderBy);
    const response = await apiClient.get<PaymentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/payments`,
      { params }
    );
    const pagination = response.data.data?.pagination || {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    };
    const footerArr = response.data.data?.footer || [];
    return {
      data: response.data.data?.body || [],
      pagination,
      footer: footerArr[0]
        ? { totalRemaining: footerArr[0].totalRemaining }
        : undefined,
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      footer: { totalRemaining: "$0.00" },
    };
  }
}

// Fetch a single payment detail by paymentId by scanning the customer's payments list
export async function getCustomerPaymentById(
  location: string,
  customerId: number,
  paymentId: string | number
): Promise<PaymentData | null> {
  try {
    // Fetch all payments (or a large page) and locate by id-like field
    const { data } = await getCustomerPayments(location, customerId, 1, 99999);
    const targetId = String(paymentId);
    const found = data.find((p: PaymentData) => {
      const anyP = p as unknown as Record<string, unknown>;
      const pid = anyP["paymentId"] ?? anyP["id"] ?? anyP["payment_id"];
      return pid !== undefined && String(pid) === targetId;
    });
    return found || null;
  } catch {
    return null;
  }
}

// --------------------
// Students API function
// --------------------

export interface StudentsResponse {
  success: boolean;
  message: string;
  data: {
    body: Array<{
      id: number;
      fullName: string;
      birthDate: string;
      customerName: string;
      status: number;
      isActive: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface StudentsResult {
  data: StudentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomerStudents(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<StudentsResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<StudentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/students`,
      { params }
    );

    return {
      data: response.data.data?.body || [],
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

// --------------------
// Enrolments API function
// --------------------

export interface EnrolmentsResponse {
  success: boolean;
  message: string;
  data: {
    body: EnrolmentData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface EnrolmentsResult {
  data: EnrolmentData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomerEnrolments(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<EnrolmentsResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<EnrolmentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/enrolments`,
      { params }
    );

    return {
      data: response.data.data?.body || [],
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  }
}

// --------------------
// Private Lessons (tab) API function
// --------------------

export interface PrivateLessonsResponse {
  success: boolean;
  message: string;
  data: {
    body: PrivateLessonData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PrivateLessonsResult {
  data: PrivateLessonData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomerPrivateLessons(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<PrivateLessonsResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<PrivateLessonsResponse>(
      `/admin/v2/${location}/customers/${customerId}/private-lessons`,
      { params }
    );

    const data = (response.data.data?.body || []).map((lesson) => ({
      ...lesson,
      url: lesson.url,
    }));

    return {
      data,
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// --------------------
// Group Lessons (tab) API function
// --------------------

export interface GroupLessonsResponse {
  success: boolean;
  message: string;
  data: {
    body: GroupLessonData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface GroupLessonsResult {
  data: GroupLessonData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomerGroupLessons(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<GroupLessonsResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<GroupLessonsResponse>(
      `/admin/v2/${location}/customers/${customerId}/group-lessons`,
      { params }
    );

    const data = (response.data.data?.body || []).map((lesson) => ({
      ...lesson,
      url: lesson.url,
    }));

    return {
      data,
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// --------------------
// Pro-forma Invoices (tab) API function
// --------------------

export interface ProformaInvoicesResponse {
  success: boolean;
  message: string;
  data: {
    body: ProformaInvoiceData[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProformaInvoicesResult {
  data: ProformaInvoiceData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export async function getCustomerProformaInvoices(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<ProformaInvoicesResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append("page", page.toString());
    if (limit)
      params.append("limit", limit === -1 ? "99999" : limit.toString());

    const response = await apiClient.get<ProformaInvoicesResponse>(
      `/admin/v2/${location}/customers/${customerId}/pro-forma-invoices`,
      { params }
    );
    return {
      data: response.data.data?.body || [],
      pagination: response.data.data?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

// --------------------
// Comments (tab) API function
// --------------------

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: {
    body: CommentData[];
  };
}

export async function getCustomerComments(
  location: string,
  customerId: number
): Promise<CommentData[]> {
  try {
    const response = await apiClient.get<CommentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/comments`
    );
    return response.data.data?.body || [];
  } catch (error: unknown) {
    return [];
  }
}

// --------------------
// History (tab) API function
// --------------------

export interface HistoryResponse {
  success: boolean;
  message: string;
  data: {
    body: HistoryData[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface HistoryResult {
  data: HistoryData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Constants for default pagination
const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
} as const;

const FETCH_ALL_LIMIT = 99999;

// Helper to create empty result - avoid duplication
const createEmptyHistoryResult = (): HistoryResult => ({
  data: [],
  pagination: { ...DEFAULT_PAGINATION },
});

// Helper to build params - separation of concerns
const buildHistoryQueryParams = (
  customerId: number,
  page: number,
  limit: number,
  type: string
): URLSearchParams => {
  const normalizedLimit = limit === -1 ? FETCH_ALL_LIMIT : limit;
  
  return new URLSearchParams({
    page: page.toString(),
    limit: normalizedLimit.toString(),
    type,
    id: customerId.toString(),
  });
};

export async function getCustomerHistory(
  location: string,
  customerId: number,
  page: number = DEFAULT_PAGINATION.page,
  limit: number = DEFAULT_PAGINATION.limit,
  type: string = "user"
): Promise<HistoryResult> {
  try {
    const params = buildHistoryQueryParams(customerId, page, limit, type);

    const response = await apiClient.get<HistoryResponse>(
      `/admin/v2/${location}/history`,
      { params }
    );
    
    return {
      data: response.data.data?.body ?? [],
      pagination: response.data.data?.pagination ?? { ...DEFAULT_PAGINATION },
    };
  } catch (error: unknown) {
    console.error("Error fetching customer history:", {
      location,
      customerId,
      page,
      limit,
      type,
      error: error instanceof Error ? error.message : error,
    });
    
    return createEmptyHistoryResult();
  }
}

/**
 * Delete a customer
 * @param location - The location slug
 * @param customerId - The customer ID
 * @returns Success response
 */
export async function deleteCustomer(
  location: string,
  customerId: number
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
      data: { success: boolean };
    }>(`/admin/v2/${location}/customers/${customerId}`);
    
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string; errorCode?: string } } };
    if (apiError.response?.data?.message) {
      throw new Error(apiError.response.data.message);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete customer');
  }
}

export interface NotifyEmailType {
  id: number;
  emailNotifyType: string;
  isChecked: boolean;
}

export interface NotifyEmailPreviewResponse {
  success: boolean;
  message: string;
  data: {
    emailTypes: NotifyEmailType[];
  };
}

export interface NotifyEmailUpdateRequest {
  emailNotifyType: number[];
}

export interface NotifyEmailUpdateResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
  };
}

export interface EmailStatementData {
  privateLessonsDue: Array<{
    lessonDate: string;
    studentName: string;
    programName: string;
    teacherName: string;
    amount: number | string;
  }>;
  groupLessonsDue: Array<{
    lessonDate: string;
    studentName: string;
    programName: string;
    teacherName: string;
    amount: number | string;
  }>;
  invoices: Array<{
    id: string;
    date: string;
    status: string;
    total: number;
    balance: number;
  }>;
  credits: Array<{
    id: number;
    type: string;
    reference: string;
    amount: number;
  }>;
  totalBalance: number;
  customerEmails: string[];
  emailSubject: string;
  emailHeader: string;
}

export interface EmailStatementResponse {
  success: boolean;
  message: string;
  data: {
    body: EmailStatementData;
  };
}

/**
 * Get email statement data for a customer
 * @param location - The location slug
 * @param customerId - The customer ID
 * @returns Email statement data
 */
export async function getEmailStatement(
  location: string,
  customerId: number
): Promise<EmailStatementData | null> {
  try {
    const response = await apiClient.get<EmailStatementResponse>(
      `/admin/v2/${location}/customers/${customerId}/email-statement`
    );

    if (response.data.success && response.data.data.body) {
      return response.data.data.body;
    }

    return null;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    console.error("Error fetching email statement:", error);
    throw new Error(
      apiError.response?.data?.message || "Failed to fetch email statement"
    );
  }
}

/**
 * Get notification email types with checked status for a customer
 * @param location - The location slug
 * @param customerId - The customer ID
 * @returns Notification email types with checked status
 */
export async function getNotifyEmailPreview(
  location: string,
  customerId: number
): Promise<NotifyEmailType[]> {
  try {
    const response = await apiClient.get<NotifyEmailPreviewResponse>(
      `/admin/v2/${location}/customers/${customerId}/notify-email-preview`
    );
    
    return response.data.data?.emailTypes || [];
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to retrieve notification email types');
  }
}

/**
 * Update notification email settings for a customer
 * @param location - The location slug
 * @param customerId - The customer ID
 * @param emailNotifyTypeIds - Array of notification type IDs to enable
 * @returns Success response
 */
export async function updateNotifyEmail(
  location: string,
  customerId: number,
  emailNotifyTypeIds: number[]
): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await apiClient.post<NotifyEmailUpdateResponse>(
      `/admin/v2/${location}/customers/${customerId}/notify-email`,
      {
        emailNotifyType: emailNotifyTypeIds,
      }
    );
    
    return {
      success: response.data.success,
      message: response.data.message,
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to update notification email settings');
  }
}
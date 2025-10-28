import { apiClient } from '@/lib/api/client';
import { 
  InvoiceData, 
  OutstandingInvoiceData, 
  EquipmentRentalData, 
  RecurringPaymentData, 
  PrivateLessonDueData, 
  GroupLessonDueData, 
  PaymentData 
} from './tableConfigs';
import { StudentData, EnrolmentData, PrivateLessonData, GroupLessonData, ProformaInvoiceData, CommentData, HistoryData } from './tabConfigs';

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
  balance?: 'all' | 'credit' | 'owing';
  sort?: 'firstName' | 'lastName' | 'email';
  order?: 'asc' | 'desc';
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
    
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit == -1 ? '99999' : query.limit.toString());
    if (query.showActive !== undefined) params.append('showActive', query.showActive.toString());
    if (query.showInActive !== undefined) params.append('showInActive', query.showInActive.toString());
    if (query.firstName) params.append('firstName', query.firstName);
    if (query.lastName) params.append('lastName', query.lastName);
    if (query.email) params.append('email', query.email);
    if (query.student) params.append('student', query.student);
    if (query.balance) params.append('balance', query.balance);
    if (query.sort) params.append('sort', query.sort);
    if (query.order) params.append('order', query.order);

    const response = await apiClient.get<CustomersListResponse>(
      `/admin/v2/${location}/customers`,
      { params }
    );
    
    return response.data;
  } catch (error: unknown) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to fetch customers',
      data: {
        body: [],
        footer: {
          id: '',
          isActive: '',
          firstName: '',
          lastName: '',
          email: '',
          students: '',
          balance: '$0.00'
        },
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1
        }
      }
    };
  }
}

export async function getCustomerById(
  location: string,
  id: number
): Promise<CustomerRow | null> {
  try {
    const response = await apiClient.get<{ success: boolean; data: CustomerRow; message: string }>(
      `/admin/v2/${location}/customers/${id}`
    );
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
    console.error('Error fetching customer summary:', error);
    return {
      success: false,
      message: apiError.response?.data?.message || 'Failed to fetch customer summary',
      data: {
        lessonsDue: '$0.00',
        outstandingInvoice: '$0.00',
        totalCredits: '$0.00',
        balance: '$0.00'
      }
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
    console.error('Error fetching customer info:', error);
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
      return response.data.data.body.map(invoice => ({
        id: invoice.id,
        date: invoice.date,
        status: invoice.status,
        total: typeof invoice.total === 'string' 
          ? parseFloat(invoice.total.replace(/[$,]/g, ''))
          : invoice.total,
        balance: typeof invoice.balance === 'string'
          ? parseFloat(invoice.balance.replace(/[$,]/g, ''))
          : invoice.balance
      }));
    }
    
    return [];
  } catch (error: unknown) {
    console.error('Error fetching customer invoices:', error);
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
      const data = response.data.data.body.map(invoice => ({
        id: invoice.id,
        date: invoice.date,
        amount: parseFloat(invoice.amount.replace(/[$,]/g, '')),
        payments: parseFloat(invoice.payments.replace(/[$,]/g, '')),
        balanceDue: parseFloat(invoice.balanceDue.replace(/[$,]/g, ''))
      }));

      const totalAmount = response.data.data.footer?.[0]?.totalAmount 
        ? parseFloat(response.data.data.footer[0].totalAmount.replace(/[$,]/g, ''))
        : 0;

      return {
        data,
        pagination: response.data.data.pagination,
        footer: {
          totalAmount
        }
      };
    }
    
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      footer: {
        totalAmount: 0
      }
    };
  } catch (error: unknown) {
    console.error('Error fetching customer outstanding invoices:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      },
      footer: {
        totalAmount: 0
      }
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
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit === -1 ? '99999' : limit.toString());
    
    
    params.append('showAll', 'true');
    
    const url = `/admin/v2/${location}/customers/${customerId}/equipment-rentals`;
    
    
    const response = await apiClient.get<EquipmentRentalsResponse>(
      url,
      { params }
    );
    
   
    
    if (response.data.success && response.data.data.body) {
      const data = response.data.data.body.map(rental => ({
        student: rental.studentName,
        startDate: rental.startDate,
        returnDate: rental.returnDate,
        rentalTerm: rental.rentalTerm,
        depositAmount: typeof rental.depositAmount === 'string' 
          ? parseFloat(rental.depositAmount.replace(/[$,]/g, ''))
          : rental.depositAmount,
        equipmentReturned: rental.equipmentReturned,
        equipmentReturnedDate: rental.equipmentReturnedDate
      }));

      

      return {
        data,
        pagination: response.data.data.pagination
      };
    }
    
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };
  } catch (error: unknown) {
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      }
    };
  }
}

export async function getCustomerRecurringPayments(
  _location: string,
  _customerId: number
): Promise<RecurringPaymentData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [];
  }
  
  return [];
}

export async function getCustomerPrivateLessonDue(
  _location: string,
  _customerId: number
): Promise<PrivateLessonDueData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [
      { lessonDate: "Oct 13, 2025", student: "321123 123", program: "Ukulele", teacher: "Art Tatum", amount: 31.53 },
      { lessonDate: "Oct 20, 2025", student: "321123 123", program: "xPiano Core", teacher: "Alexander Hamilton", amount: 28.75 },
      { lessonDate: "Oct 27, 2025", student: "321123 123", program: "Guitar Core", teacher: "Amy Macaluso", amount: 32.50 },
      { lessonDate: "Oct 10, 2025", student: "321123 123", program: "xTrombone", teacher: "Daniel Clain", amount: 27.03 },
      { lessonDate: "Oct 17, 2025", student: "321123 123", program: "xGuitar Contemporary", teacher: "tes123 12345", amount: 31.53 },
      { lessonDate: "Oct 24, 2025", student: "321123 123", program: "xPiano Hybrid", teacher: "Art Tatum", amount: 28.75 },
      { lessonDate: "Oct 31, 2025", student: "321123 123", program: "Drums Core", teacher: "Alexander Hamilton", amount: 32.50 },
      { lessonDate: "Nov 07, 2025", student: "321123 123", program: "Ukulele", teacher: "Amy Macaluso", amount: 27.03 },
      { lessonDate: "Nov 14, 2025", student: "321123 123", program: "xPiano Core", teacher: "Daniel Clain", amount: 31.53 },
      { lessonDate: "Nov 21, 2025", student: "321123 123", program: "Guitar Core", teacher: "tes123 12345", amount: 28.75 },
      { lessonDate: "Nov 28, 2025", student: "321123 123", program: "xTrombone", teacher: "Art Tatum", amount: 32.50 },
      { lessonDate: "Dec 05, 2025", student: "321123 123", program: "xGuitar Contemporary", teacher: "Alexander Hamilton", amount: 27.03 },
      { lessonDate: "Dec 12, 2025", student: "321123 123", program: "xPiano Hybrid", teacher: "Amy Macaluso", amount: 31.53 },
      { lessonDate: "Dec 19, 2025", student: "321123 123", program: "Drums Core", teacher: "Daniel Clain", amount: 28.75 },
      { lessonDate: "Dec 26, 2025", student: "321123 123", program: "Ukulele", teacher: "tes123 12345", amount: 32.50 },
      { lessonDate: "Jan 02, 2026", student: "321123 123", program: "xPiano Core", teacher: "Art Tatum", amount: 27.03 },
      { lessonDate: "Jan 09, 2026", student: "321123 123", program: "Guitar Core", teacher: "Alexander Hamilton", amount: 31.53 },
      { lessonDate: "Jan 16, 2026", student: "321123 123", program: "xTrombone", teacher: "Amy Macaluso", amount: 28.75 },
      { lessonDate: "Jan 23, 2026", student: "321123 123", program: "xGuitar Contemporary", teacher: "Daniel Clain", amount: 32.50 },
      { lessonDate: "Jan 30, 2026", student: "321123 123", program: "xPiano Hybrid", teacher: "tes123 12345", amount: 27.03 },
      { lessonDate: "Feb 06, 2026", student: "321123 123", program: "Drums Core", teacher: "Art Tatum", amount: 32.50 },
      { lessonDate: "Feb 13, 2026", student: "321123 123", program: "Ukulele", teacher: "Alexander Hamilton", amount: 28.75 },
      { lessonDate: "Feb 20, 2026", student: "321123 123", program: "xPiano Core", teacher: "Amy Macaluso", amount: 32.50 },
      { lessonDate: "Feb 27, 2026", student: "321123 123", program: "Guitar Core", teacher: "Daniel Clain", amount: 31.53 },
      { lessonDate: "Mar 06, 2026", student: "321123 123", program: "xTrombone", teacher: "tes123 12345", amount: 31.53 },
    ];
  }
  
  return [];
}

export async function getCustomerGroupLessonDue(
  _location: string,
  _customerId: number
): Promise<GroupLessonDueData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [];
  }
  
  return [];
}

export async function getCustomerPayments(
  _location: string,
  _customerId: number
): Promise<PaymentData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [
      { date: "Mar 08, 2024", notes: "", amount: 3367.96, used: 3367.96, remaining: 0.00 },
      { date: "Mar 08, 2024", notes: "", amount: 122.50, used: 122.50, remaining: 0.00 },
      { date: "Nov 13, 2023", notes: "", amount: 18.45, used: 18.45, remaining: 0.00 },
      { date: "Oct 15, 2023", notes: "", amount: 13890.21, used: 13890.21, remaining: 0.00 },
      { date: "Sep 09, 2022", notes: "", amount: 60.27, used: 60.27, remaining: 0.00 },
      { date: "Sep 09, 2022", notes: "", amount: 4621.04, used: 4621.04, remaining: 0.00 },
    ];
  }
  
  return [];
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
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<StudentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/students`,
      { params }
    );
    
    return {
      data: response.data.data?.body || [],
      pagination: response.data.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
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
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<EnrolmentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/enrolments`,
      { params }
    );

    return {
      data: response.data.data?.body || [],
      pagination: response.data.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
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
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<PrivateLessonsResponse>(
      `/admin/v2/${location}/customers/${customerId}/private-lessons`,
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
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<GroupLessonsResponse>(
      `/admin/v2/${location}/customers/${customerId}/group-lessons`,
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
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit === -1 ? '99999' : limit.toString());

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

export async function getCustomerHistory(
  location: string,
  customerId: number,
  page: number = 1,
  limit: number = 10
): Promise<HistoryResult> {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit === -1 ? '99999' : limit.toString());

    const response = await apiClient.get<HistoryResponse>(
      `/admin/v2/${location}/customers/${customerId}/history`,
      { params }
    );
    return {
      data: response.data.data?.body || [],
      pagination: response.data.data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  } catch (error: unknown) {
    return { data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
  }
}
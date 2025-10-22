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
import { StudentData } from './tabConfigs';

export interface CustomerRow {
  id: number;
  isActive: boolean;
  firstName: string;
  lastName: string;
  email: string;
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

// NEW: Customer Info interfaces
export interface CustomerInfoData {
  profile: {
    name: string;
    role: string;
    referralSource: string;
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
    province: string;
    country: string;
    postalCode: string;
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

// NEW: Customer Info function
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
  _location: string,
  _customerId: number
): Promise<InvoiceData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [
      { id: "I-92268", date: "Oct 09, 2025", status: "Owing", total: 32.50, balance: 32.50 },
      { id: "I-92031", date: "Oct 06, 2025", status: "Owing", total: 31.53, balance: 31.53 },
      { id: "I-92030", date: "Oct 04, 2025", status: "Owing", total: 27.03, balance: 27.03 },
      { id: "I-92000", date: "Oct 03, 2025", status: "Owing", total: 28.75, balance: 28.75 },
      { id: "I-91911", date: "Oct 02, 2025", status: "Owing", total: 65.00, balance: 65.00 },
      { id: "I-91833", date: "Oct 01, 2025", status: "Owing", total: 45.25, balance: 45.25 },
      { id: "I-91853", date: "Sep 30, 2025", status: "Owing", total: 38.90, balance: 38.90 },
      { id: "I-91834", date: "Sep 29, 2025", status: "Owing", total: 52.15, balance: 52.15 },
      { id: "I-91831", date: "Sep 28, 2025", status: "Owing", total: 41.75, balance: 41.75 },
      { id: "I-91772", date: "Sep 27, 2025", status: "Owing", total: 33.40, balance: 33.40 },
    ];
  }
  
  return [];
}

export async function getCustomerOutstandingInvoices(
  _location: string,
  _customerId: number
): Promise<OutstandingInvoiceData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [
      { id: "I-33387", date: "Nov 07, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-33767", date: "Nov 14, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-34076", date: "Nov 21, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-34412", date: "Nov 28, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-34789", date: "Dec 05, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-35123", date: "Dec 12, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-35456", date: "Dec 19, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-35789", date: "Dec 26, 2022", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-36123", date: "Jan 02, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-36456", date: "Jan 09, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-36789", date: "Jan 16, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-37123", date: "Jan 23, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-37456", date: "Jan 30, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-37789", date: "Feb 06, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-38123", date: "Feb 13, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-38456", date: "Feb 20, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
      { id: "I-38789", date: "Feb 27, 2023", amount: 31.53, payments: 31.52, balanceDue: 0.00 },
    ];
  }
  
  return [];
}

export async function getCustomerEquipmentRentals(
  _location: string,
  _customerId: number
): Promise<EquipmentRentalData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return [];
  }
  
  return [];
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

export async function getCustomerStudents(
  location: string,
  customerId: number
): Promise<StudentData[]> {
  try {
    const response = await apiClient.get<StudentsResponse>(
      `/admin/v2/${location}/customers/${customerId}/students`
    );
    
    return response.data.data?.body || [];
  } catch (error: unknown) {
    return [];
  }
}


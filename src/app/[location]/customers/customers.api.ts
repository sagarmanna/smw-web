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

export interface CustomerRow {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  student: string;
  balance: number;
}

export interface CustomersListResponse {
  success: boolean;
  data: {
    items: CustomerRow[];
    total: number;
    page: number;
    pageSize: number;
  };
  message: string;
}

export interface CustomersQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string; // e.g. firstName,lastName,balance
  sortDir?: 'asc' | 'desc';
  search?: string;
  filter?: string; // optional server-side filter key
}

export async function getCustomers(
  location: string,
  query: CustomersQuery
): Promise<CustomersListResponse | null> {
  // Temporary mock toggle while API is not ready
  const USE_MOCK = true;

  if (USE_MOCK) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const sortBy = (query.sortBy as keyof CustomerRow | undefined) ?? 'lastName';
    const sortDir = query.sortDir ?? 'asc';
    const filter = query.filter; // 'active' | 'inactive' | undefined

    // Module-scoped mock DB
    const db = MOCK_DB;

    // Filter
    let filtered = db;
    if (filter === 'active') {
      filtered = db.filter(r => r.id % 2 === 0);
    } else if (filter === 'inactive') {
      filtered = db.filter(r => r.id % 2 !== 0);
    }

    // Sort
    if (sortBy) {
      filtered = [...filtered].sort((a, b) => {
        const va = a[sortBy];
        const vb = b[sortBy];
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        const sa = String(va ?? '').toLowerCase();
        const sb = String(vb ?? '').toLowerCase();
        return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
    }

    const total = filtered.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
      },
      message: 'Mock customers',
    };
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const response = await apiClient.get<CustomersListResponse>(
      `/admin/v2/${location}/customers/list`,
      {
        params: {
          page: query.page ?? 1,
          pageSize: query.pageSize ?? 20,
          sortBy: query.sortBy,
          sortDir: query.sortDir,
          search: query.search,
          filter: query.filter,
        },
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching customers list:', error);
    return null;
  }
}

// --------------------
// Mock data utilities
// --------------------

const FIRST_NAMES = [
  'Levi','Eren','Mikasa','Armin','Sasha','Hange','Erwin','Jean','Connie','Annie',
  'Gabi','Falco','Historia','Reiner','Bert','Pieck','Marco','Nicolo','Onyankopon','Ymir'
];

const LAST_NAMES = [
  'Ackerman','Yeager','Arlert','Braus','Zoe','Smith','Kirstein','Springer','Leonhart','Braun',
  'Finger','Bodt','Reiss','Hoover','Kozlowski','Galliard','Bott','Grier','Hughes','Fritz'
];

function generateMockRow(id: number): CustomerRow {
  const fn = FIRST_NAMES[id % FIRST_NAMES.length];
  const ln = LAST_NAMES[id % LAST_NAMES.length];
  const email = `${fn.toLowerCase()}.${ln.toLowerCase()}${id}@example.com`;
  const student = `${fn} ${ln}`;
  const balance = Math.round(((id * 73) % 20000 + (id % 3 === 0 ? 5000 : 0)) * 100) / 100; // up to ~25k
  return { id, firstName: fn, lastName: ln, email, student, balance };
}

const MOCK_DB: CustomerRow[] = Array.from({ length: 364 }, (_, i) => generateMockRow(i + 1));

export async function getCustomerById(
  location: string,
  id: number
): Promise<CustomerRow | null> {
  const USE_MOCK = true;
  if (USE_MOCK) {
    return MOCK_DB.find(r => r.id === id) ?? null;
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const response = await apiClient.get<{ success: boolean; data: CustomerRow; message: string }>(
      `/admin/v2/${location}/customers/${id}`,
      {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.success ? response.data.data : null;
  } catch (e) {
    console.error('Error fetching customer by id:', e);
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
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/invoices`);
  // return response.data;
  
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
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/outstanding-invoices`);
  // return response.data;
  
  return [];
}

export async function getCustomerEquipmentRentals(
  _location: string,
  _customerId: number
): Promise<EquipmentRentalData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return []; // Empty for now as shown in the image
  }
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/equipment-rentals`);
  // return response.data;
  
  return [];
}

export async function getCustomerRecurringPayments(
  _location: string,
  _customerId: number
): Promise<RecurringPaymentData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return []; // Empty for now as shown in the image
  }
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/recurring-payments`);
  // return response.data;
  
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
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/private-lesson-due`);
  // return response.data;
  
  return [];
}

export async function getCustomerGroupLessonDue(
  _location: string,
  _customerId: number
): Promise<GroupLessonDueData[]> {
  const USE_MOCK = true;
  
  if (USE_MOCK) {
    return []; // Empty for now as shown in the image
  }
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/group-lesson-due`);
  // return response.data;
  
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
  
  // Future API call
  // const response = await apiClient.get(`/admin/v2/${location}/customers/${customerId}/payments`);
  // return response.data;
  
  return [];
}



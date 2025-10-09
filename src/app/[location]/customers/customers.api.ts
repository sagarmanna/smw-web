import { apiClient } from '@/lib/api/client';

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




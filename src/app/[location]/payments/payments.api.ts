// Placeholder API layer for Payments page. Implement real HTTP calls later.

export interface PaymentDto {
  id: string;
  number: string;
  date: string; // ISO string
  customer: string;
  paymentMethod: string;
  notes?: string | null;
  reference?: string | null;
  amount: number;
}

export interface PaymentsListRequest {
  page: number;
  limit: number; // -1 for all
  search?: string;
  filters?: Partial<{
    number: string | null;
    dateFrom: string | null;
    dateTo: string | null;
    customer: string | null;
    paymentMethod: string | null;
    notes: string | null;
    reference: string | null;
    amount: string | null;
  }>;
}

export interface PaymentsListResponse {
  success: boolean;
  message?: string;
  body: PaymentDto[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export async function getPayments(_location: string, _req: PaymentsListRequest): Promise<PaymentsListResponse> {
  // TODO: Wire with backend. For now, return empty.
  return {
    success: true,
    body: [],
    pagination: { page: _req.page, limit: _req.limit, total: 0, totalPages: 1 },
  };
}



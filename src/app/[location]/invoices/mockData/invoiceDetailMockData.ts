import { InvoiceRow } from "../invoicesListing.api";
import { mockInvoiceData } from "./invoiceMockData";

// Invoice Item interface
export interface InvoiceItem {
  id: string;
  description: string;
  qty: number;
  price: number;
}

// Invoice Payment interface
export interface InvoicePayment {
  id: string;
  date: string;
  type: string;
  ref: string;
  notes: string;
  amount: number;
}

// Invoice Detail interface
export interface InvoiceDetail {
  id: number;
  number: string;
  date: string;
  status: string; // "Owing" | "Paid" | "Cancelled" | "Returned"
  customer: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
  };
  items: InvoiceItem[];
  payments: InvoicePayment[];
  totals: {
    discounts: number;
    subtotal: number;
    tax: number;
    total: number;
    paid: number;
    balance: number;
  };
  message?: string;
  comments?: string;
  history?: Array<{
    createdOn: string;
    message: string;
  }>;
}

// Generate mock invoice detail data based on listing data
export function generateInvoiceDetail(invoice: InvoiceRow): InvoiceDetail {
  const isPaid = invoice.status === "Paid";
  const isReturned = invoice.status === "Returned";
  const isCancelled = invoice.status === "Cancelled";
  
  // Generate items based on invoice
  const items: InvoiceItem[] = [
    {
      id: "1",
      description: `xPiano Core for ${invoice.student} with Teacher Name on ${invoice.date}`,
      qty: 0.5,
      price: invoice.total,
    },
  ];

  // Generate payments if paid
  const payments: InvoicePayment[] = isPaid
    ? [
        {
          id: "1",
          date: invoice.date,
          type: isReturned ? "Credit Used" : "Cash",
          ref: isReturned ? `I-${invoice.id - 26}` : "",
          notes: "",
          amount: -invoice.total,
        },
      ]
    : [];

  // Calculate totals
  const discounts = invoice.number === "I-97264" ? 2.08 : 0;
  const subtotal = invoice.total;
  const tax = 0;
  const total = subtotal;
  const paid = isPaid ? invoice.total : 0;
  const balance = total - paid;

  return {
    id: invoice.id,
    number: invoice.number,
    date: invoice.date,
    status: invoice.status,
    customer: {
      name: invoice.customer,
      phone: invoice.phone,
      email: `${invoice.customer.toLowerCase().replace(/\s+/g, "")}@example.com`,
    },
    items,
    payments,
    totals: {
      discounts,
      subtotal,
      tax,
      total,
      paid,
      balance,
    },
    message: "",
    comments: "",
    history: [
      {
        createdOn: invoice.date,
        message: `Invoice ${invoice.number} created`,
      },
    ],
  };
}

// Get mock invoice detail by ID
export function getMockInvoiceDetail(id: number): InvoiceDetail | null {
  const invoice = mockInvoiceData.find((inv: InvoiceRow) => inv.id === id);
  
  if (!invoice) {
    return null;
  }
  
  return generateInvoiceDetail(invoice);
}


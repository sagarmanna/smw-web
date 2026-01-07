import { InvoiceRow } from "../invoicesListing.api";
import { mockInvoiceData } from "./invoiceMockData";

// Invoice Item interface
export interface InvoiceItem {
  id: string;
  code?: string;
  royalty?: string;
  free?: string;
  description: string;
  qty: number;
  discount?: number;
  taxStatus?: string;
  tax?: number;
  unitPrice?: number;
  cost?: number;
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

/**
 * Generates a consistent customerId from customer name using djb2 hash algorithm.
 * This ensures the same customer always gets the same ID across different invoice generations.
 * 
 * @param customerName - The customer's name to generate an ID for
 * @returns A positive number between 1000 and 99999, or 0 if the name is empty
 */
function generateCustomerId(customerName: string): number {
  // Handle empty or whitespace-only names
  const trimmedName = customerName.trim();
  if (!trimmedName) {
    return 0;
  }

  // Use djb2 hash algorithm variant for better distribution
  let hash = 5381;
  for (let i = 0; i < trimmedName.length; i++) {
    hash = ((hash << 5) + hash) + trimmedName.charCodeAt(i);
    // Convert to 32-bit integer
    hash = hash | 0;
  }
  
  // Return a positive number between 1000 and 99999
  return Math.abs(hash % 99000) + 1000;
}

// Generate mock invoice detail data based on listing data
export function generateInvoiceDetail(invoice: InvoiceRow): InvoiceDetail {
  const isPaid = invoice.status === "Paid";
  const isReturned = invoice.status === "Returned";
  
  // Generate items based on invoice
  const items: InvoiceItem[] = [
    {
      id: "1",
      royalty: "No",
      free: "",
      description: `xGuitar Core for ${invoice.customer} with Teacher Name on ${invoice.date}`,
      qty: isReturned ? -0.5 : 0.5,
      discount: isReturned ? -0.86 : 0,
      taxStatus: "No Tax",
      tax: 0,
      unitPrice: 57.50,
      cost: 11.00,
      price: isReturned ? -invoice.total : invoice.total,
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

  // Generate customerId for consistent customer linking
  const customerId = generateCustomerId(invoice.customer);
  
  // Only include customerId if it's valid (non-zero)
  const customerData: InvoiceDetail["customer"] = {
    name: invoice.customer,
    phone: invoice.phone,
    email: `${invoice.customer.toLowerCase().replace(/\s+/g, "")}@example.com`,
  };
  
  if (customerId > 0) {
    customerData.customerId = customerId;
  }

  return {
    id: invoice.id,
    number: invoice.number,
    date: invoice.date,
    status: invoice.status,
    customer: customerData,
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


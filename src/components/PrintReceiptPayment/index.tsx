// @/component/printReceiptPayment/index.tsx

// @/component/printReceipt.ts

import type {
  CompanyInfo,
  CustomerInfo,
  TableConfig,
  PrintReceiptConfig,
  AllocationRow,
  GroupLessonRow,
  InvoiceRow,
  ReceiptRow,
  PaymentReceiptData,
  LocationDetails,
} from './types';

// Re-export types for convenience
export type {
  CompanyInfo,
  CustomerInfo,
  TableConfig,
  PrintReceiptConfig,
  AllocationRow,
  GroupLessonRow,
  InvoiceRow,
  ReceiptRow,
  PaymentReceiptData,
  LocationDetails,
};

export const DEFAULT_LOGO_URL = "/admin/v2/SMW.png";

// Helper: Transform LocationDetails to CompanyInfo (DRY)
export const transformLocationDetailsToCompanyInfo = (
  locationDetails: LocationDetails | null | undefined
): CompanyInfo | null => {
  if (!locationDetails) {
    return null;
  }

  // Combine city, province, and country into city field
  const cityParts = [locationDetails.city, locationDetails.province, locationDetails.country]
    .filter(Boolean)
    .join(", ");

  return {
    name: locationDetails.name || "",
    address: locationDetails.address || "",
    city: cityParts || "",
    postalCode: locationDetails.postalCode || "",
    phone: locationDetails.phoneNumber || "",
    email: locationDetails.email || "",
    website: "", // Website not in API response
  };
};

// Helper: Sanitize name
export const sanitizeName = (name?: string): string => {
  const cleaned = (name || '')
    .trim()
    .replace(/undefined/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || '';
};

// Helper: Generate table HTML
export const generateTableHtml = (
  title: string,
  headers: string[],
  rows: Array<Record<string, string>>,
  alignments?: string[]
): string => {
  if (rows.length === 0) return '';

  const headerRow = headers.map((h, i) => {
    const align = alignments?.[i] || 'left';
    return `<th style="text-align:${align};border:1px solid #ddd;padding:6px;">${h}</th>`;
  }).join('');

  const bodyRows = rows.map(row => {
    const cells = Object.values(row).map((cell, i) => {
      const align = alignments?.[i] || 'left';
      return `<td style="border:1px solid #ddd;padding:6px;text-align:${align};">${cell}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');

  return `
    <h3 style="margin:16px 0 8px;font-size:14px;">${title}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:12px;">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
};

// Helper: Generate company block
export const generateCompanyBlock = (companyInfo: CompanyInfo): string => {
  return `
    <div style="font-size:12px;">
      <div style="font-weight:600;">${companyInfo.name}</div>
      <div>${companyInfo.address}</div>
      <div>${companyInfo.city}</div>
      <div>${companyInfo.postalCode}</div>
      <div>${companyInfo.phone}</div>
      <div>${companyInfo.email}</div>
      <div>${companyInfo.website}</div>
    </div>`;
};

// Helper: Generate customer block
export const generateCustomerBlock = (customerInfo: CustomerInfo): string => {
  const safeName = sanitizeName(customerInfo.name);
  return `
    <div style="font-size:12px;">
      <div style="font-weight:600;">${safeName}</div>
      ${customerInfo.phone ? `<div>${customerInfo.phone}</div>` : ""}
      ${customerInfo.email ? `<div>${customerInfo.email}</div>` : ""}
    </div>`;
};

// Main: Generate complete print HTML
export const generatePrintReceiptHtml = (config: PrintReceiptConfig): string => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || '';
  const logoUrl = `${baseUrl}${config.logoUrl}`;
  
  const fromBlock = generateCompanyBlock(config.companyInfo);
  const toBlock = generateCustomerBlock(config.customerInfo);
  
  // Generate all tables
  const tablesHtml = config.tables
    .map(table => generateTableHtml(table.title, table.headers, table.rows, table.alignments))
    .join('');

  const body = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
        <h1 style="font-size:18px;margin:0;">${config.title}</h1>
        <div style="font-weight:600;">Amount Paid ${config.headerAmount}</div>
      </div>
      <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px;">
        <img src="${logoUrl}" alt="Logo" width="220" height="220" style="width: 220px; height: 220px; max-width: 220px; max-height: 220px; display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; object-fit: contain; flex-shrink: 0;" />
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;gap:24px;">
        <div><div style="font-size:12px;margin-bottom:6px;">From</div>${fromBlock}</div>
        <div><div style="font-size:12px;margin-bottom:6px;">To</div>${toBlock}</div>
      </div>
      <p style="font-size:12px;margin:12px 0 16px;">
        ${config.acknowledgmentMessage}
      </p>
      ${tablesHtml}
      ${config.footer ? `<div style="margin-top:16px;font-size:12px;">${config.footer}</div>` : ''}
    </div>`;

  return `
    <html>
    <head>
      <title>${config.title}</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        @media print {
          @page { margin: 16mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      </style>
    </head>
    <body>${body}</body>
    </html>`;
};

// Main: Open print dialog
export const openPrintDialog = (html: string): boolean => {
  try {
    const win = window.open("", "_blank");
    if (!win) {
      console.error("Failed to open print window. Pop-up might be blocked.");
      return false;
    }
    
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.focus();
    
    // Give time to render before printing
    setTimeout(() => win.print(), 150);
    return true;
  } catch (error) {
    console.error("Failed to open print dialog:", error);
    return false;
  }
};

// Convenience: Print receipt directly
export const printReceipt = (config: PrintReceiptConfig): boolean => {
  const html = generatePrintReceiptHtml(config);
  return openPrintDialog(html);
};

// Email helper: Generate email content (similar to print but without print styles)
export const generateEmailContent = (config: PrintReceiptConfig): string => {
  const tablesHtml = config.tables
    .map(table => generateTableHtml(table.title, table.headers, table.rows, table.alignments))
    .join('');

  return `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111;">
      <p>Please find the ${config.title} below</p>
      <p>${config.acknowledgmentMessage}</p>
      ${tablesHtml}
      ${config.footer ? `<div style="margin-top:16px;font-size:12px;">${config.footer}</div>` : ''}
      <p style="margin-top:16px;">Thank you,</p>
      <p>${config.companyInfo.name.split('(')[0].trim()} Team</p>
    </div>`;
};

// ===== PAYMENT RECEIPT SPECIFIC UTILITIES =====

// Payment Receipt Builder
export const buildPaymentReceiptConfig = (
  data: PaymentReceiptData,
  companyInfo?: CompanyInfo,
  logoUrl = DEFAULT_LOGO_URL
): PrintReceiptConfig => {
  // Use provided companyInfo, or transform from locationDetails
  const finalCompanyInfo = companyInfo 
    || transformLocationDetailsToCompanyInfo(data.locationDetails)
    || {
      name: "",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
      email: "",
      website: "",
    };
  const tables: TableConfig[] = [];

  // Lessons table
  if (data.allocationRows && data.allocationRows.length > 0) {
    tables.push({
      title: 'Lessons',
      headers: ['Original Date', 'Date', 'Student', 'Program', 'Teacher', 'Amount', 'Payment', 'Balance'],
      alignments: ['left', 'left', 'left', 'left', 'left', 'right', 'right', 'right'],
      rows: data.allocationRows.map(r => ({
        originalDate: r.originalDate,
        date: r.date,
        student: r.student,
        program: r.program,
        teacher: r.teacher,
        amount: r.amount,
        payment: r.payment,
        balance: r.balance,
      })),
    });
  }

  // Group Lessons table
  if (data.groupLessonRows && data.groupLessonRows.length > 0) {
    tables.push({
      title: 'Group Lessons',
      headers: ['Date', 'Student', 'Program', 'Invoiced ?', 'Amount', 'Balance'],
      alignments: ['left', 'left', 'left', 'left', 'right', 'right'],
      rows: data.groupLessonRows.map(r => ({
        date: r.date,
        student: r.student,
        program: r.program,
        invoiced: r.invoiced,
        amount: r.amount,
        balance: r.balance,
      })),
    });
  }

  // Invoices table
  if (data.invoiceRows && data.invoiceRows.length > 0) {
    tables.push({
      title: 'Invoices',
      headers: ['Date', 'Number', 'Amount', 'Payment', 'Balance'],
      alignments: ['left', 'left', 'right', 'right', 'right'],
      rows: data.invoiceRows.map(r => ({
        date: r.date,
        number: r.number,
        amount: r.amount,
        payment: r.payment,
        balance: r.balance,
      })),
    });
  }

  // Payments Used table
  if (data.receiptRows && data.receiptRows.length > 0) {
    tables.push({
      title: 'Payments Used',
      headers: ['Reference', 'Date', 'Payment Method', 'Amount'],
      alignments: ['left', 'left', 'left', 'right'],
      rows: data.receiptRows.map(r => ({
        reference: r.reference,
        date: r.date,
        method: r.method,
        amount: r.amount,
      })),
    });
  }

  // Build acknowledgment message
  const safeName = sanitizeName(data.customerName);
  const fromText = safeName ? ` from ${safeName}` : "";
  const dateText = data.paymentDate ? ` on ${data.paymentDate}` : "";
  const methodText = data.paymentMethod ? ` via ${data.paymentMethod}` : "";
  const acknowledgmentMessage = `This is to acknowledge the receipt of payment${fromText}${dateText} in the amount of ${data.headerAmount}${methodText}. We have distributed it to the items below.`;

  // Build footer
  const footer = data.hstNumber 
    ? `<div style="font-weight:600;">HST# <span style="font-weight:400">${data.hstNumber}</span></div>`
    : '';

  return {
    title: 'Payment Receipt',
    headerAmount: data.headerAmount,
    companyInfo: finalCompanyInfo,
    customerInfo: {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
    },
    acknowledgmentMessage,
    tables,
    footer,
    logoUrl,
  };
};

// Convenience function for payment receipts
export const printPaymentReceipt = (data: PaymentReceiptData): boolean => {
  const config = buildPaymentReceiptConfig(data);
  return printReceipt(config);
};

export const generatePaymentReceiptEmail = (data: PaymentReceiptData): string => {
  const config = buildPaymentReceiptConfig(data);
  return generateEmailContent(config);
};
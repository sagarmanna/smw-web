// @/component/printStatement/index.tsx

import type {
  CompanyInfo,
  CustomerInfo,
  TableConfig,
  PrintStatementConfig,
  StatementLessonRow,
  StatementGroupLessonRow,
  StatementInvoiceRow,
  StatementCreditRow,
  CustomerStatementData,
  LocationDetails,
} from "@/components/PrintStatement/types";

// Re-export types for convenience
export type {
  CompanyInfo,
  CustomerInfo,
  TableConfig,
  PrintStatementConfig,
  StatementLessonRow,
  StatementGroupLessonRow,
  StatementInvoiceRow,
  StatementCreditRow,
  CustomerStatementData,
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

  // Hardcode "Arcadia Academy Of Music" before location name from API
  const companyName = locationDetails.name 
    ? `Arcadia Academy Of Music (${locationDetails.name})`
    : "Arcadia Academy Of Music";

  return {
    name: companyName,
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

// Helper: Format currency
const formatCurrency = (value: number | string): string => {
  if (typeof value === 'string') {
    return value;
  }
  return `$${value.toFixed(2)}`;
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
export const generateCompanyBlock = (companyInfo: CompanyInfo | null): string => {
  if (!companyInfo || !companyInfo.name) {
    return `
    <div style="font-size:12px;">
      <div style="font-weight:600;">Arcadia Academy Of Music</div>
    </div>`;
  }
  
  return `
    <div style="font-size:12px;">
      <div style="font-weight:600;">${companyInfo.name}</div>
      ${companyInfo.address ? `<div>${companyInfo.address}</div>` : ""}
      ${companyInfo.city ? `<div>${companyInfo.city}</div>` : ""}
      ${companyInfo.postalCode ? `<div>${companyInfo.postalCode}</div>` : ""}
      ${companyInfo.phone ? `<div>${companyInfo.phone}</div>` : ""}
      ${companyInfo.email ? `<div>${companyInfo.email}</div>` : ""}
      ${companyInfo.website ? `<div>${companyInfo.website}</div>` : ""}
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
export const generatePrintStatementHtml = (config: PrintStatementConfig): string => {
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : process.env.NEXT_PUBLIC_BASE_URL || '';
  const logoUrl = `${baseUrl}${config.logoUrl}`;
  
  const fromBlock = generateCompanyBlock(config.companyInfo);
  const toBlock = generateCustomerBlock(config.customerInfo);
  
  // Generate all tables
  const tablesHtml = config.tables
    .map(table => generateTableHtml(
      table.title, 
      table.headers, 
      table.rows, 
      table.alignments
    ))
    .join('');

  // Show HST number if available (before balance)
  const hstHtml = config.hstNumber
    ? `<div style="margin-top:16px;font-size:12px;font-weight:600;">HST# <span style="font-weight:400">${config.hstNumber}</span></div>`
    : '';

  const body = `
    <div style="font-family:system-ui,-apple-system,sans-serif;color:#111;">
      <div style="display:flex;align-items:flex-start;gap:16px;margin-bottom:16px;">
        <img src="${logoUrl}" alt="Logo" width="220" height="220" style="width: 220px; height: 220px; max-width: 220px; max-height: 220px; display: block; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; object-fit: contain; flex-shrink: 0;" />
      </div>
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;gap:24px;">
        <div><div style="font-size:12px;margin-bottom:6px;">From</div>${fromBlock}</div>
        <div><div style="font-size:12px;margin-bottom:6px;">To</div>${toBlock}</div>
      </div>
      ${tablesHtml}
      ${hstHtml}
      <div style="margin-top:24px;font-size:14px;font-weight:600;text-align:right;">
        Total: ${config.totalBalance}
      </div>
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

// Convenience: Print statement directly
export const printStatement = (config: PrintStatementConfig): boolean => {
  const html = generatePrintStatementHtml(config);
  return openPrintDialog(html);
};

// ===== CUSTOMER STATEMENT SPECIFIC UTILITIES =====

// Customer Statement Builder
export const buildCustomerStatementConfig = (
  data: CustomerStatementData,
  companyInfo?: CompanyInfo,
  logoUrl = DEFAULT_LOGO_URL
): PrintStatementConfig => {
  // Use provided companyInfo, or transform from locationDetails
  let finalCompanyInfo = companyInfo || transformLocationDetailsToCompanyInfo(data.locationDetails);
  
  // If still null/empty, provide a minimal fallback with at least the company name
  if (!finalCompanyInfo || !finalCompanyInfo.name) {
    finalCompanyInfo = {
      name: "Arcadia Academy Of Music",
      address: "",
      city: "",
      postalCode: "",
      phone: "",
      email: "",
      website: "",
    };
  }
  const tables: TableConfig[] = [];

  // Lessons table
  if (data.lessonRows && data.lessonRows.length > 0) {
    tables.push({
      title: 'Lessons',
      headers: ['Date', 'Student', 'Program', 'Teacher', 'Amount'],
      alignments: ['left', 'left', 'left', 'left', 'right'],
      rows: data.lessonRows.map(r => ({
        date: r.date,
        student: r.student,
        program: r.program,
        teacher: r.teacher,
        amount: r.amount,
      })),
    });
  }

  // Group Lessons table
  if (data.groupLessonRows && data.groupLessonRows.length > 0) {
    tables.push({
      title: 'Group Lessons',
      headers: ['Date', 'Student', 'Program', 'Teacher', 'Amount'],
      alignments: ['left', 'left', 'left', 'left', 'right'],
      rows: data.groupLessonRows.map(r => ({
        date: r.date,
        student: r.student,
        program: r.program,
        teacher: r.teacher,
        amount: r.amount,
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

  // Credits table
  if (data.creditRows && data.creditRows.length > 0) {
    tables.push({
      title: 'Credits',
      headers: ['Type', 'Reference', 'Date', 'Amount'],
      alignments: ['left', 'left', 'left', 'right'],
      rows: data.creditRows.map(r => ({
        type: r.type,
        reference: r.reference,
        date: r.date,
        amount: r.amount,
      })),
    });
  }

  // Build footer (empty)
  const footer = '';

  return {
    title: 'Customer Statement',
    companyInfo: finalCompanyInfo,
    customerInfo: {
      name: data.customerName,
      phone: data.customerPhone,
      email: data.customerEmail,
    },
    tables,
    footer,
    logoUrl,
    hstNumber: data.hstNumber,
    totalBalance: data.totalBalance,
  };
};

// Convenience function for customer statements
export const printCustomerStatement = (data: CustomerStatementData): boolean => {
  const config = buildCustomerStatementConfig(data);
  return printStatement(config);
};


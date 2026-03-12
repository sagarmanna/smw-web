import type {
  InvoiceEmailStatementBody,
  InvoiceEmailStatementLineItem,
  InvoiceEmailStatementPayment,
  InvoiceEmailStatementTotals,
} from "./invoiceEmailStatement.api";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function toSafeText(value: string | number | null | undefined, fallback = ""): string {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  return escapeHtml(String(value));
}

function forceLeftAlignHtml(html: string): string {
  return html
    .replace(/\balign\s*=\s*"(center|right|justify)"/gi, 'align="left"')
    .replace(/\balign\s*=\s*'(center|right|justify)'/gi, "align='left'")
    .replace(/text-align\s*:\s*(center|right|justify)\s*;?/gi, "text-align:left;");
}

function renderLineItemRow(item: InvoiceEmailStatementLineItem): string {
  return `
    <tr>
      <td style="${CELL_STYLE}">${toSafeText(item.code, "-")}</td>
      <td style="${CELL_STYLE}">${toSafeText(item.description)}</td>
      <td style="${CELL_STYLE}">${toSafeText(item.qty)}</td>
      <td style="${CELL_STYLE}">${toSafeText(item.price)}</td>
    </tr>`;
}

function renderTotalsRow(label: string, value: string | undefined, fallback = "$0.00"): string {
  const isEmphasized = label === "Total" || label === "Balance";
  const labelStyle = isEmphasized
    ? `${HEADER_CELL_STYLE}font-weight:700;`
    : HEADER_CELL_STYLE;
  const valueStyle = isEmphasized
    ? `${VALUE_CELL_STYLE}font-weight:700;`
    : VALUE_CELL_STYLE;

  return `<tr><td style="${labelStyle}">${escapeHtml(label)}</td><td style="${valueStyle}">${toSafeText(value, fallback)}</td></tr>`;
}

function renderPaymentRow(payment: InvoiceEmailStatementPayment): string {
  return `
    <tr>
      <td style="${CELL_STYLE}">${toSafeText(payment.date)}</td>
      <td style="${CELL_STYLE}">${toSafeText(payment.type)}</td>
      <td style="${CELL_STYLE}">${toSafeText(payment.ref)}</td>
      <td style="${VALUE_CELL_STYLE}">${toSafeText(payment.amount)}</td>
    </tr>`;
}

const TABLE_STYLE =
  "width:100%;border-collapse:collapse;font-size:12px;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:16px 0;";
const HEADER_CELL_STYLE =
  "text-align:left !important;border:1px solid #ddd;padding:6px;background-color:#f3f4f6;font-weight:600;vertical-align:top;";
const CELL_STYLE =
  "border:1px solid #ddd;padding:6px;text-align:left !important;vertical-align:top;";
const VALUE_CELL_STYLE =
  "border:1px solid #ddd;padding:6px;text-align:right !important;vertical-align:top;";
const SECTION_TITLE_STYLE =
  "display:block;width:100%;font-size:14px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:16px 0 8px 0;text-align:left !important;";
const STACK_TABLE_STYLE =
  "width:100%;border-collapse:collapse;font-size:12px;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:0;";

function renderLineItemsTable(lineItems?: InvoiceEmailStatementLineItem[]): string {
  if (!lineItems?.length) {
    return "";
  }

  return `
<table style="${TABLE_STYLE}">
  <thead>
    <tr>
      <th style="${HEADER_CELL_STYLE}">Code</th>
      <th style="${HEADER_CELL_STYLE}">Description</th>
      <th style="${HEADER_CELL_STYLE}">Qty</th>
      <th style="${HEADER_CELL_STYLE}">Price</th>
    </tr>
  </thead>
  <tbody>
    ${lineItems.map(renderLineItemRow).join("")}
  </tbody>
</table>`;
}

function renderTotalsTable(totals?: InvoiceEmailStatementTotals): string {
  if (!totals) {
    return "";
  }

  return `
<table style="${STACK_TABLE_STYLE}">
  <tbody>
    ${renderTotalsRow("SubTotal", totals.subtotal)}
    ${renderTotalsRow("Tax", totals.tax)}
    ${renderTotalsRow("Total", totals.total)}
    ${renderTotalsRow("Paid", totals.paid)}
    ${renderTotalsRow("Balance", totals.balance)}
  </tbody>
</table>`;
}

function renderPaymentsTable(payments?: InvoiceEmailStatementPayment[]): string {
  if (!payments?.length) {
    return "";
  }

  return `
<table style="${STACK_TABLE_STYLE}">
  <thead>
    <tr>
      <th style="${HEADER_CELL_STYLE}">Date</th>
      <th style="${HEADER_CELL_STYLE}">Type</th>
      <th style="${HEADER_CELL_STYLE}">Reference</th>
      <th style="${HEADER_CELL_STYLE}">Amount</th>
    </tr>
  </thead>
  <tbody>
    ${payments.map(renderPaymentRow).join("")}
  </tbody>
</table>`;
}

function renderSummarySection(
  totals?: InvoiceEmailStatementTotals,
  payments?: InvoiceEmailStatementPayment[]
): string {
  const paymentsHtml = renderPaymentsTable(payments);
  const totalsHtml = renderTotalsTable(totals);

  if (!paymentsHtml && !totalsHtml) {
    return "";
  }

  return `
<table style="width:100%;border-collapse:collapse;margin:16px 0 0 0;">
  <tbody>
    <tr>
      <td style="width:74%;vertical-align:top;padding:0 12px 0 0;text-align:left;">
        <div align="left" style="display:block;width:100%;margin:0;padding:0;text-align:left !important;">
          <p align="left" style="display:block;width:100%;margin:0 0 8px 0;padding:0;text-align:left !important;font-size:14px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;color:#111;">
            Payments
          </p>
          ${paymentsHtml}
        </div>
      </td>
      <td style="width:26%;vertical-align:top;padding:0;text-align:left;">
        ${totalsHtml}
      </td>
    </tr>
  </tbody>
</table>`;
}

export function generateInvoiceEmailStatementContent(body?: InvoiceEmailStatementBody): string {
  const template = body?.emailTemplate;
  const content = body?.content;
  const headerHtml = forceLeftAlignHtml(template?.header || "");
  const footerHtml = forceLeftAlignHtml(template?.footer || "");
  const messageHtml = content?.message
    ? `<p style="text-align:left;margin:0 0 12px 0;">${escapeHtml(content.message)}</p>`
    : "";
  const hstHtml = content?.hstNumber
    ? `<p style="text-align:left;margin:12px 0 0 0;"><strong>HST# ${escapeHtml(content.hstNumber)}</strong></p>`
    : "";

  return `${headerHtml}${renderLineItemsTable(content?.lineItems)}${messageHtml}${renderSummarySection(content?.totals, content?.payments)}${hstHtml}${footerHtml}`;
}

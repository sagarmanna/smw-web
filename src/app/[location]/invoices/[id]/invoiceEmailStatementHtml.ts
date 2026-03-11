import type {
  InvoiceEmailStatementBody,
  InvoiceEmailStatementLineItem,
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

function renderLineItemRow(item: InvoiceEmailStatementLineItem): string {
  return `
    <tr>
      <td>${toSafeText(item.code, "-")}</td>
      <td>${toSafeText(item.description)}</td>
      <td>${toSafeText(item.qty)}</td>
      <td>${toSafeText(item.price)}</td>
    </tr>`;
}

function renderTotalsRow(label: string, value: string | undefined, fallback = "$0.00"): string {
  return `<tr><td>${escapeHtml(label)}</td><td>${toSafeText(value, fallback)}</td></tr>`;
}

function renderLineItemsTable(lineItems?: InvoiceEmailStatementLineItem[]): string {
  if (!lineItems?.length) {
    return "";
  }

  return `
<table>
  <thead>
    <tr>
      <th>Code</th>
      <th>Description</th>
      <th>Qty</th>
      <th>Price</th>
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
<table>
  <tbody>
    ${renderTotalsRow("SubTotal", totals.subtotal)}
    ${renderTotalsRow("Tax", totals.tax)}
    ${renderTotalsRow("Total", totals.total)}
    ${renderTotalsRow("Paid", totals.paid)}
    ${renderTotalsRow("Balance", totals.balance)}
  </tbody>
</table>`;
}

export function generateInvoiceEmailStatementContent(body?: InvoiceEmailStatementBody): string {
  const template = body?.emailTemplate;
  const content = body?.content;
  const messageHtml = content?.message ? `<p>${escapeHtml(content.message)}</p>` : "";
  const hstHtml = content?.hstNumber
    ? `<p><strong>HST# ${escapeHtml(content.hstNumber)}</strong></p>`
    : "";

  return `${template?.header || ""}${renderLineItemsTable(content?.lineItems)}${messageHtml}${renderTotalsTable(content?.totals)}${hstHtml}${template?.footer || ""}`;
}
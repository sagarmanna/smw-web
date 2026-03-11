import DOMPurify from "dompurify";
import type { InvoicePrintData } from "@/components/PrintInvoice/types";

export type { InvoicePrintData } from "@/components/PrintInvoice/types";

const DEFAULT_LOGO_URL = "/admin/v2/arcadia-master-logo.png";
const DEFAULT_WEBSITE = "www.arcadiamusicacademy.com";

const buildAddressLines = (parts: Array<string | null | undefined>): string[] =>
  parts.map((part) => (part || "").trim()).filter(Boolean);

const sanitizeRichHtml = (html: string | null | undefined): string => {
  if (!html) return "";
  return DOMPurify.sanitize(html);
};

export const generateInvoicePrintHtml = (data: InvoicePrintData): string => {
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_BASE_URL || "";
  const logoUrl = `${baseUrl}${DEFAULT_LOGO_URL}`;

  const locationLines = buildAddressLines([
    data.location.address,
    [data.location.city, data.location.province].filter(Boolean).join(", "),
    data.location.postalCode,
    data.location.phone,
    data.location.email,
    DEFAULT_WEBSITE,
  ]);

  const customerLines = buildAddressLines([
    data.customer.name,
    data.customer.address,
    [data.customer.city, data.customer.province].filter(Boolean).join(", "),
    data.customer.postalCode,
    data.customer.phone,
    data.customer.email,
  ]);

  const lineItemRows = data.lineItems
    .map(
      (item) => `
        <tr>
          <td>${item.code}</td>
          <td>${item.description}</td>
          <td class="num">${item.qty}</td>
          <td class="num">${item.unitPrice}</td>
          <td class="num">${item.tax}</td>
          <td class="num">${item.price}</td>
        </tr>
      `
    )
    .join("");

  const paymentRows = data.payments
    .map(
      (payment) => `
        <tr>
          <td>${payment.date}</td>
          <td>${payment.type}</td>
          <td>${payment.reference}</td>
          <td>${payment.notes}</td>
          <td class="num">${payment.amount}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.invoice.number}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { size: A4; margin: 14mm; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            color: #111827;
            font-size: 12px;
            line-height: 1.45;
          }
          .page {
            padding: 18px 20px 24px;
          }
          .brand {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 24px;
            margin-bottom: 24px;
          }
          .logo {
            width: 180px;
            height: auto;
            object-fit: contain;
          }
          .invoice-meta {
            min-width: 240px;
            text-align: right;
          }
          .invoice-meta h1 {
            margin: 0 0 8px;
            font-size: 28px;
            letter-spacing: 0.04em;
          }
          .meta-row {
            margin: 2px 0;
          }
          .party-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 28px;
            margin-bottom: 24px;
          }
          .section-label {
            margin-bottom: 8px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            color: #6b7280;
            text-transform: uppercase;
          }
          .party-block strong {
            display: block;
            margin-bottom: 4px;
            font-size: 13px;
          }
          .party-line {
            margin: 1px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #d1d5db;
            padding: 8px 10px;
            vertical-align: top;
          }
          th {
            background: #f3f4f6;
            text-align: left;
            font-size: 11px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
          }
          .num {
            text-align: right;
            white-space: nowrap;
          }
          .section {
            margin-top: 20px;
          }
          .section h2 {
            margin: 0 0 10px;
            font-size: 16px;
          }
          .totals {
            width: 320px;
            margin-left: auto;
            margin-top: 20px;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            padding: 6px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .totals-row strong {
            font-size: 13px;
          }
          .notes {
            margin-top: 20px;
          }
          .rich-text p {
            margin: 0 0 10px;
          }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
        <script>
          (function() {
            var hasPrinted = false;
            var printWhenReady = function() {
              if (hasPrinted) return;
              hasPrinted = true;
              window.focus();
              setTimeout(function() {
                try {
                  window.print();
                } catch (error) {
                  console.error('Failed to open print dialog:', error);
                }
              }, 300);
            };

            window.addEventListener('load', function() {
              var images = Array.prototype.slice.call(document.images || []);
              if (!images.length) {
                printWhenReady();
                return;
              }

              var pending = images.filter(function(img) {
                return !img.complete;
              }).length;

              if (!pending) {
                printWhenReady();
                return;
              }

              var resolve = function() {
                pending -= 1;
                if (pending <= 0) {
                  printWhenReady();
                }
              };

              images.forEach(function(img) {
                if (img.complete) return;
                img.addEventListener('load', resolve, { once: true });
                img.addEventListener('error', resolve, { once: true });
              });

              setTimeout(printWhenReady, 1200);
            }, { once: true });
          })();
        </script>
      </head>
      <body>
        <div class="page">
          <div class="brand">
            <img class="logo" src="${logoUrl}" alt="Arcadia Academy Of Music" />
            <div class="invoice-meta">
              <h1>${data.invoice.type || "Invoice"}</h1>
              <div class="meta-row"><strong>${data.invoice.number}</strong></div>
              <div class="meta-row">Date: ${data.invoice.date}</div>
              <div class="meta-row">Status: ${data.invoice.status}</div>
            </div>
          </div>

          <div class="party-grid">
            <div class="party-block">
              <div class="section-label">From</div>
              <strong>${data.location.name}</strong>
              ${locationLines.map((line) => `<div class="party-line">${line}</div>`).join("")}
              ${
                data.location.hstRegistrationNo
                  ? `<div class="party-line"><strong>HST#</strong> ${data.location.hstRegistrationNo}</div>`
                  : ""
              }
            </div>
            <div class="party-block">
              <div class="section-label">Bill To</div>
              ${customerLines
                .map((line, index) =>
                  index === 0 ? `<strong>${line}</strong>` : `<div class="party-line">${line}</div>`
                )
                .join("")}
            </div>
          </div>

          <div class="section">
            <h2>Line Items</h2>
            <table>
              <thead>
                <tr>
                  <th style="width: 12%;">Code</th>
                  <th>Description</th>
                  <th class="num" style="width: 10%;">Qty</th>
                  <th class="num" style="width: 14%;">Unit Price</th>
                  <th class="num" style="width: 12%;">Tax</th>
                  <th class="num" style="width: 14%;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemRows || `<tr><td colspan="6">No line items</td></tr>`}
              </tbody>
            </table>
          </div>

          ${
            paymentRows
              ? `
                <div class="section">
                  <h2>Payments</h2>
                  <table>
                    <thead>
                      <tr>
                        <th style="width: 18%;">Date</th>
                        <th style="width: 18%;">Type</th>
                        <th style="width: 18%;">Reference</th>
                        <th>Notes</th>
                        <th class="num" style="width: 16%;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>${paymentRows}</tbody>
                  </table>
                </div>
              `
              : ""
          }

          <div class="totals">
            <div class="totals-row"><span>Discount</span><span>${data.totals.discount}</span></div>
            <div class="totals-row"><span>Subtotal</span><span>${data.totals.subTotal}</span></div>
            <div class="totals-row"><span>Tax</span><span>${data.totals.tax}</span></div>
            <div class="totals-row"><strong>Total</strong><strong>${data.totals.total}</strong></div>
            <div class="totals-row"><span>Paid</span><span>${data.totals.paid}</span></div>
            <div class="totals-row"><strong>Balance</strong><strong>${data.totals.balance}</strong></div>
          </div>

          ${
            data.invoice.notes
              ? `
                <div class="notes">
                  <div class="section-label">Notes</div>
                  <div>${data.invoice.notes}</div>
                </div>
              `
              : ""
          }

          ${
            data.invoice.reminderNotes
              ? `
                <div class="notes">
                  <div class="section-label">Reminder Notes</div>
                  <div class="rich-text">${sanitizeRichHtml(data.invoice.reminderNotes)}</div>
                </div>
              `
              : ""
          }
        </div>
      </body>
    </html>
  `;
};

const buildLoadingHtml = (): string => `
  <!DOCTYPE html>
  <html>
    <head>
      <title>Preparing invoice...</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <style>
        body {
          margin: 0;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
          color: #111827;
          background: #ffffff;
        }
        .message {
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="message">Preparing invoice...</div>
    </body>
  </html>
`;

export const openInvoicePrintWindow = (): Window | null => {
  try {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      return null;
    }

    printWindow.document.open();
    printWindow.document.write(buildLoadingHtml());
    printWindow.document.close();
    return printWindow;
  } catch (error) {
    console.error("Failed to open invoice print window:", error);
    return null;
  }
};

export const printInvoice = (data: InvoicePrintData, printWindow?: Window | null): boolean => {
  try {
    const targetWindow = printWindow ?? openInvoicePrintWindow();
    if (!targetWindow) {
      return false;
    }

    targetWindow.document.open();
    targetWindow.document.write(generateInvoicePrintHtml(data));
    targetWindow.document.close();
    targetWindow.focus();

    return true;
  } catch (error) {
    console.error("Failed to print invoice:", error);
    return false;
  }
};

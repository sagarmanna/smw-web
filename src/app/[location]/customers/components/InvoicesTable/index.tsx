"use client";

import * as React from "react";
import { TableCard } from "@/components/TableCard";
import { InvoiceData, CUSTOMER_TABLE_CONFIGS } from "../../tableConfigs";
import { createBlankInvoice } from "@/lib/api/legacyApiAdapter";
import { getCustomerInvoices } from "../../customers.api";

interface InvoiceTableProps {
  data: InvoiceData[];
  loading?: boolean;
  id: string | number;
  onAddInvoice?: () => void;
  onPrintInvoice?: (invoiceId: string) => void;
  location: string;
  customerId: string | number;
  customerName?: string;
}

export function InvoiceTable({
  data,
  loading = false,
  onAddInvoice,
  location,
  customerId,
}: InvoiceTableProps) {
  const handlePrint = () => {
    const formatCurrencyPrint = (value: unknown) => {
      if (typeof value === "string") return value;
      const num = Number(value ?? 0);
      if (!Number.isFinite(num)) return "";
      return num.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
      });
    };

    // Helper to safely get studentName with fallback
    const getStudentName = (invoice: InvoiceData): string => {
      if (invoice.studentName && typeof invoice.studentName === "string" && invoice.studentName.trim()) {
        return invoice.studentName;
      }
      // Return empty string if not available
      return "";
    };

    const parseDate = (value: unknown): Date => {
      const s = typeof value === "string" ? value : String(value ?? "");
      const d = new Date(s);
      return isNaN(d.getTime()) ? new Date(0) : d;
    };

    const formatDMY = (d: Date): string => {
      const dd = d.getDate();
      const mm = d.getMonth() + 1;
      const yyyy = d.getFullYear();
      return `${dd}-${mm}-${yyyy}`;
    };

    // Filter for current month only
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const currentMonthData = data.filter((invoice) => {
      const invoiceDate = parseDate(invoice.date);
      return (
        invoiceDate.getMonth() === currentMonth &&
        invoiceDate.getFullYear() === currentYear
      );
    });

    const sorted = [...currentMonthData].sort(
      (a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()
    );
    
    // Set range to first and last day of current month
    const rangeStart = new Date(currentYear, currentMonth, 1);
    const rangeEnd = new Date(currentYear, currentMonth + 1, 0);

    // Open print in a new tab (not a popup window)
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups for this site to print");
      return;
    }
    try {
      printWindow.opener = null;
    } catch {}

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoices</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; color: #111827; }
            h1 { font-size: 22px; margin-bottom: 8px; }
            .range { font-size: 14px; margin-bottom: 16px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #000; padding: 8px 12px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .right { text-align: right; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <h1>Invoices</h1>
          <div class="range">${
            rangeStart && rangeEnd
              ? `${formatDMY(rangeStart)} - ${formatDMY(rangeEnd)}`
              : ""
          }</div>
          <table>
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Student Name</th>
                <th>Date</th>
                <th>Status</th>
                <th class="right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${sorted
                .map((invoice) => {
                  const studentName = getStudentName(invoice);
                  return `
                  <tr>
                    <td>${invoice.id ?? ""}</td>
                    <td>${studentName}</td>
                    <td>${invoice.date ?? ""}</td>
                    <td>${invoice.status ?? ""}</td>
                    <td class="right">${formatCurrencyPrint(invoice.total)}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { setTimeout(function(){ window.print(); }, 400); };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const showMore = Array.isArray(data) && data.length >= 10;

  return (
    <TableCard
      title="Invoices"
      data={data}
      columns={CUSTOMER_TABLE_CONFIGS.invoices.columns}
      loading={loading}
      onAdd={onAddInvoice}
      size={CUSTOMER_TABLE_CONFIGS.invoices.size}
      variant={CUSTOMER_TABLE_CONFIGS.invoices.variant}
      enableSorting={CUSTOMER_TABLE_CONFIGS.invoices.enableSorting}
      enableExport={CUSTOMER_TABLE_CONFIGS.invoices.enableExport}
      enablePrint={CUSTOMER_TABLE_CONFIGS.invoices.enablePrint}
      enableSearch={CUSTOMER_TABLE_CONFIGS.invoices.enableSearch}
      enableFilter={CUSTOMER_TABLE_CONFIGS.invoices.enableFilter}
      enableRowsPerPage={CUSTOMER_TABLE_CONFIGS.invoices.enableRowsPerPage}
      iconType="chevron"
      onRowClick={(row) => {
        const invoiceUrl = (row as InvoiceData & { url?: string }).url;
        if (invoiceUrl) {
          const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/${invoiceUrl}`;
          window.open(url, "_blank", "noopener");
        }
      }}
      dropdownItems={[
        {
          label: "Add Invoice",
          onClick: async () => {
            try {
              await createBlankInvoice(location, customerId);
            } catch (error) {
              console.error("Error creating invoice:", error);
            }
            finally {
              const invoices = await getCustomerInvoices(location, Number(customerId), 1);
              const firstInvoice = invoices[0];
              if (firstInvoice && firstInvoice.url) {
                const invoiceUrl = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/${firstInvoice.url}`;
                window.location.href = invoiceUrl;
              }
            }
          },
        },
        {
          label: "Print",
          onClick: () => {
            window.open(`${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/print/customer-invoice?id=${customerId}`, "_blank");
          },
        },
      ]}
      dropdownLabel="Invoice Actions"
      bottomContent={
        showMore ? (
          <a
            href={`${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/invoice/index?InvoiceSearch%5BcustomerId%5D=${customerId}&InvoiceSearch%5Btype%5D=2&InvoiceSearch%5BinvoiceDateRange%5D=`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Show More
          </a>
        ) : undefined
      }
    />
  );
}
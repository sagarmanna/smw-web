"use client";

import * as React from "react";
import { TableCard } from "@/components/TableCard";
import { InvoiceData, CUSTOMER_TABLE_CONFIGS } from "../../tableConfigs";

interface InvoiceTableProps {
  data: InvoiceData[];
  loading?: boolean;
  onAddInvoice?: () => void;
  onPrintInvoice?: (invoiceId: string) => void;
  location: string;
  customerId: string | number;
}

export function InvoiceTable({ 
  data, 
  loading = false,
  onAddInvoice,
  location,
  customerId
}: InvoiceTableProps) {
  
  const handlePrint = () => {
    const formatCurrencyPrint = (value: unknown) => {
      if (typeof value === "string") return value;
      const num = Number(value ?? 0);
      if (!Number.isFinite(num)) return "";
      return num.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
    };
    // Open new window for printing
    const printWindow = window.open('', '', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Please allow popups for this site to print');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Invoices</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 20px;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px 12px;
              text-align: left;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            @media print {
              body {
                padding: 10px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Invoices</h1>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(invoice => `
                <tr>
                  <td>${invoice.id ?? ''}</td>
                  <td>${invoice.date ?? ''}</td>
                  <td>${invoice.status ?? ''}</td>
                  <td>${formatCurrencyPrint(invoice.total)}</td>
                  <td>${formatCurrencyPrint(invoice.balance)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };
  
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
				onRowClick={() => {
					const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/invoice/view?id=${customerId}`;
					window.open(url, "_blank", "noopener");
				}}
				dropdownItems={[
					{
						label: "Add Invoice",
						onClick: () => {
							const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/invoice/view?id=${customerId}`;
							window.open(url, "_blank", "noopener");
						}
					},
					{
						label: "Print",
						onClick: handlePrint
					}
				]}
				dropdownLabel="Invoice Actions"
				bottomContent={
					<a
						href={`${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/invoice`}
            target="_blank"
            rel="noopener noreferrer"
						className="text-blue-600 hover:text-blue-800 font-medium"
					>
						Show More
					</a>
				}
		/>
	);
}
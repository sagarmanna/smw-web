"use client";

import * as React from "react";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { getPayments, getSales, PaymentsRow, SalesRow } from "./sales-and-payment.api";


interface SalesAndPaymentClientProps {
  location: string;
}

export function SalesAndPaymentClient({ location }: SalesAndPaymentClientProps) {
  const [sales, setSales] = React.useState<SalesRow[]>([]);
  const [payments, setPayments] = React.useState<PaymentsRow[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [range, setRange] = React.useState<{ from: Date; to: Date }>(() => {
    const now = new Date();
    const from = now;
    const to =now;
    return { from, to };
  });

  const formatRangeParam = (d: Date) => format(d, "yyyy-MM-dd");

  const load = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const startDate = formatRangeParam(range.from);
      const endDate = formatRangeParam(range.to);
      const [salesRes, paymentsRes] = await Promise.all([
        getSales(location, startDate, endDate),
        getPayments(location, startDate, endDate),
      ]);
      setSales(salesRes.success ? salesRes.data : []);
      setPayments(paymentsRes.success ? paymentsRes.data : []);
      if (!salesRes.success) setError(salesRes.message || "Failed to fetch sales");
      if (!paymentsRes.success) setError((prev) => prev ?? paymentsRes.message ?? "Failed to fetch payments");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unexpected error";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [location, range.from, range.to]);

  React.useEffect(() => {
    // initial and whenever date range/location changes
    load();
  }, [load]);

  const salesColumns = [
    { 
      accessorKey: "itemCategory", 
      header: "Item Category",
      cell: ({ row }: { row: { original: SalesRow & { isTotal?: boolean } } }) => {
        const value = row.original.itemCategory;
        const isTotal = row.original.isTotal;
        return isTotal ? '' : value;
      }
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }: { row: { original: SalesRow & { isTotal?: boolean } } }) => {
        const value = `$${row.original.subtotal.toFixed(2)}`;
        const isTotal = row.original.isTotal;
        return isTotal ? 
          <span className="font-bold text-right block">{value}</span> : 
          <span className="text-right block">{value}</span>;
      },
    },
    {
      accessorKey: "tax",
      header: "Tax",
      cell: ({ row }: { row: { original: SalesRow & { isTotal?: boolean } } }) => {
        const value = `$${row.original.tax.toFixed(2)}`;
        const isTotal = row.original.isTotal;
        return isTotal ? 
          <span className="font-bold text-right block">{value}</span> : 
          <span className="text-right block">{value}</span>;
      },
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: { row: { original: SalesRow & { isTotal?: boolean } } }) => {
        const value = `$${row.original.total.toFixed(2)}`;
        const isTotal = row.original.isTotal;
        return isTotal ? 
          <span className="font-bold text-right block">{value}</span> : 
          <span className="text-right block">{value}</span>;
      },
    },
  ];

  const paymentColumns = [
    { 
      accessorKey: "paymentMethod", 
      header: "Payment Method",
      cell: ({ row }: { row: { original: PaymentsRow & { isTotal?: boolean } } }) => {
        const value = row.original.paymentMethod;
        const isTotal = row.original.isTotal;
        return isTotal ? '' : value;
      }
    },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }: { row: { original: PaymentsRow & { isTotal?: boolean } } }) => {
        const value = `$${row.original.subtotal.toFixed(2)}`;
        const isTotal = row.original.isTotal;
        return isTotal ? 
          <span className="font-bold text-right block">{value}</span> : 
          <span className="text-right block">{value}</span>;
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading report..." className="text-center" />
      </div>
    );
  }

  const salesTotal = sales.reduce(
    (acc, r) => ({ subtotal: acc.subtotal + r.subtotal, tax: acc.tax + r.tax, total: acc.total + r.total }),
    { subtotal: 0, tax: 0, total: 0 }
  );
  const paymentsTotal = payments.reduce((acc, r) => acc + r.subtotal, 0);

  // Add total row to sales data
  const salesWithTotal = [
    ...sales,
    {
      itemCategory: '',
      subtotal: salesTotal.subtotal,
      tax: salesTotal.tax,
      total: salesTotal.total,
      isTotal: true
    }
  ];

  // Add total row to payments data
  const paymentsWithTotal = [
    ...payments,
    {
      paymentMethod: '',
      subtotal: paymentsTotal,
      isTotal: true
    }
  ];

  // Format selected date or range for display/print (avoid hook to keep order stable)
  const dateLabel = (() => {
    const from = range.from;
    const to = range.to;
    const sameDay = from.toDateString() === to.toDateString();
    if (sameDay) return format(from, "MMMM do, yyyy");
    const fromStr = format(from, "MMM do, yyyy");
    const toStr = format(to, "MMM do, yyyy");
    return `${fromStr} - ${toStr}`;
  })();

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const salesTableRows = salesWithTotal.map((row: SalesRow & { isTotal?: boolean }) => {
      const isTotal = row.isTotal;
      const fontWeight = isTotal ? 'font-weight: bold;' : '';
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${row.itemCategory || ''}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right; ${fontWeight}">$${row.subtotal.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right; ${fontWeight}">$${row.tax.toFixed(2)}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right; ${fontWeight}">$${row.total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const paymentsTableRows = paymentsWithTotal.map((row: PaymentsRow & { isTotal?: boolean }) => {
      const isTotal = row.isTotal;
      const fontWeight = isTotal ? 'font-weight: bold;' : '';
      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px;">${row.paymentMethod || ''}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right; ${fontWeight}">$${row.subtotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales and Payments Report - ${dateLabel}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .date {
              font-size: 16px;
              margin-bottom: 20px;
              color: #666;
            }
            h2 {
              font-size: 18px;
              margin-top: 30px;
              margin-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f0f0f0;
              border: 1px solid #ddd;
              padding: 10px;
              text-align: left;
              font-weight: bold;
            }
            td {
              border: 1px solid #ddd;
              padding: 8px;
            }
            @media print {
              body { margin: 0; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <h1>Sales and Payments Report</h1>
          <div class="date">${dateLabel}</div>
          
          <h2>Sales</h2>
          <table>
            <thead>
              <tr>
                <th>Item Category</th>
                <th style="text-align: right;">Subtotal</th>
                <th style="text-align: right;">Tax</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${salesTableRows}
            </tbody>
          </table>

          <h2>Payments</h2>
          <table>
            <thead>
              <tr>
                <th>Payment Method</th>
                <th style="text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${paymentsTableRows}
            </tbody>
          </table>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-card-foreground">Sales and Payments Report</h1>
            <div><DateRangePicker value={range} onChange={(r) => r && setRange(r)} /></div>
          </div>
          <div className="flex items-center gap-2">
            
            <Button variant="outline" size="icon" aria-label="Print report" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Sales */}
        <Card className="p-3 md:p-4">
          <h2 className="text-base font-semibold md:text-lg mb-2">Sales</h2>
          <CustomTable
          
            data={salesWithTotal}
            columns={salesColumns}
            enableSearch={false}
            enableExport={true}
            enableFilter={false}
            enablePrint={false}
            title={undefined}
          />
        </Card>

        {/* Payments */}
        <Card className="p-3 md:p-4">
          <h2 className="text-base font-semibold md:text-lg mb-2">Payments</h2>
          <CustomTable
            data={paymentsWithTotal}
            columns={paymentColumns}
            enableSearch={false}
            enableExport={true}
            enableFilter={false}
            enablePrint={false}
            title={undefined}
          />
        </Card>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}
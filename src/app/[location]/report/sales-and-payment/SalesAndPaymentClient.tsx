"use client";

import * as React from "react";
import { format } from "date-fns";
import { CustomTable } from "@/components/CustomTable";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Card } from "@/components/ui/card";
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
    const from = new Date(now.getFullYear(), now.getMonth(), 1);
    const to = new Date(now.getFullYear(), now.getMonth() + 1, 0);
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
    { accessorKey: "itemCategory", header: "Item Category" },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }: { row: { original: SalesRow } }) => `$${row.original.subtotal.toFixed(2)}`,
    },
    {
      accessorKey: "tax",
      header: "Tax",
      cell: ({ row }: { row: { original: SalesRow } }) => `$${row.original.tax.toFixed(2)}`,
    },
    {
      accessorKey: "total",
      header: "Total",
      cell: ({ row }: { row: { original: SalesRow } }) => `$${row.original.total.toFixed(2)}`,
    },
  ];

  const paymentColumns = [
    { accessorKey: "paymentMethod", header: "Payment Method" },
    {
      accessorKey: "subtotal",
      header: "Subtotal",
      cell: ({ row }: { row: { original: PaymentsRow } }) => `$${row.original.subtotal.toFixed(2)}`,
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

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
      <div className="mx-auto max-w-screen-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-card-foreground">Sales and Payments Summary</h1>
          <DateRangePicker value={range} onChange={(r) => r && setRange(r)} />
        </div>

        {/* Sales */}
        <Card className="p-3 md:p-4">
          <h2 className="text-base font-semibold md:text-lg mb-2">Sales</h2>
          <CustomTable<SalesRow, unknown>
            data={sales}
            columns={salesColumns}
            enableSearch={false}
            enableExport={true}
            enableFilter={false}
            enablePagination={true}
            enablePrint={true}
            enableShowAll={true}
            pageSize={10}
            title={undefined}
          />
          <div className="mt-3 text-sm text-muted-foreground">
            <span className="mr-6">Subtotal: ${salesTotal.subtotal.toFixed(2)}</span>
            <span className="mr-6">Tax: ${salesTotal.tax.toFixed(2)}</span>
            <span>Total: ${salesTotal.total.toFixed(2)}</span>
          </div>
        </Card>

        {/* Payments */}
        <Card className="p-3 md:p-4">
          <h2 className="text-base font-semibold md:text-lg mb-2">Payments</h2>
          <CustomTable<PaymentsRow, unknown>
            data={payments}
            columns={paymentColumns}
            enableSearch={false}
            enableExport={true}
            enableFilter={false}
            enablePagination={true}
            enablePrint={true}
            enableShowAll={true}
            pageSize={10}
            title={undefined}
          />
          <div className="mt-3 text-sm text-muted-foreground">
            <span>Total: ${paymentsTotal.toFixed(2)}</span>
          </div>
        </Card>
        {error && (
          <div className="text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  );
}



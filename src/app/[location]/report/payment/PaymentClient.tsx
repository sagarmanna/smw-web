"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { getPaymentList, Payment, PaymentSummary } from "./payment.api";

import { ReportPageLayout } from "@/components/ReportPageLayout";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatCurrency } from "@/utils/formatCurrency";
import { LoadingAnimation } from "@/components/LoadingAnimation";

const allPaymentsColumns: ColumnDef<Payment>[] = [
  { accessorKey: "paymentDate", header: "Date", size: 150, meta: { printable: true, printableName: "Date" } },
  { accessorKey: "paymentMethodName", header: "Payment Method", size: 150, meta: { printable: true, printableName: "Payment Method" } },
  { accessorKey: "paymentId", header: "Payment ID", size: 150, meta: { printable: true, printableName: "Payment ID" } },
  { accessorKey: "customer", header: "Customer", size: 200, meta: { printable: true, printableName: "Customer" } },
  { accessorKey: "reference", header: "Reference", size: 150, meta: { printable: true, printableName: "Reference" }, cell: ({ row }) => row.original.reference || "N/A" },
  { 
    accessorKey: "amount", 
    header: "Amount", 
    size: 120, 
    cell: ({ row }) => formatCurrency(Number(row.original.amount)),
    meta: { printable: true, printableName: "Amount", exportFormatter: (value) => formatCurrency(Number(value)) }
  },
];

const summaryColumns: ColumnDef<PaymentSummary>[] = [
  { accessorKey: "paymentDate", header: "Date", size: 250, meta: { printable: true, printableName: "Date" } },
  { accessorKey: "paymentMethod", header: "Payment Method", size: 250, meta: { printable: true, printableName: "Payment Method" } },
  { 
    accessorKey: "amount", 
    header: "Amount", 
    size: 250, 
    cell: ({ row }) => formatCurrency(Number(row.original.amount)),
    meta: { printable: true, printableName: "Amount", exportFormatter: (value) => formatCurrency(Number(value)) }
  },
];

// Client Component
export const PaymentClient = ({ location }: { location: string }) => {
  const [data, setData] = React.useState<(Payment | PaymentSummary)[]>([]);
  const [pagination, setPagination] = React.useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [dateRange, setDateRange] = React.useState({ from: new Date(), to: new Date() });
  const [footer, setFooter] = React.useState<{ amount: string; } | null>(null);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);

  const fetchPayments = React.useCallback(async (page: number, limit: number, startDate?: Date, endDate?: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const actualLimit = limit === -1 ? 999999 : limit;
      const sort = sorting[0];
      const summaryOnly = activeFilter === 'summary_only';

      const response = await getPaymentList(location, {
        page,
        limit: actualLimit,
        startDate: startDate || dateRange.from,
        endDate: endDate || dateRange.to,
        sort: sort?.id,
        order: sort ? (sort.desc ? 'desc' : 'asc') : undefined,
        summaryOnly,
      });

      if (response.success) {
        setData(response.data.body || []);
        setPagination(response.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
        setFooter(response.data.footer);
      } else {
        setError(response.message || "An unknown error occurred");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [location, dateRange, sorting, activeFilter]);

  React.useEffect(() => {
    fetchPayments(1, rowsPerPage, dateRange.from, dateRange.to);
  }, [fetchPayments, dateRange.from, dateRange.to, rowsPerPage]);
  
  const handlePageChange = (newPage: number) => {
    fetchPayments(newPage, rowsPerPage, dateRange.from, dateRange.to);
  };
  
  const handleDateRangeChange = (newDateRange: { from: Date; to: Date }) => {
    setDateRange(newDateRange);
    fetchPayments(1, rowsPerPage, newDateRange.from, newDateRange.to);
  };

  const handleFilterChange = (filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const refetch = () => {
    fetchPayments(pagination.page, rowsPerPage, dateRange.from, dateRange.to);
  };

  const columns = React.useMemo(() => {
    return activeFilter === 'summary_only' ? summaryColumns : allPaymentsColumns;
  }, [activeFilter]);

  const footerRow = React.useMemo(() => {
    if (!footer) return undefined;
    
    if (activeFilter === 'summary_only') {
      return {
        paymentDate: "TOTAL",
        paymentMethod: "",
        amount: footer.amount,
      };
    }
    
    return {
      paymentId: "",
      paymentDate: "TOTAL",
      amount: footer.amount,
      paymentMethodId: 0,
      paymentMethodName: "",
      customer: "",
      userId: "",
      reference: null,
    };
  }, [footer, activeFilter]);

  const { handlePrint } = usePrintReport<(Payment | PaymentSummary)>();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading payments data..." className="text-center" />
      </div>
    );
  }

  return (
    <ReportPageLayout
      title="Payments"
      subtitle="View and export payment records"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
    >
      <CustomTable
        columns={columns as ColumnDef<(Payment | PaymentSummary)>[]}
        data={data}
        footerRow={footerRow}
        isLoading={isLoading}
        size="compact"
        variant="default"
        enablePrint={true}
        onPrint={() => handlePrint({ 
          reportTitle: 'Payments Report', 
          columns: columns as ColumnDef<Payment | PaymentSummary>[], 
          data, 
          footer: footerRow,
          location,
          dateRange,
        })}
        enableDateRangePicker={true}
        manualSorting={true}
        sorting={sorting}
        onSortingChange={setSorting}
        serverSidePagination={pagination}
        onServerSidePageChange={handlePageChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        enableSearch={false}
        enableExport={false}
        enableFilter={true}
        serverSideFilterOptions={[
          { key: 'summary_only', label: 'Summary Only' },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleFilterChange}
        defaultFilterLabel="All Payments"
        enableRowsPerPage={true}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          fetchPayments(1, newRowsPerPage, dateRange.from, dateRange.to);
        }}
      />
    </ReportPageLayout>
  );
};

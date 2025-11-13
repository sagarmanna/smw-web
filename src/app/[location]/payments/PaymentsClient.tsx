"use client";
 
import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { PaymentsReceivePaymentModal } from "./components/PaymentReceipt";
import { getPayments, PaymentDto } from "./payments.api";
 
interface PaymentsClientProps {
  location: string;
}
 
interface PaymentRow {
  id: string;
  number: string;
  date: Date;
  customer: string;
  paymentMethod: string;
  notes?: string | null;
  reference?: string | null;
  amount: number;
}
 
export function PaymentsClient({ location }: PaymentsClientProps) {
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [page, setPage] = React.useState<number>(1);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: false } // Default: sort by date in ASC order (shows ↓ arrow)
  ]);
  const [selectedRow, setSelectedRow] = React.useState<PaymentRow | null>(null);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [payments, setPayments] = React.useState<PaymentRow[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
 
  // Helper function to parse amount string to number
  const parseAmount = (amountStr: string): number => {
    return parseFloat(amountStr.replace(/[$,]/g, '')) || 0;
  };
 
  // Helper function to parse date string
  const parseDate = (dateStr: string): Date => {
    return new Date(dateStr);
  };
 
  // Fetch payments from API
  const fetchPayments = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
 
    try {
      const cf = columnFilters as {
        number?: string;
        date?: { from?: Date; to?: Date };
        customer?: string;
        paymentMethod?: string;
        amount?: string;
      };
 
      // Build filters object - only include filters that have actual values
      const filters: {
        number?: string;
        from?: string;
        to?: string;
        customer?: string;
        paymentMethod?: string;
        amount?: string;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
      } = {};
 
      if (cf.number?.trim()) filters.number = cf.number;
      if (cf.date?.from) filters.from = format(cf.date.from, 'yyyy-MM-dd');
      if (cf.date?.to) filters.to = format(cf.date.to, 'yyyy-MM-dd');
      if (cf.customer?.trim()) filters.customer = cf.customer;
      if (cf.paymentMethod && cf.paymentMethod !== 'All') filters.paymentMethod = cf.paymentMethod;
      if (cf.amount?.trim()) filters.amount = cf.amount;
      
      // Convert TanStack sorting to API format
      // Always send sorting parameters
      if (sorting.length > 0) {
        const sort = sorting[0];
        filters.sortBy = sort.id;
        filters.sortOrder = sort.desc ? 'DESC' : 'ASC';
      } else {
        // Default sorting when no column is sorted
        filters.sortBy = 'date';
        filters.sortOrder = 'ASC';
      }
 
      // If "All" is selected (-1), use a large number to fetch all records
      const actualLimit = rowsPerPage === -1 ? 999999 : rowsPerPage;
      const response = await getPayments(location, page, actualLimit, filters);
 
      // Transform API data to PaymentRow format
      const transformedData: PaymentRow[] = response.data.map((payment: PaymentDto) => ({
        id: payment.id.toString(),
        number: payment.number,
        date: parseDate(payment.date),
        customer: payment.customer,
        paymentMethod: payment.paymentMethod,
        notes: payment.notes || null,
        reference: payment.reference || null,
        amount: parseAmount(payment.amount),
      }));
 
      setPayments(transformedData);
      setPagination(response.pagination);
    } catch {
      setError('Failed to load payments. Please try again.');
      setPayments([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [location, page, rowsPerPage, columnFilters, sorting]);
 
  // Fetch payments on mount and when dependencies change
  React.useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);
 
  // Client-side search uses CustomTable's getSearchValue
  const getSearchValue = React.useCallback((row: PaymentRow) => {
    return [
      row.number,
      format(row.date, "yyyy-MM-dd"),
      row.customer,
      row.paymentMethod,
      row.notes ?? "",
      row.reference ?? "",
      String(row.amount),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  }, []);
 
  const numberOptions = React.useMemo(() => 
    Array.from(new Set(payments.map(r => r.number))).map(n => ({ value: n, label: n })),
    [payments]
  );

  // Handle sorting changes
  // Sorting UI behavior:
  // - ASC (desc: false) → Shows ↓ arrow (indicates next click goes to DESC)
  // - DESC (desc: true) → Shows ↑ arrow (indicates next click goes to ASC)
  const handleSortingChange = React.useCallback((newSorting: SortingState) => {
    setSorting(newSorting);
    setPage(1); // Reset to first page when sorting changes
  }, []);
 
  const columns = React.useMemo<ColumnDef<PaymentRow>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Number",
        size: 160,
        filter: { type: "dropdown", options: numberOptions },
        enableSorting: true,
      },
      {
        accessorKey: "date",
        header: "Date",
        size: 180,
        cell: ({ row }) => format(row.original.date, "MMM dd, yyyy"),
        meta: { printable: true, printableName: "Date" },
        filter: {
          type: "date-range",
          initialValue: undefined,
          quickPreset: "payments",
          allowClear: true
        },
        enableSorting: true,
      },
      {
        accessorKey: "customer",
        header: "Customer",
        size: 240,
        filter: { type: "string" },
        enableSorting: true,
      },
      {
        accessorKey: "paymentMethod",
        header: "Payment Method",
        size: 180,
        filter: {
          type: "dropdown",
          options: [
            { value: "", label: "All" },
            { value: "Cash", label: "Cash" },
            { value: "Visa", label: "Visa" },
            { value: "Mastercard", label: "Mastercard" },
            { value: "Amex", label: "Amex" },
            { value: "Cheque", label: "Cheque" },
            { value: "Debit", label: "Debit" },
            { value: "E-Transfer", label: "E-Transfer" },
            { value: "Gift Card", label: "Gift Card" },
            { value: "Account Entry", label: "Account Entry" },
          ],
        },
        enableSorting: true,
      },
      {
        accessorKey: "notes",
        header: "Notes",
        size: 260,
        cell: ({ row }) => row.original.notes ?? "",
        enableSorting: false,
      },
      {
        accessorKey: "reference",
        header: "Reference",
        size: 160,
        cell: ({ row }) => row.original.reference ?? "",
        enableSorting: false,
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 140,
        cell: ({ row }) => formatCurrency(row.original.amount),
        filter: { type: "string" },
        enableSorting: true,
      },
    ],
    [numberOptions]
  );
 
  const handleColumnFilterChange = React.useCallback((columnKey: string, value: unknown) => {
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      
      // Special handling for date filters - explicitly handle undefined to trigger reset
      if (columnKey === 'date') {
        if (value === undefined || value === null) {
          delete newFilters[columnKey];
        } else if (typeof value === 'object' && value !== null) {
          const dateObj = value as { from?: Date; to?: Date };
          if (!dateObj.from && !dateObj.to) {
            delete newFilters[columnKey];
          } else {
            newFilters[columnKey] = value;
          }
        }
      }
      // Remove filter if value is empty/null/undefined
      else if (!value) {
        delete newFilters[columnKey];
      } else if (typeof value === 'string' && value.trim() === '') {
        delete newFilters[columnKey];
      } else if (typeof value === 'object' && value !== null) {
        const obj = value as Record<string, unknown>;
        if (Object.keys(obj).length === 0) {
          delete newFilters[columnKey];
        } else {
          newFilters[columnKey] = value;
        }
      } else {
        newFilters[columnKey] = value;
      }
      
      return newFilters;
    });
    setPage(1);
  }, []);
 
  // Handler for retry
  const handleRetry = React.useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);
 
  // Handler for new payment button
  const handleNewPayment = React.useCallback(() => {
    setSelectedRow(null);
    setModalOpen(true);
  }, []);
 
  // Handler for row click
  const handleRowClick = React.useCallback((row: PaymentRow) => {
    setSelectedRow(row);
    setModalOpen(true);
  }, []);
 
  // Handler for modal save success - refresh the list
  const handleModalSaveSuccess = React.useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);
 
  return (
    <ReportPageLayout
      title="Payments"
      subtitle="Browse all payments, search and sort"
      isLoading={isLoading}
      error={error}
      onRetry={handleRetry}
      actions={
        <Button className="bg-primary hover:bg-primary/90" onClick={handleNewPayment}>
          <Plus className="h-4 w-4 mr-2" />
          Receive Payment
        </Button>
      }
    >
      <CustomTable<PaymentRow, unknown>
        columns={columns}
        data={payments}
        size="compact"
        variant="default"
        enableSearch={false}
        searchPlaceholder="Search payments..."
        getSearchValue={(row) => getSearchValue(row as PaymentRow)}
        enablePrint={false}
        enableExport={false}
        customHeaderComponent={null}
        showRecordCountInToolbar={true}
        enableRowsPerPage={true}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 20, 50, 100]}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(1);
        }}
        serverSidePagination={pagination}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        hideRecordCount={true}
        enableColumnFilters={true}
        columnFilters={columnFilters}
        onColumnFilterChange={handleColumnFilterChange}
        columnFilterPlaceholders={{
          number: "Number",
          date: "Select Date Range",
          customer: "Customer",
          paymentMethod: "Payment Method",
          amount: "Amount",
        }}
        enableSorting={true}
        sorting={sorting}
        onSortingChange={handleSortingChange}
        key={JSON.stringify(columnFilters.date || null)}
        stickyHeader={true}
        onRowClick={handleRowClick}
      />
      
      {/* Payment Modal - completely self-contained */}
      <PaymentsReceivePaymentModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setSelectedRow(null);
          }
        }}
        location={location}
        paymentId={selectedRow?.id}
        onSaveSuccess={handleModalSaveSuccess}
      />
    </ReportPageLayout>
  );
}
"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { PaymentsReceiptModal } from "./components/PaymentReceipt/ReceivePayment";
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
  const [selectedRow, setSelectedRow] = React.useState<PaymentRow | null>(null);
  const [receiptOpen, setReceiptOpen] = React.useState<boolean>(false);
  const [receiveOpen, setReceiveOpen] = React.useState<boolean>(false);
  
  // API states
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
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
    // Format: "Nov 10, 2025"
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
      } = {};

      if (cf.number && cf.number.trim() !== '') {
        filters.number = cf.number;
      }
      
      // Add date filters - check if date object exists and has from/to properties
      if (cf.date && typeof cf.date === 'object') {
        if (cf.date.from) {
          filters.from = format(cf.date.from, 'yyyy-MM-dd');
          console.log('Date filter FROM:', filters.from, 'Original:', cf.date.from);
        }
        if (cf.date.to) {
          filters.to = format(cf.date.to, 'yyyy-MM-dd');
          console.log('Date filter TO:', filters.to, 'Original:', cf.date.to);
        }
      }
      
      if (cf.customer && cf.customer.trim() !== '') {
        filters.customer = cf.customer;
      }
      if (cf.paymentMethod && cf.paymentMethod !== '' && cf.paymentMethod !== 'All') {
        filters.paymentMethod = cf.paymentMethod;
      }
      if (cf.amount && cf.amount.trim() !== '') {
        filters.amount = cf.amount;
      }

      console.log('Fetching payments with filters:', filters);

      const response = await getPayments(location, page, rowsPerPage, filters);

      console.log('API Response:', response);

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

      console.log('Transformed data count:', transformedData.length);

      setPayments(transformedData);
      setPagination(response.pagination);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Failed to load payments. Please try again.');
      setPayments([]);
      setPagination({ page: 1, limit: 20, total: 0, totalPages: 1 });
    } finally {
      setIsLoading(false);
    }
  }, [location, page, rowsPerPage, columnFilters]);

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

  const numberOptions = React.useMemo(() => {
    return Array.from(new Set(payments.map(r => r.number))).map(n => ({ value: n, label: n }));
  }, [payments]);

  const columns = React.useMemo<ColumnDef<PaymentRow>[]>(
    () => [
      {
        accessorKey: "number",
        header: "Number",
        size: 160,
        filter: { type: "dropdown", options: numberOptions },
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
          quickPreset: "payments" 
        },
      },
      {
        accessorKey: "customer",
        header: "Customer",
        size: 240,
        filter: { type: "string" },
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
      },
      {
        accessorKey: "notes",
        header: "Notes",
        size: 260,
        cell: ({ row }) => row.original.notes ?? "",
      },
      {
        accessorKey: "reference",
        header: "Reference",
        size: 160,
        cell: ({ row }) => row.original.reference ?? "",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        size: 140,
        cell: ({ row }) => formatCurrency(row.original.amount),
        filter: { type: "string" },
      },
    ],
    [numberOptions]
  );

  const handleColumnFilterChange = React.useCallback((columnKey: string, value: unknown) => {
    console.log('Column filter changed:', columnKey, value);
    setColumnFilters((prev) => ({ ...prev, [columnKey]: value }));
    setPage(1); // Reset to first page when filters change
  }, []);

  // Handler for saving new payment
  const handlePaymentSaved = React.useCallback(() => {
    fetchPayments(); // Refresh payments list after saving
    setReceiveOpen(false);
  }, [fetchPayments]);

  // Handler for retry
  const handleRetry = React.useCallback(() => {
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
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setReceiveOpen(true)}>
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
        stickyHeader={true}
        onRowClick={(row) => {
          setSelectedRow(row);
          setReceiptOpen(true);
        }}
      />
      
      {/* Payment Receipt Modal */}
      <PaymentsReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        row={selectedRow || undefined}
        locationName={location}
      />
      
      {/* Receive Payment Modal - NO customerId prop = Dropdown Mode */}
      <PaymentsReceivePaymentModal
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        onSave={handlePaymentSaved}
        location={location}
        // Don't pass customerId to trigger dropdown mode
      />
    </ReportPageLayout>
  );
}
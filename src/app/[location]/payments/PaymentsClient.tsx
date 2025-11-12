"use client";
 
import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { PaymentsReceivePaymentModal } from "./components/RecivedPaymentModalWrapper";
import { PaymentReceiptModalWrapper } from "./components/PaymentReceiptModalWrapper/index";
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
  const [rowsPerPage, setRowsPerPage] = React.useState(20);
  const [page, setPage] = React.useState(1);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<string | undefined>();
  const [receiveModalOpen, setReceiveModalOpen] = React.useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [payments, setPayments] = React.useState<PaymentRow[]>([]);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
 
  const parseAmount = (amountStr: string) => parseFloat(amountStr.replace(/[$,]/g, '')) || 0;
  const parseDate = (dateStr: string) => new Date(dateStr);
 
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
 
      const filters: Record<string, string> = {};
 
      if (cf.number?.trim()) filters.number = cf.number;
      if (cf.date?.from) filters.from = format(cf.date.from, 'yyyy-MM-dd');
      if (cf.date?.to) filters.to = format(cf.date.to, 'yyyy-MM-dd');
      if (cf.customer?.trim()) filters.customer = cf.customer;
      if (cf.paymentMethod && cf.paymentMethod !== 'All') filters.paymentMethod = cf.paymentMethod;
      if (cf.amount?.trim()) filters.amount = cf.amount;
 
      const response = await getPayments(location, page, rowsPerPage, filters);
 
      const transformedData = response.data.map((payment: PaymentDto) => ({
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
    } catch (err) {
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
 
  const numberOptions = React.useMemo(() => 
    Array.from(new Set(payments.map(r => r.number))).map(n => ({ value: n, label: n })),
    [payments]
  );
 
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
        filter: {
          type: "date-range",
          initialValue: undefined,
          quickPreset: "payments",
          allowClear: true
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
    setColumnFilters((prev) => {
      const newFilters = { ...prev };
      
      if (columnKey === 'date') {
        if (!value || (typeof value === 'object' && !((value as { from?: Date; to?: Date }).from || (value as { from?: Date; to?: Date }).to))) {
          delete newFilters[columnKey];
        } else {
          newFilters[columnKey] = value;
        }
      } else if (!value || (typeof value === 'string' && !value.trim()) || (typeof value === 'object' && Object.keys(value as object).length === 0)) {
        delete newFilters[columnKey];
      } else {
        newFilters[columnKey] = value;
      }
      
      return newFilters;
    });
    setPage(1);
  }, []);

  const handleModalClose = React.useCallback((setModalOpen: (open: boolean) => void) => (open: boolean) => {
    setModalOpen(open);
    if (!open) setSelectedPaymentId(undefined);
  }, []);
 
  return (
    <ReportPageLayout
      title="Payments"
      subtitle="Browse all payments, search and sort"
      isLoading={isLoading}
      error={error}
      onRetry={fetchPayments}
      actions={
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setReceiveModalOpen(true)}>
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
        getSearchValue={getSearchValue}
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
        onServerSidePageChange={setPage}
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
        key={JSON.stringify(columnFilters.date || null)}
        stickyHeader={true}
        onRowClick={(row) => {
          setSelectedPaymentId(row.id);
          setReceiptModalOpen(true);
        }}
      />
      
      {/* Recived Payment Modal - completely self-contained */}
      <PaymentsReceivePaymentModal
        open={receiveModalOpen}
        onOpenChange={handleModalClose(setReceiveModalOpen)}
        location={location}
        onSaveSuccess={fetchPayments}
      />
      
      {/* Payment Receipt Modal - completely self-contained */}
      <PaymentReceiptModalWrapper
        open={receiptModalOpen}
        onOpenChange={handleModalClose(setReceiptModalOpen)}
        location={location}
        paymentId={selectedPaymentId}
        onSaveSuccess={fetchPayments}
      />
    </ReportPageLayout>
  );
}
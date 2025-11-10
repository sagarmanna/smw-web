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

// Temporary UI data (mock) – replace with API integration later
const MOCK_PAYMENTS: PaymentRow[] = [
  { id: "P-1573435", number: "P-1573435", date: new Date(2025, 9, 1), customer: "Jack Black", paymentMethod: "Visa", notes: null, reference: null, amount: 230 },
  { id: "P-1597152", number: "P-1597152", date: new Date(2025, 9, 21), customer: "Sam Al", paymentMethod: "Cash", notes: null, reference: "Test", amount: 28.75 },
  { id: "P-1591560", number: "P-1591560", date: new Date(2025, 9, 25), customer: "Testing 123", paymentMethod: "Cash", notes: null, reference: null, amount: 100 },
  
];

export function PaymentsClient({ location }: PaymentsClientProps) {
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(20);
  const [page, setPage] = React.useState<number>(1);
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  const [selectedRow, setSelectedRow] = React.useState<PaymentRow | null>(null);
  const [receiptOpen, setReceiptOpen] = React.useState<boolean>(false);
  const [receiveOpen, setReceiveOpen] = React.useState<boolean>(false);

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
    return Array.from(new Set(MOCK_PAYMENTS.map(r => r.number))).map(n => ({ value: n, label: n }));
  }, []);

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
        filter: { type: "date-range", initialValue: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) }, quickPreset: "payments" },
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

  const data = React.useMemo(() => MOCK_PAYMENTS, []);

  const filteredRows = React.useMemo(() => {
    let result = data;
    const cf = columnFilters as {
      number?: string;
      date?: { from?: Date; to?: Date };
      customer?: string;
      paymentMethod?: string;
      amount?: string;
    };

    if (cf.number) {
      result = result.filter(r => r.number === cf.number);
    }
    if (cf.date?.from && cf.date?.to) {
      const from = cf.date.from;
      const to = cf.date.to;
      result = result.filter(r => r.date >= from && r.date <= to);
    }
    if (cf.customer && cf.customer.trim() !== "") {
      const q = cf.customer.toLowerCase();
      result = result.filter(r => (r.customer || '').toLowerCase().includes(q));
    }
    if (cf.paymentMethod && cf.paymentMethod !== "") {
      result = result.filter(r => r.paymentMethod === cf.paymentMethod);
    }
    if (cf.amount && cf.amount.trim() !== "") {
      const q = cf.amount.replace(/[^0-9.-]/g, "");
      result = result.filter(r => String(r.amount).includes(q));
    }
    return result;
  }, [data, columnFilters]);

  const total = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(total / (rowsPerPage === -1 ? total || 1 : rowsPerPage)));
  const pagination = { page, limit: rowsPerPage, total, totalPages };

  const pagedRows = React.useMemo(() => {
    if (rowsPerPage === -1) return filteredRows;
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredRows.slice(start, end);
  }, [filteredRows, page, rowsPerPage]);

  const handleColumnFilterChange = React.useCallback((columnKey: string, value: unknown) => {
    setColumnFilters((prev) => ({ ...prev, [columnKey]: value }));
    setPage(1);
  }, []);

  // Handler for saving new payment
  const handlePaymentSaved = React.useCallback(() => {
    // TODO: Refresh payments list from API
    console.log("Payment saved, refreshing list...");
    setReceiveOpen(false);
  }, []);

  return (
    <ReportPageLayout
      title="Payments"
      subtitle="Browse all payments, search and sort"
      isLoading={false}
      error={null}
      onRetry={() => {}}
      actions={
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setReceiveOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Receive Payment
        </Button>
      }
    >
      <CustomTable<PaymentRow, unknown>
        columns={columns}
        data={pagedRows}
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
          date: "Date Range",
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
"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { PaymentsReceiptModal } from "./components/PaymentReceipt";
import { PaymentsReceivePaymentModal } from "./components/PaymentReceipt/ReceivePayment";

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
  { id: "P-1596707", number: "P-1596707", date: new Date(2025, 9, 27), customer: "Natasha Amendola N", paymentMethod: "Cash", notes: null, reference: null, amount: -100 },
  { id: "P-1597153", number: "P-1597153", date: new Date(2025, 9, 29), customer: "Fdg Fdgdsf", paymentMethod: "Amex", notes: null, reference: null, amount: 2127.5 },
  { id: "P-1587949", number: "P-1587949", date: new Date(2025, 9, 27), customer: "New Customer", paymentMethod: "Cash", notes: null, reference: null, amount: 15 },
  { id: "P-1588001", number: "P-1588001", date: new Date(2025, 9, 5), customer: "Vimal Jeba", paymentMethod: "Cheque", notes: null, reference: null, amount: 150 },
  { id: "P-1588002", number: "P-1588002", date: new Date(2025, 9, 6), customer: "Vimal Jeba", paymentMethod: "Cash", notes: null, reference: null, amount: 28.75 },
  { id: "P-1588003", number: "P-1588003", date: new Date(2025, 9, 7), customer: "David Custom", paymentMethod: "Debit", notes: null, reference: null, amount: 32.5 },
  { id: "P-1588004", number: "P-1588004", date: new Date(2025, 9, 8), customer: "David Custom", paymentMethod: "E-Transfer", notes: null, reference: null, amount: 45 },
  { id: "P-1588005", number: "P-1588005", date: new Date(2025, 9, 9), customer: "Test Customer22", paymentMethod: "Cash", notes: null, reference: null, amount: 100 },
  { id: "P-1588006", number: "P-1588006", date: new Date(2025, 9, 10), customer: "AJ Test", paymentMethod: "Visa", notes: null, reference: null, amount: 143.75 },
  { id: "P-1588007", number: "P-1588007", date: new Date(2025, 9, 11), customer: "AJ Test2", paymentMethod: "Mastercard", notes: null, reference: null, amount: 100 },
  { id: "P-1588008", number: "P-1588008", date: new Date(2025, 9, 12), customer: "AJ Test3", paymentMethod: "Cash", notes: null, reference: null, amount: 75 },
  { id: "P-1588009", number: "P-1588009", date: new Date(2025, 9, 13), customer: "New Customer", paymentMethod: "Gift Card", notes: null, reference: null, amount: 50 },
  { id: "P-1588010", number: "P-1588010", date: new Date(2025, 9, 14), customer: "Kirushan James", paymentMethod: "Cash", notes: null, reference: null, amount: 60 },
  { id: "P-1588011", number: "P-1588011", date: new Date(2025, 9, 15), customer: "Jancy Custom", paymentMethod: "Cash", notes: null, reference: null, amount: 28.75 },
  { id: "P-1588012", number: "P-1588012", date: new Date(2025, 9, 16), customer: "John Fedrick", paymentMethod: "Cash", notes: null, reference: null, amount: 28.75 },
  { id: "P-1588013", number: "P-1588013", date: new Date(2025, 9, 17), customer: "Daniel Clain", paymentMethod: "Debit", notes: null, reference: null, amount: 85 },
  { id: "P-1588014", number: "P-1588014", date: new Date(2025, 9, 18), customer: "Michael DeFrancesco", paymentMethod: "Cash", notes: null, reference: null, amount: 110 },
  { id: "P-1588015", number: "P-1588015", date: new Date(2025, 9, 19), customer: "Alexander Hamilton", paymentMethod: "Amex", notes: null, reference: null, amount: 200 },
  { id: "P-1588016", number: "P-1588016", date: new Date(2025, 9, 20), customer: "Salma Hasan", paymentMethod: "Cash", notes: null, reference: null, amount: 34.5 },
  { id: "P-1588017", number: "P-1588017", date: new Date(2025, 10, 1), customer: "Sushanth Aloysius", paymentMethod: "Cash", notes: null, reference: null, amount: 28.75 },
  { id: "P-1588018", number: "P-1588018", date: new Date(2025, 10, 2), customer: "AJ Teacher", paymentMethod: "Visa", notes: null, reference: null, amount: 300 },
  { id: "P-1588019", number: "P-1588019", date: new Date(2025, 10, 3), customer: "Demo User", paymentMethod: "Cheque", notes: null, reference: null, amount: 125 },
  { id: "P-1588020", number: "P-1588020", date: new Date(2025, 10, 4), customer: "Sample Client", paymentMethod: "E-Transfer", notes: null, reference: null, amount: 220 },
  { id: "P-1588021", number: "P-1588021", date: new Date(2025, 10, 5), customer: "Jane Doe", paymentMethod: "Mastercard", notes: null, reference: null, amount: 175 },
  { id: "P-1588022", number: "P-1588022", date: new Date(2025, 10, 6), customer: "John Doe", paymentMethod: "Cash", notes: null, reference: null, amount: 95 },
  { id: "P-1588023", number: "P-1588023", date: new Date(2025, 10, 7), customer: "Mary Poppins", paymentMethod: "Amex", notes: null, reference: null, amount: 410 },
  { id: "P-1588024", number: "P-1588024", date: new Date(2025, 10, 8), customer: "Paul Atreides", paymentMethod: "Cash", notes: null, reference: null, amount: 60 },
  { id: "P-1588025", number: "P-1588025", date: new Date(2025, 10, 9), customer: "Chani", paymentMethod: "Gift Card", notes: null, reference: null, amount: 75 },
  { id: "P-1588026", number: "P-1588026", date: new Date(2025, 10, 10), customer: "Duncan Idaho", paymentMethod: "Debit", notes: null, reference: null, amount: 90 },
  { id: "P-1588027", number: "P-1588027", date: new Date(2025, 10, 11), customer: "Gurney Halleck", paymentMethod: "Cash", notes: null, reference: null, amount: 55 },
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
        filter: { type: "date-range", initialValue: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
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
    // Reset to first page on filter change for consistent UX
    setPage(1);
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
        // Toolbar record count and rows-per-page
        showRecordCountInToolbar={true}
        enableRowsPerPage={true}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(newRowsPerPage) => {
          setRowsPerPage(newRowsPerPage);
          setPage(1);
        }}
        // Server-side style pagination just for UI (no API yet)
        serverSidePagination={pagination}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        hideRecordCount={true}
        // Column filter inputs row
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
      <PaymentsReceiptModal
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        row={selectedRow || undefined}
        locationName={location}
      />
      <PaymentsReceivePaymentModal
        open={receiveOpen}
        onOpenChange={setReceiveOpen}
        onSave={() => setReceiveOpen(false)}
        location={location}
      />
    </ReportPageLayout>
  );
}



"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { PaymentsReceivePaymentModal } from "./components/PaymentReceipt";
import { getPayments, PaymentDto } from "./payments.api";
import { receivePayment, PaymentReceiveData } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";

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
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const [isNewPayment, setIsNewPayment] = React.useState<boolean>(false);
  
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
        }
        if (cf.date.to) {
          filters.to = format(cf.date.to, 'yyyy-MM-dd');
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

      const response = await getPayments(location, page, rowsPerPage, filters);

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
      
      // Special handling for date filters - explicitly handle undefined to trigger reset
      if (columnKey === 'date') {
        if (value === undefined || value === null) {
          // Delete the key entirely to trigger proper reset
          delete newFilters[columnKey];
        } else if (typeof value === 'object' && value !== null) {
          const dateObj = value as { from?: Date; to?: Date };
          if (!dateObj.from && !dateObj.to) {
            // Both dates cleared - delete the filter
            delete newFilters[columnKey];
          } else {
            // Valid date range
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
        // For other object filters, check if empty
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
    setPage(1); // Reset to first page when filters change
  }, []);

  // Handler for saving payment - matches customer detail implementation
  const handleSavePayment = React.useCallback(async (paymentData: {
    customer: string;
    date: string;
    paymentMethod: string;
    reference: string;
    amountReceived: number;
    notes: string;
    selectedLessons: string[];
    selectedGroupLessons?: string[];
    selectedInvoices?: string[];
    selectedCredits?: string[];
    lessonPayments: Record<string, number>;
    groupLessonPayments?: Record<string, number>;
    invoicePayments?: Record<string, number>;
    paymentCredits?: Record<string, number>;
    invoiceCredits?: Record<string, number>;
  }) => {
    try {
      // Payment method value is already the ID as a string, just convert to number
      const paymentMethodId = Number(paymentData.paymentMethod) || 1; // Default to 1 if invalid

      // Helper function to format numbers to 2 decimal places
      const formatToTwoDecimals = (value: number): number => {
        return Math.round(value * 100) / 100;
      };

      // Calculate amount needed (sum of all selected items)
      const lessonPaymentsTotal = Object.values(paymentData.lessonPayments || {}).reduce((sum, val) => sum + val, 0);
      const groupLessonPaymentsTotal = Object.values(paymentData.groupLessonPayments || {}).reduce((sum, val) => sum + val, 0);
      const invoicePaymentsTotal = Object.values(paymentData.invoicePayments || {}).reduce((sum, val) => sum + val, 0);
      const amountNeeded = formatToTwoDecimals(lessonPaymentsTotal + groupLessonPaymentsTotal + invoicePaymentsTotal);
      const amountToDistribute = formatToTwoDecimals(amountNeeded);

      // Prepare lesson payments array (IDs are already numeric from API)
      const lessonPaymentsArray = paymentData.lessonPayments
        ? Object.entries(paymentData.lessonPayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare group lesson payments array (IDs are already numeric from API)
      const groupLessonPaymentsArray = paymentData.groupLessonPayments
        ? Object.entries(paymentData.groupLessonPayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice payments array (IDs are already numeric from API, no "I-" prefix needed)
      const invoicePaymentsArray = paymentData.invoicePayments
        ? Object.entries(paymentData.invoicePayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare payment credits array (IDs are already numeric from API)
      const paymentCreditsArray = paymentData.paymentCredits
        ? Object.entries(paymentData.paymentCredits)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice credits array (IDs are already numeric from API)
      const invoiceCreditsArray = paymentData.invoiceCredits
        ? Object.entries(paymentData.invoiceCredits)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Calculate selected credit value (sum of all selected credits)
      const selectedCreditValue = formatToTwoDecimals(
        paymentCreditsArray.reduce((sum, c) => sum + c.value, 0) +
        invoiceCreditsArray.reduce((sum, c) => sum + c.value, 0)
      );

      // Calculate amount received following legacy logic
      const amountAfterCredits = amountNeeded - selectedCreditValue;
      let calculatedAmount: number;
      if (amountAfterCredits < 0) {
        // Credits exceed amount needed
        calculatedAmount = amountNeeded > 0 ? 0.00 : amountAfterCredits;
      } else {
        // Credits don't fully cover amount needed (or exactly match)
        calculatedAmount = amountAfterCredits;
      }
      
      // Use the calculated amount when credits are present (matching legacy auto-calculation behavior)
      // When no credits are used, use the user-entered amount
      const finalAmount = selectedCreditValue > 0 
        ? formatToTwoDecimals(calculatedAmount)
        : formatToTwoDecimals(paymentData.amountReceived);

      // Extract customer ID from the customer string
      // Assuming format: "Customer Name (ID: 123)" or just "123"
      const customerIdMatch = paymentData.customer.match(/\(ID:\s*(\d+)\)/);
      const customerId = customerIdMatch ? Number(customerIdMatch[1]) : Number(paymentData.customer);

      // Prepare payment data for legacy API
      const legacyPaymentData: PaymentReceiveData = {
        userId: customerId,
        date: paymentData.date, // Already in "MMM dd, yyyy" format
        paymentMethodId: paymentMethodId,
        reference: paymentData.reference || '',
        amount: finalAmount,
        amountNeeded: amountNeeded,
        selectedCreditValue: selectedCreditValue,
        amountToDistribute: amountToDistribute,
        notes: paymentData.notes || '',
        lessonPayments: lessonPaymentsArray.length > 0 ? lessonPaymentsArray : undefined,
        groupLessonPayments: groupLessonPaymentsArray.length > 0 ? groupLessonPaymentsArray : undefined,
        invoicePayments: invoicePaymentsArray.length > 0 ? invoicePaymentsArray : undefined,
        paymentCredits: paymentCreditsArray.length > 0 ? paymentCreditsArray : undefined,
        invoiceCredits: invoiceCreditsArray.length > 0 ? invoiceCreditsArray : undefined,
        canUsePaymentCredits: paymentCreditsArray.length > 0 ? 1 : 0,
        canUseInvoiceCredits: invoiceCreditsArray.length > 0 ? 1 : 0,
        prId: '',
      };

      // Call legacy API
      const response = await receivePayment(location, legacyPaymentData);

      if (response.status) {
        toast.success("Payment saved successfully");
        
        // Refresh the payments list
        await fetchPayments();
        
        // Close the modal
        setModalOpen(false);
        setSelectedRow(null);
        setIsNewPayment(false);
      } else {
        const errorMessage = response.message || response.errors?.join(", ") || "Failed to save payment";
        console.error("Payment save error:", errorMessage);
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving payment:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save payment";
      toast.error(errorMessage);
      throw error;
    }
  }, [location, fetchPayments]);

  // Handler for retry
  const handleRetry = React.useCallback(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Handler for new payment button
  const handleNewPayment = React.useCallback(() => {
    setSelectedRow(null);
    setIsNewPayment(true);
    setModalOpen(true);
  }, []);

  // Handler for row click
  const handleRowClick = React.useCallback((row: PaymentRow) => {
    setSelectedRow(row);
    setIsNewPayment(false);
    setModalOpen(true);
  }, []);

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
        key={JSON.stringify(columnFilters.date || null)}
        stickyHeader={true}
        onRowClick={handleRowClick}
      />
      
      {/* Single Payment Modal - used for both new payments and viewing existing ones */}
      <PaymentsReceivePaymentModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) {
            setSelectedRow(null);
            setIsNewPayment(false);
          }
        }}
        onSave={handleSavePayment}
        location={location}
        customerId={selectedRow?.id || undefined}
        customerName={selectedRow?.customer || undefined}
      />
    </ReportPageLayout>
  );
}
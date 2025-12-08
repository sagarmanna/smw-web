"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "../../../app/[location]/customers/components/ReceivePaymentModal/components/DatePicker";
import { formatCurrency } from "@/utils/formatCurrency";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import type { 
  PaymentReceiptModalUIProps,
  AllocationRow,
  EditLessonRow,
  GroupLessonRow,
  GroupLessonEditRow,
  InvoiceRow,
  InvoiceEditRow,
  ReceiptRow,
} from "./types";

/**
 * Utility function to check if a date string is today or in the future
 * Handles formats like "Dec 20, 2025 at 10:00 AM" or "Dec 20, 2025 @ 10:00 AM"
 */
const isDateTodayOrFuture = (dateString: string): boolean => {
  if (!dateString || dateString.trim() === '') return true; // If no date, allow editing
  
  try {
    // Extract date part (before " at " or " @ ")
    const datePart = dateString.split(/ at | @ /i)[0].trim();
    
    if (!datePart) return true; // If no date part, allow editing
    
    // Parse the date (format: "Dec 20, 2025" or "December 20, 2025")
    // Match format: "MMM DD, YYYY" or "MMMM DD, YYYY"
    const dateMatch = datePart.match(/(\w+)\s+(\d+),\s+(\d+)/);
    
    if (!dateMatch) {
      // If format doesn't match, try direct parsing
      const date = new Date(datePart);
      if (isNaN(date.getTime())) {
        return true; // If invalid, allow editing
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const compareDate = new Date(date);
      compareDate.setHours(0, 0, 0, 0);
      return compareDate >= today;
    }
    
    const [, monthName, day, year] = dateMatch;
    const dayNum = parseInt(day, 10);
    const yearNum = parseInt(year, 10);
    
    // Map month names to numbers
    const monthMap: Record<string, number> = {
      'jan': 0, 'january': 0,
      'feb': 1, 'february': 1,
      'mar': 2, 'march': 2,
      'apr': 3, 'april': 3,
      'may': 4,
      'jun': 5, 'june': 5,
      'jul': 6, 'july': 6,
      'aug': 7, 'august': 7,
      'sep': 8, 'september': 8,
      'oct': 9, 'october': 9,
      'nov': 10, 'november': 10,
      'dec': 11, 'december': 11,
    };
    
    const monthKey = monthName.toLowerCase();
    const monthNum = monthMap[monthKey];
    
    if (monthNum === undefined || isNaN(dayNum) || isNaN(yearNum)) {
      return true; // If can't parse, allow editing
    }
    
    // Create date object explicitly
    const date = new Date(yearNum, monthNum, dayNum);
    
    // Validate the date
    if (date.getFullYear() !== yearNum || date.getMonth() !== monthNum || date.getDate() !== dayNum) {
      return true; // Invalid date, allow editing
    }
    
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    today.setMinutes(0);
    today.setSeconds(0);
    today.setMilliseconds(0);
    
    // Get the date from string at midnight for comparison
    const compareDate = new Date(yearNum, monthNum, dayNum);
    compareDate.setHours(0, 0, 0, 0);
    compareDate.setMinutes(0);
    compareDate.setSeconds(0);
    compareDate.setMilliseconds(0);
    
    // Return true if date is today or in the future
    return compareDate >= today;
  } catch (error) {
    // If parsing fails, allow editing to be safe
    console.warn('Date parsing error:', error, 'Date string:', dateString);
    return true;
  }
};

/**
 * Payment Input Component for Lessons - uses local state to prevent focus loss
 */
const LessonAllocationInput: React.FC<{
  row: { original: EditLessonRow; index: number };
  onLessonAllocationChange: (index: number, value: number) => void;
}> = ({ row, onLessonAllocationChange }) => {
  const [localValue, setLocalValue] = React.useState(row.original.allocation.toString());
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLocalValue(row.original.allocation.toString());
    setError(null);
  }, [row.original.allocation]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null);
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(localValue) || 0;
    
    // Parse balance from string (e.g., "$18.75" or "-$1.25")
    const balanceString = row.original.balance?.replace(/[^0-9.-]/g, '') || '0';
    const balance = parseFloat(balanceString) || 0;
    
    if (numericValue > balance) {
      setError("Can't over pay!");
      setLocalValue(row.original.allocation.toString()); // Reset to previous valid value
      return;
    }
    
    setError(null);
    onLessonAllocationChange(row.index, numericValue);
  };
  
  // Check if original date is today or future
  const isEditable = React.useMemo(() => {
    return isDateTodayOrFuture(row.original.originalDate);
  }, [row.original.originalDate]);
  
  return (
    <div className="flex flex-col items-end">
      <Input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-8 w-24 text-right ${error ? 'border-red-500' : ''}`}
        disabled={!isEditable}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

/**
 * Payment Input Component for Group Lessons - uses local state to prevent focus loss
 */
const GroupLessonAllocationInput: React.FC<{
  row: { original: GroupLessonEditRow; index: number };
  onGroupLessonAllocationChange: (index: number, value: number) => void;
}> = ({ row, onGroupLessonAllocationChange }) => {
  const [localValue, setLocalValue] = React.useState(row.original.allocation.toString());
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLocalValue(row.original.allocation.toString());
    setError(null);
  }, [row.original.allocation]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null);
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(localValue) || 0;
    
    // Parse balance from string (e.g., "$18.75" or "-$1.25")
    const balanceString = row.original.balance?.replace(/[^0-9.-]/g, '') || '0';
    const balance = parseFloat(balanceString) || 0;
    
    if (numericValue > balance) {
      setError("Can't over pay!");
      setLocalValue(row.original.allocation.toString()); // Reset to previous valid value
      return;
    }
    
    setError(null);
    onGroupLessonAllocationChange(row.index, numericValue);
  };
  
  // Check if date is today or future (group lessons use 'date' field, not 'originalDate')
  const isEditable = React.useMemo(() => {
    return isDateTodayOrFuture(row.original.date);
  }, [row.original.date]);
  
  return (
    <div className="flex flex-col items-end">
      <Input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-8 w-24 text-right ${error ? 'border-red-500' : ''}`}
        disabled={!isEditable}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

/**
 * Payment Input Component for Invoices - uses local state to prevent focus loss
 */
const InvoiceAllocationInput: React.FC<{
  row: { original: InvoiceEditRow; index: number };
  onInvoiceAllocationChange: (index: number, value: number) => void;
}> = ({ row, onInvoiceAllocationChange }) => {
  const [localValue, setLocalValue] = React.useState(row.original.allocation.toString());
  const [error, setError] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    setLocalValue(row.original.allocation.toString());
    setError(null);
  }, [row.original.allocation]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    setError(null);
  };
  
  const handleBlur = () => {
    const numericValue = parseFloat(localValue) || 0;
    
    // Parse balance from string (e.g., "$18.75" or "-$1.25")
    const balanceString = row.original.balance?.replace(/[^0-9.-]/g, '') || '0';
    const balance = parseFloat(balanceString) || 0;
    
    if (numericValue > balance) {
      setError("Can't over pay!");
      setLocalValue(row.original.allocation.toString()); // Reset to previous valid value
      return;
    }
    
    setError(null);
    onInvoiceAllocationChange(row.index, numericValue);
  };
  
  // Check if date is today or future (invoices use 'date' field, not 'originalDate')
  const isEditable = React.useMemo(() => {
    return isDateTodayOrFuture(row.original.date);
  }, [row.original.date]);
  
  return (
    <div className="flex flex-col items-end">
      <Input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`h-8 w-24 text-right ${error ? 'border-red-500' : ''}`}
        disabled={!isEditable}
      />
      {error && (
        <span className="text-xs text-red-500 mt-1">{error}</span>
      )}
    </div>
  );
};

// Column definitions - base columns without Original Date
const allocationColumnsBase: ColumnDef<AllocationRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const v = row.getValue("date") as string;
      return <div>{v.replace(/ at /gi, " @ ")}</div>;
    },
  },
  { accessorKey: "student", header: "Student" },
  { accessorKey: "program", header: "Program" },
  { accessorKey: "teacher", header: "Teacher" },
  { 
    accessorKey: "amount", 
    header: "Amount", 
    cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> 
  },
  { 
    accessorKey: "payment", 
    header: "Payment", 
    cell: ({ row }) => <div className="text-right">{row.getValue("payment") as string}</div> 
  },
  { 
    accessorKey: "balance", 
    header: "Balance", 
    cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> 
  },
];

// Column definitions with Original Date (for view mode - row click)
const allocationColumnsWithOriginalDate: ColumnDef<AllocationRow>[] = [
  {
    accessorKey: "originalDate",
    header: "Original Date",
    cell: ({ row }) => {
      const v = row.getValue("originalDate") as string;
      return <div>{v.replace(/ at /gi, " @ ")}</div>;
    },
  },
  ...allocationColumnsBase,
];

const groupLessonColumns: ColumnDef<GroupLessonRow>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "student", header: "Student" },
  { accessorKey: "program", header: "Program" },
  { accessorKey: "invoiced", header: "Invoiced ?" },
  { 
    accessorKey: "amount", 
    header: "Amount", 
    cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> 
  },
  { 
    accessorKey: "balance", 
    header: "Balance", 
    cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> 
  },
];

const invoiceColumns: ColumnDef<InvoiceRow>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "number", header: "Number" },
  { 
    accessorKey: "amount", 
    header: "Amount", 
    cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> 
  },
  { 
    accessorKey: "payment", 
    header: "Payment", 
    cell: ({ row }) => <div className="text-right">{row.getValue("payment") as string}</div> 
  },
  { 
    accessorKey: "balance", 
    header: "Balance", 
    cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> 
  },
];

// Receipt columns for view mode (row click) - original format
const receiptColumnsView: ColumnDef<ReceiptRow>[] = [
  { accessorKey: "reference", header: "Reference" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "method", header: "Payment Method" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("amount") as string}</div>
    ),
  },
];

// Receipt columns for new mode (after save) - updated format with Type and Amount Used
const receiptColumnsNew: ColumnDef<ReceiptRow>[] = [
  { accessorKey: "type", header: "Type" },
  { accessorKey: "reference", header: "Reference" },
  { accessorKey: "method", header: "Payment Method" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("amount") as string}</div>
    ),
  },
  {
    accessorKey: "amountUsed",
    header: "Amount Used",
    cell: ({ row }) => (
      <div className="text-right">{row.getValue("amountUsed") as string}</div>
    ),
  },
];

// Loading component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading payment details...</p>
    </div>
  );
}

// Main component
export function PaymentReceiptModalUI(props: PaymentReceiptModalUIProps) {
  const {
    open,
    onOpenChange,
    isEditing,
    showDeleteConfirm,
    isSaving,
    isLoading,
    isLoadingPaymentMethods,
    headerAmount,
    paymentDate,
    paymentMethod,
    customerName,
    hstNumber,
    showAllocations,
    receiptHtml,
    receiptHtmlRef,
    allocationRows,
    groupLessonRows,
    invoiceRows,
    receiptRows,
    editDate,
    editForm,
    paymentMethods,
    lessonEditRows,
    groupLessonEditRows,
    invoiceEditRows,
    amountToApply,
    amountToCredit,
    onEditDateChange,
    onEditFormChange,
    onLessonAllocationChange,
    onGroupLessonAllocationChange,
    onInvoiceAllocationChange,
    onEditClick,
    onCancelEdit,
    onSave,
    onPrint,
    onEmail,
    onDelete,
    onDeleteConfirm,
    onDeleteCancel,
    onEmailFormSubmit,
    onPrintFromHtml,
    mode = "view",
    acknowledgmentMessage,
    showEditButton = true,
    showDeleteButton = true,
  } = props;

  // Check if payment amount is negative
  const isNegativePayment = React.useMemo(() => {
    // Parse the headerAmount string (e.g., "-$9.52" or "$9.52")
    const amountString = headerAmount?.replace(/[^0-9.-]/g, '') || '0';
    const amount = parseFloat(amountString);
    return amount < 0;
  }, [headerAmount]);

  // Show banner state with auto-dismiss
  const [showBanner, setShowBanner] = React.useState(false);

  React.useEffect(() => {
    if (open && isNegativePayment && !isEditing) {
      setShowBanner(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 15000); // 15 seconds

      return () => clearTimeout(timer);
    }
  }, [open, isNegativePayment, isEditing]);

  const hasAllocations = allocationRows.length > 0 || groupLessonRows.length > 0 || invoiceRows.length > 0;
  const hasReceiptRows = receiptRows.length > 0;
  const shouldShowNoSelectionsMessage = !isEditing && !hasAllocations && hasReceiptRows;

  // Validation removed - allow free editing of amount received

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl w-[98vw] p-0">
          <DialogHeader className="px-6 pt-6 pb-2">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold">
                {isEditing ? "Edit Payment" : "Payment Receipt"}
              </DialogTitle>
              {!receiptHtml && !isLoading && (
                <div className="text-sm font-semibold">Amount Paid {headerAmount}</div>
              )}
            </div>
          </DialogHeader>

          <div className="px-6 pb-4 space-y-6 overflow-y-auto max-h-[70vh]">
            {/* Loading state */}
            {isLoading ? (
              <LoadingState />
            ) : (
              <>
                {/* Thank you message for new payments */}
                {mode === "new" && acknowledgmentMessage && !isEditing && (
                  <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      {acknowledgmentMessage}
                    </p>
                  </div>
                )}

                {/* Negative Payment Banner */}
                {showBanner && isNegativePayment && !isEditing && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-semibold">
                      Negative Payments Cannot be Edited
                    </AlertDescription>
                  </Alert>
                )}

                {/* Render HTML receipt if available */}
                {receiptHtml && !isEditing ? (
                  <div 
                    ref={receiptHtmlRef}
                    className="receipt-html-content"
                    dangerouslySetInnerHTML={{ __html: receiptHtml }}
                    style={{
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      fontSize: '14px',
                      lineHeight: '1.5',
                    }}
                  />
                ) : (
                  <>
                    {/* Edit mode form */}
                    {isEditing ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <Label>Date</Label>
                          <DatePicker date={editDate} onDateChange={onEditDateChange} />
                        </div>
                        <div className="space-y-1">
                          <Label>Payment Method</Label>
                          <Select 
                            value={editForm.method} 
                            onValueChange={(v) => onEditFormChange({ ...editForm, method: v })}
                            disabled={isLoadingPaymentMethods || paymentMethods.length === 0}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={isLoadingPaymentMethods ? "Loading..." : "Select method"} />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingPaymentMethods ? (
                                <SelectItem value="loading" disabled>
                                  Loading payment methods...
                                </SelectItem>
                              ) : paymentMethods.length > 0 ? (
                                paymentMethods.map((method) => (
                                  <SelectItem key={method.id} value={method.id.toString()}>
                                    {method.name}
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>
                                  No payment methods available
                                </SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>Reference</Label>
                          <Input
                            placeholder="Reference"
                            value={editForm.reference}
                            onChange={(e) => onEditFormChange({ ...editForm, reference: e.target.value })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>
                            Amount Received
                          </Label>
                          <Input
                            type="number"
                            className="text-right"
                            value={editForm.amountReceived}
                            onChange={(e) => onEditFormChange({ ...editForm, amountReceived: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {`This is to acknowledge the receipt of payment${customerName ? ` from ${customerName}` : ""}${paymentDate ? ` on ${paymentDate}` : ""} in the amount of ${headerAmount}${paymentMethod ? ` via ${paymentMethod}` : ""}.`}
                        {" We have distributed it to the items below."}
                      </p>
                    )}

                    {/* No selections message */}
                    {shouldShowNoSelectionsMessage && (
                      <div className="text-center py-8">
                        <h3 className="text-2xl font-semibold mb-2">
                          You didn&apos;t select any lessons or invoices
                        </h3>
                        <p className="text-muted-foreground">
                          so we&apos;ll save this payment as credit to your customer account
                        </p>
                      </div>
                    )}

                    {/* Lessons allocation (read-only) */}
                    {!isEditing && showAllocations && (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">Lessons</div>
                        <CustomTable
                          data={allocationRows}
                          columns={mode === "new" ? allocationColumnsBase : allocationColumnsWithOriginalDate}
                          size="compact"
                          enableSorting={false}
                          enableExport={false}
                          enablePrint={false}
                          enableSearch={false}
                          enableFilter={false}
                          enableRowsPerPage={false}
                        />
                      </div>
                    )}

                    {/* Edit mode tables */}
                    {isEditing && (
                      <>
                        {/* Lessons (edit mode - editable) */}
                        {lessonEditRows.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold">Lessons</div>
                            <CustomTable
                              data={lessonEditRows}
                              columns={[
                                ...allocationColumnsWithOriginalDate,
                                {
                                  id: "paymentInput",
                                  header: "Payment",
                                  cell: ({ row }) => (
                                    <LessonAllocationInput
                                      row={row as unknown as { original: EditLessonRow; index: number }}
                                      onLessonAllocationChange={onLessonAllocationChange}
                                    />
                                  ),
                                },
                              ]}
                              size="compact"
                              enableSorting={false}
                              enableExport={false}
                              enablePrint={false}
                              enableSearch={false}
                              enableFilter={false}
                              enableRowsPerPage={false}
                            />
                          </div>
                        )}

                        {/* Group Lessons (edit mode - editable) */}
                        {groupLessonEditRows.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold">Group Lessons</div>
                            <CustomTable
                              data={groupLessonEditRows}
                              columns={[
                                ...groupLessonColumns,
                                {
                                  id: "glPayment",
                                  header: "Payment",
                                  cell: ({ row }) => (
                                    <GroupLessonAllocationInput
                                      row={row as unknown as { original: GroupLessonEditRow; index: number }}
                                      onGroupLessonAllocationChange={onGroupLessonAllocationChange}
                                    />
                                  ),
                                },
                              ]}
                              size="compact"
                              enableSorting={false}
                              enableExport={false}
                              enablePrint={false}
                              enableSearch={false}
                              enableFilter={false}
                              enableRowsPerPage={false}
                            />
                          </div>
                        )}

                        {/* Invoices (edit mode - editable) */}
                        {invoiceEditRows.length > 0 && (
                          <div className="space-y-3">
                            <div className="text-sm font-semibold">Invoices</div>
                            <CustomTable
                              data={invoiceEditRows}
                              columns={[
                                ...invoiceColumns,
                                {
                                  id: "invPayment",
                                  header: "Payment",
                                  cell: ({ row }) => (
                                    <InvoiceAllocationInput
                                      row={row as unknown as { original: InvoiceEditRow; index: number }}
                                      onInvoiceAllocationChange={onInvoiceAllocationChange}
                                    />
                                  ),
                                },
                              ]}
                              size="compact"
                              enableSorting={false}
                              enableExport={false}
                              enablePrint={false}
                              enableSearch={false}
                              enableFilter={false}
                              enableRowsPerPage={false}
                            />
                          </div>
                        )}

                        {/* Amount summary in edit mode */}
                        <div className="flex flex-col items-end gap-2 pt-2">
                          <div className="text-muted-foreground">
                            Amount To Apply {formatCurrency(amountToApply)}
                          </div>
                          <div className="text-muted-foreground">
                            Amount To Credit {formatCurrency(amountToCredit)}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Group Lessons (read-only) */}
                    {!isEditing && groupLessonRows.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">Group Lessons</div>
                        <CustomTable
                          data={groupLessonRows}
                          columns={groupLessonColumns}
                          size="compact"
                          enableSorting={false}
                          enableExport={false}
                          enablePrint={false}
                          enableSearch={false}
                          enableFilter={false}
                          enableRowsPerPage={false}
                        />
                      </div>
                    )}

                    {/* Invoices (read-only) */}
                    {!isEditing && invoiceRows.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">Invoices</div>
                        <CustomTable
                          data={invoiceRows}
                          columns={invoiceColumns}
                          size="compact"
                          enableSorting={false}
                          enableExport={false}
                          enablePrint={false}
                          enableSearch={false}
                          enableFilter={false}
                          enableRowsPerPage={false}
                        />
                      </div>
                    )}

                    {/* Payments Used (read-only) - Hide when no lessons/payments selected */}
                    {!isEditing && hasAllocations && (
                      <div className="space-y-3">
                        {receiptRows.length > 0 ? (
                          <>
                            <div className="text-sm font-semibold">Payments Used</div>
                            <CustomTable
                              data={receiptRows}
                              columns={mode === "new" ? receiptColumnsNew : receiptColumnsView}
                              size="compact"
                              enableSorting={false}
                              enableExport={false}
                              enablePrint={false}
                              enableSearch={false}
                              enableFilter={false}
                              enableRowsPerPage={false}
                            />
                          </>
                        ) : null}
                        {/* HST number - shown directly below Payments Used table */}
                        {hstNumber && (
                          <div className="text-sm font-medium pt-2">
                            HST# <span className="text-muted-foreground">{hstNumber}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* HST number - shown when no allocations but HST exists */}
                    {!isEditing && !hasAllocations && hstNumber && (
                      <div className="space-y-3">
                        <div className="text-sm font-medium pt-2">
                          HST# <span className="text-muted-foreground">{hstNumber}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer actions */}
          {!isLoading && (
            <DialogFooter className="px-6 py-4 border-t w-full flex flex-row items-center justify-between sm:justify-between">
              {receiptHtml && !isEditing ? (
                <div className="flex gap-2 w-full justify-end">
                  <Button variant="secondary" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button variant="default" onClick={onEmailFormSubmit || onEmail}>
                    Email
                  </Button>
                  <Button variant="default" onClick={onPrintFromHtml || onPrint}>
                    Print
                  </Button>
                </div>
              ) : (
                <>
                  <div>
                    {showDeleteButton && !receiptHtml && (
                      <Button variant="destructive" onClick={onDelete}>
                        Delete
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isEditing ? (
                      <>
                        <Button variant="secondary" onClick={onCancelEdit}>
                          Cancel
                        </Button>
                        <Button disabled={isSaving} onClick={onSave}>
                          {isSaving ? "Saving..." : "Save"}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="secondary" onClick={() => onOpenChange(false)}>
                          Close
                        </Button>
                        {showEditButton && (
                          <Button 
                            variant="default" 
                            onClick={isNegativePayment ? undefined : onEditClick}
                            disabled={isNegativePayment}
                            className={isNegativePayment ? "opacity-50 cursor-not-allowed" : ""}
                          >
                            Edit
                          </Button>
                        )}
                        <Button variant="default" onClick={onPrint}>
                          Print
                        </Button>
                        <Button variant="default" onClick={onEmail}>
                          Email
                        </Button>
                      </>
                    )}
                  </div>
                </>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={onDeleteCancel}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base">
              Are you sure you want to delete this?
            </DialogTitle>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={onDeleteCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={onDeleteConfirm} disabled={isSaving}>
              {isSaving ? "Deleting..." : "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
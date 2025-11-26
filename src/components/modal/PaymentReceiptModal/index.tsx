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

// Column definitions
const allocationColumns: ColumnDef<AllocationRow>[] = [
  {
    accessorKey: "originalDate",
    header: "Original Date",
    cell: ({ row }) => {
      const v = row.getValue("originalDate") as string;
      return <div>{v.replace(/ at /gi, " @ ")}</div>;
    },
  },
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

const receiptColumns: ColumnDef<ReceiptRow>[] = [
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
                          <Label>Amount Received</Label>
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
                          columns={allocationColumns}
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
                                ...allocationColumns,
                                {
                                  id: "paymentInput",
                                  header: "Payment",
                                  cell: ({ row }) => {
                                    const lessonRow = row.original as EditLessonRow;
                                    const current = lessonRow.allocation;
                                    return (
                                      <Input
                                        type="number"
                                        value={Number(current).toString()}
                                        onChange={(e) => {
                                          const v = parseFloat(e.target.value || "0");
                                          onLessonAllocationChange(row.index, v);
                                        }}
                                        className="h-8 text-right"
                                      />
                                    );
                                  },
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
                                    <Input
                                      type="number"
                                      value={(row.original as GroupLessonEditRow).allocation.toString()}
                                      onChange={(e) => {
                                        const v = parseFloat(e.target.value || "0");
                                        onGroupLessonAllocationChange(row.index, v);
                                      }}
                                      className="h-8 text-right"
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
                                    <Input
                                      type="number"
                                      value={(row.original as InvoiceEditRow).allocation.toString()}
                                      onChange={(e) => {
                                        const v = parseFloat(e.target.value || "0");
                                        onInvoiceAllocationChange(row.index, v);
                                      }}
                                      className="h-8 text-right"
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

                    {/* Payments Used (read-only) */}
                    {!isEditing && (
                      <div className="space-y-3">
                        <div className="text-sm font-semibold">Payments Used</div>
                        <CustomTable
                          data={receiptRows}
                          columns={receiptColumns}
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

                    {/* Tax number */}
                    {!isEditing && hstNumber && (
                      <div className="text-sm font-medium pt-2">
                        HST# <span className="text-muted-foreground">{hstNumber}</span>
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
                    {!receiptHtml && (
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
                          Cancel
                        </Button>
                        <Button 
                          variant="default" 
                          onClick={isNegativePayment ? undefined : onEditClick}
                          disabled={isNegativePayment}
                          className={isNegativePayment ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          Edit
                        </Button>
                        <Button variant="default" onClick={onPrint}>
                          Print
                        </Button>
                        <Button variant="default" onClick={onEmail}>
                          EMail
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
            <Button variant="secondary" onClick={onDeleteCancel}>
              Cancel
            </Button>
            <Button onClick={onDeleteConfirm}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
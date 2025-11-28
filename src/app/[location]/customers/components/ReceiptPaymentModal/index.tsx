"use client";

import * as React from "react";
import { PaymentReceiptModalUI } from "@/components/modal/PaymentReceiptModal";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "sonner";
import {
  getPaymentReceiptData,
  PaymentUsedLesson,
  PaymentGroupLesson,
  PaymentInvoice,
  LocationDetails,
} from "./receipt-payment.api";
import { receivePayment, PaymentReceiveData } from "@/lib/api/legacyApiAdapter";
import {
  normalizeAmount,
  calculateTotalAllocations,
  calculateCreditAmount,
  createAllocationHandler,
} from "@/utils/paymentUtils";
import { parse, isValid } from "date-fns";
import {
  printPaymentReceipt,
  generatePaymentReceiptEmail,
  PaymentReceiptData,
} from "@/components/PrintReceiptPayment";
import type {
  PaymentMethod,
  AllocationRow,
  EditLessonRow,
  GroupLessonRow,
  GroupLessonEditRow,
  InvoiceRow,
  InvoiceEditRow,
  ReceiptRow,
  EditFormData,
} from "@/components/modal/PaymentReceiptModal/types";

interface PaymentReceiptModalContainerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  customerId?: number;
  paymentId?: number | string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  mode?: "view" | "new"; // "view" for existing receipt, "new" for new payment
  // Direct payment data for "new" mode (bypasses API fetch)
  directPaymentData?: {
    date: string;
    paymentMethod: string;
    reference: string;
    amount: number;
    lessons?: Array<{
      date: string;
      student: string;
      program: string;
      teacher: string;
      amount: string;
      payment: string;
      balance: string;
    }>;
    groupLessons?: Array<{
      date: string;
      student: string;
      program: string;
      amount: string;
      balance: string;
    }>;
    invoices?: Array<{
      date: string;
      number: string;
      amount: string;
      payment: string;
      balance: string;
    }>;
    credits?: Array<{
      type: string; // "Invoice Credit" or "Payment Credit"
      reference: string; // Invoice number for invoice credit, empty for payment credit
      paymentMethod?: string; // Payment method name for payment credit, empty for invoice credit
      amount: string; // Amount to apply (for payment credit) or "$0.00" (for invoice credit)
      amountUsed: string; // Payment column value from credit table
    }>;
  };
  onEdit?: (data: {
    date: string;
    method: string;
    reference: string;
    amountReceived: number;
    allocations?: Array<{ lessonDate: string; amount: number }>;
    groupLessonAllocations?: Array<{
      date: string;
      student: string;
      amount: number;
    }>;
    invoiceAllocations?: Array<{ id: string; amount: number }>;
  }) => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onEmail?: (payload: {
    subject: string;
    content: string;
    receiptHtml?: string;
  }) => void;
}

interface PaymentInfo {
  reference: string;
  date: string;
  paymentMethod: string;
  amount: number;
  locationDetails: LocationDetails | null;
  locationHstRegistrationNo: string;
  acknowledgmentMessage: string;
}

// Helper functions
const formatDateForLegacy = (date: Date | string): string => {
  const d = typeof date === "string" ? new Date(date) : date;
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month} ${day}, ${year}`;
};

const cleanInvoiceId = (id: string | number): number => {
  let cleanId = id;
  if (typeof cleanId === "string") {
    cleanId = cleanId.startsWith("I-") ? cleanId.substring(2) : cleanId;
    cleanId = cleanId.replace(/[^0-9]/g, "");
  }
  const numericId = cleanId && !isNaN(Number(cleanId)) ? Number(cleanId) : 0;
  return numericId;
};

// Data transformation functions
const transformLessonsToAllocationRows = (
  lessons: PaymentUsedLesson[]
): AllocationRow[] => {
  return lessons.map((lesson) => ({
    originalDate: lesson.originalDate,
    date: lesson.date,
    student: lesson.student,
    program: lesson.program,
    teacher: lesson.teacher,
    amount: lesson.amount,
    payment: lesson.payment,
    balance: "$0.00", // Always show $0.00 for balance in new payment receipt
  }));
};

const transformLessonsToEditRows = (
  lessons: PaymentUsedLesson[]
): EditLessonRow[] => {
  return lessons.map((lesson) => ({
    originalDate: lesson.originalDate,
    date: lesson.date,
    student: lesson.student,
    program: lesson.program,
    teacher: lesson.teacher,
    amount: lesson.amount,
    payment: lesson.payment,
    balance: lesson.balance,
    allocation: normalizeAmount(lesson.payment),
  }));
};

const transformGroupLessonsToRows = (
  groupLessons: PaymentGroupLesson[]
): GroupLessonRow[] => {
  return groupLessons.map((g) => ({
    date: g.date,
    student: g.student,
    program: g.program,
    invoiced: g.invoiced,
    amount: g.amount,
    balance: g.balance,
  }));
};

const transformGroupLessonsToEditRows = (
  groupLessons: GroupLessonRow[]
): GroupLessonEditRow[] => {
  return groupLessons.map((r) => ({
    ...r,
    allocation: normalizeAmount(r.amount),
  }));
};

const transformInvoicesToRows = (invoices: PaymentInvoice[]): InvoiceRow[] => {
  return invoices.map((inv) => ({
    date: inv.date,
    number: inv.number,
    amount: inv.amount,
    payment: inv.payment,
    balance: inv.balance,
  }));
};

const transformInvoicesToEditRows = (
  invoices: InvoiceRow[]
): InvoiceEditRow[] => {
  return invoices.map((r) => ({
    ...r,
    allocation: normalizeAmount(r.amount),
  }));
};

const createReceiptRow = (
  paymentInfo: PaymentInfo | null,
  headerAmount: string,
  mode: "view" | "new" = "view",
  credits?: Array<{
    type: string;
    reference: string;
    paymentMethod?: string;
    amount: string;
    amountUsed: string;
  }>
): ReceiptRow[] => {
  if (mode === "new") {
    // New format: Type, Reference, Payment Method, Amount, Amount Used
    const rows: ReceiptRow[] = [];
    
    // Add credits first (Invoice Credit, then Payment Credit)
    if (credits && credits.length > 0) {
      // Sort credits: Invoice Credit first, then Payment Credit
      const sortedCredits = [...credits].sort((a, b) => {
        if (a.type === "Invoice Credit" && b.type === "Payment Credit") return -1;
        if (a.type === "Payment Credit" && b.type === "Invoice Credit") return 1;
        return 0;
      });
      
      sortedCredits.forEach(credit => {
        rows.push({
          type: credit.type,
          reference: credit.reference || "—",
          date: "",
          method: credit.paymentMethod || "",
          amount: credit.amount,
          amountUsed: credit.amountUsed,
        });
      });
    }
    
    // Add payment row
    rows.push({
      type: "Payment",
      reference: paymentInfo?.reference || "—",
      date: paymentInfo?.date || "",
      method: paymentInfo?.paymentMethod || "",
      amount: headerAmount,
      amountUsed: headerAmount,
    });
    
    return rows;
  } else {
    // View format: Reference, Date, Payment Method, Amount
    return [
      {
        reference: paymentInfo?.reference || "—",
        date: paymentInfo?.date || "",
        method: paymentInfo?.paymentMethod || "",
        amount: headerAmount,
      },
    ];
  }
};

export function PaymentReceiptModalContainer(
  props: PaymentReceiptModalContainerProps
) {
  const {
    open,
    onOpenChange,
    location,
    customerId,
    paymentId,
    customerName,
    customerEmail,
    customerPhone,
    mode = "view",
    directPaymentData,
    onEdit,
    onDelete,
    onEmail,
  } = props;

  // State
  const [isLoading, setIsLoading] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Data state
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [paymentInfo, setPaymentInfo] = React.useState<PaymentInfo | null>(null);
  const [lessons, setLessons] = React.useState<PaymentUsedLesson[]>([]);
  const [groupLessons, setGroupLessons] = React.useState<PaymentGroupLesson[]>([]);
  const [invoices, setInvoices] = React.useState<PaymentInvoice[]>([]);

  // Edit state
  const [editDate, setEditDate] = React.useState<Date>(new Date());
  const [editForm, setEditForm] = React.useState<EditFormData>({
    date: "",
    method: "",
    reference: "",
    amountReceived: "0.00",
  });
  const [lessonEditRows, setLessonEditRows] = React.useState<EditLessonRow[]>([]);
  const [groupLessonEditRows, setGroupLessonEditRows] = React.useState<GroupLessonEditRow[]>([]);
  const [invoiceEditRows, setInvoiceEditRows] = React.useState<InvoiceEditRow[]>([]);

  const receiptHtmlRef = React.useRef<HTMLDivElement>(null);

  // Fetch payment receipt data
  const fetchPaymentReceiptData = React.useCallback(async () => {
    // Skip API fetch if mode is "new" and directPaymentData is provided
    if (mode === "new" && directPaymentData) {
      setIsLoading(true);
      try {
        // Transform directPaymentData to match expected format
        const paymentInfo: PaymentInfo = {
          reference: directPaymentData.reference || "",
          date: directPaymentData.date,
          paymentMethod: directPaymentData.paymentMethod,
          amount: directPaymentData.amount,
          locationDetails: null,
          locationHstRegistrationNo: "FQR547785GT1234", // Default HST number
          acknowledgmentMessage: "Thank you for your payment!",
        };

        const transformedLessons: PaymentUsedLesson[] = (directPaymentData.lessons || []).map((lesson, index) => ({
          id: index + 1,
          originalDate: lesson.date,
          date: lesson.date,
          student: lesson.student,
          program: lesson.program,
          teacher: lesson.teacher,
          amount: lesson.amount,
          payment: lesson.payment,
          balance: lesson.balance,
        }));

        const transformedGroupLessons: PaymentGroupLesson[] = (directPaymentData.groupLessons || []).map((gl, index) => ({
          id: index + 1,
          date: gl.date,
          student: gl.student,
          program: gl.program,
          invoiced: "No",
          amount: gl.amount,
          balance: gl.balance,
        }));

        const transformedInvoices: PaymentInvoice[] = (directPaymentData.invoices || []).map((inv, index) => ({
          id: index + 1,
          date: inv.date,
          number: inv.number,
          amount: inv.amount,
          payment: inv.payment,
          balance: inv.balance,
        }));

        setPaymentInfo(paymentInfo);
        setLessons(transformedLessons);
        setGroupLessons(transformedGroupLessons);
        setInvoices(transformedInvoices);
        setPaymentMethods([]); // Empty for new payment mode

        setEditForm({
          date: directPaymentData.date || "",
          method: "",
          reference: directPaymentData.reference || "",
          amountReceived: directPaymentData.amount.toString() || "0.00",
        });
      } catch (error) {
        console.error("Error processing payment data:", error);
        toast.error("Failed to process payment data");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Original API fetch for "view" mode
    if (!location || !paymentId) return;

    setIsLoading(true);
    try {
      const data = await getPaymentReceiptData(location, paymentId);

      setPaymentInfo(data.info);
      setLessons(data.lessons.data);
      setGroupLessons(data.groupLessons.data);
      setInvoices(data.invoices.data);
      setPaymentMethods(data.paymentMethods);

      // Set default payment method and date
      if (data.info && data.paymentMethods.length > 0) {
        const foundMethod = data.paymentMethods.find(
          (m) => m.name.toLowerCase() === data.info?.paymentMethod.toLowerCase()
        );

        setEditForm({
          date: data.info.date || "",
          method: foundMethod
            ? foundMethod.id.toString()
            : data.paymentMethods[0].id.toString(),
          reference: data.info.reference || "",
          amountReceived: data.info.amount.toString() || "0.00",
        });

        // Parse and set the payment date from API (format: "Nov 12, 2025")
        if (data.info.date) {
          let parsedDate: Date | undefined;
          try {
            // Try parsing with "MMM dd, yyyy" format
            parsedDate = parse(data.info.date, "MMM dd, yyyy", new Date());
            if (!isValid(parsedDate)) {
              // Try parsing with "MMM d, yyyy" format (single digit day)
              parsedDate = parse(data.info.date, "MMM d, yyyy", new Date());
            }
            if (isValid(parsedDate)) {
              setEditDate(parsedDate);
            }
          } catch (e) {
            console.error("Error parsing payment date from API:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching payment receipt data:", error);
      toast.error("Failed to load payment receipt data");
    } finally {
      setIsLoading(false);
    }
  }, [location, paymentId, mode, directPaymentData, customerName]);

  // Reset editing state when modal closes or paymentId changes
  React.useEffect(() => {
    if (!open || !paymentId) {
      setIsEditing(false);
    }
  }, [open, paymentId]);

  // Fetch data when modal opens
  React.useEffect(() => {
    if (open) {
      fetchPaymentReceiptData();
    }
  }, [open, fetchPaymentReceiptData]);

  // Reset editing state when mode changes
  React.useEffect(() => {
    if (mode === "new") {
      setIsEditing(false);
    }
  }, [mode]);

  // Computed values
  const amountNumber = React.useMemo(
    () => paymentInfo?.amount || 0,
    [paymentInfo]
  );
  const headerAmount = React.useMemo(
    () => formatCurrency(amountNumber),
    [amountNumber]
  );

  const usedAmount = React.useMemo(() => {
    return lessons.reduce(
      (sum, lesson) => sum + normalizeAmount(lesson.payment),
      0
    );
  }, [lessons]);

  const showAllocations = usedAmount > 0 || lessons.length > 0;

  // Build rows
  const allocationRows = React.useMemo(
    () => transformLessonsToAllocationRows(lessons),
    [lessons]
  );

  const groupLessonRows = React.useMemo(
    () => transformGroupLessonsToRows(groupLessons),
    [groupLessons]
  );

  const invoiceRows = React.useMemo(
    () => transformInvoicesToRows(invoices),
    [invoices]
  );

  // Extract credits from directPaymentData for new mode
  const creditsForReceipt = React.useMemo(() => {
    if (mode === "new" && directPaymentData?.credits) {
      return directPaymentData.credits;
    }
    return undefined;
  }, [mode, directPaymentData]);

  const receiptRows = React.useMemo(
    () => createReceiptRow(paymentInfo, headerAmount, mode, creditsForReceipt),
    [paymentInfo, headerAmount, mode, creditsForReceipt]
  );

  // Build payment receipt data for print/email
  const paymentReceiptData: PaymentReceiptData = React.useMemo(
    () => ({
      headerAmount,
      paymentDate: paymentInfo?.date,
      paymentMethod: paymentInfo?.paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
      hstNumber: paymentInfo?.locationHstRegistrationNo || paymentInfo?.locationDetails?.hstRegistrationNo,
      locationDetails: paymentInfo?.locationDetails || null,
      allocationRows: showAllocations ? allocationRows : undefined,
      groupLessonRows: groupLessonRows.length > 0 ? groupLessonRows : undefined,
      invoiceRows: invoiceRows.length > 0 ? invoiceRows : undefined,
      receiptRows,
    }),
    [
      headerAmount,
      paymentInfo,
      customerName,
      customerPhone,
      customerEmail,
      showAllocations,
      allocationRows,
      groupLessonRows,
      invoiceRows,
      receiptRows,
    ]
  );

  // Initialize edit rows and date when entering edit mode
  React.useEffect(() => {
    if (isEditing) {
      setLessonEditRows(transformLessonsToEditRows(lessons));
      setGroupLessonEditRows(transformGroupLessonsToEditRows(groupLessonRows));
      setInvoiceEditRows(transformInvoicesToEditRows(invoiceRows));
      
      // Set edit date from API if available
      if (paymentInfo?.date) {
        let parsedDate: Date | undefined;
        try {
          // Try parsing with "MMM dd, yyyy" format
          parsedDate = parse(paymentInfo.date, "MMM dd, yyyy", new Date());
          if (!isValid(parsedDate)) {
            // Try parsing with "MMM d, yyyy" format (single digit day)
            parsedDate = parse(paymentInfo.date, "MMM d, yyyy", new Date());
          }
          if (isValid(parsedDate)) {
            setEditDate(parsedDate);
          }
        } catch (e) {
          console.error("Error parsing payment date from API:", e);
        }
      }
    } else {
      setLessonEditRows([]);
      setGroupLessonEditRows([]);
      setInvoiceEditRows([]);
    }
  }, [isEditing, lessons, groupLessonRows, invoiceRows, paymentInfo]);

  // Calculate amounts
  const amountToApply = React.useMemo(() => {
    return calculateTotalAllocations<EditLessonRow | GroupLessonEditRow | InvoiceEditRow>(
      lessonEditRows,
      groupLessonEditRows,
      invoiceEditRows
    );
  }, [lessonEditRows, groupLessonEditRows, invoiceEditRows]);

  const amountToCredit = React.useMemo(() => {
    return calculateCreditAmount(editForm.amountReceived, amountToApply);
  }, [editForm.amountReceived, amountToApply]);

  // Handlers
  const handleEditClick = React.useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEdit = React.useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleSave = React.useCallback(async () => {
    if (!location || !customerId) {
      toast.error("Location and customer ID are required");
      return;
    }

    setIsSaving(true);
    try {
      const allocations = lessonEditRows.map((r) => ({
        lessonDate: r.date,
        amount: r.allocation,
      }));

      const glAllocations = groupLessonEditRows.map((r) => ({
        date: r.date,
        student: r.student,
        amount: r.allocation,
      }));

      const invAllocations = invoiceEditRows.map((r) => ({
        id: r.number,
        amount: r.allocation,
      }));

      const amountReceived = normalizeAmount(editForm.amountReceived);
      const formattedDate = formatDateForLegacy(editDate);
      const paymentMethodId = Number(editForm.method) || 1;

      // Prepare invoice payments
      const invoicePayments = invAllocations
        .filter((inv) => inv.amount > 0)
        .map((inv) => ({
          id: cleanInvoiceId(inv.id),
          value: inv.amount,
        }))
        .filter((inv) => inv.id > 0);

      // Prepare payment data and call API
      const paymentData: PaymentReceiveData = {
        userId: customerId,
        date: formattedDate,
        paymentMethodId: paymentMethodId,
        reference: editForm.reference || "",
        amount: amountReceived,
        amountNeeded: amountToApply,
        selectedCreditValue: 0.0,
        amountToDistribute: amountToApply,
        notes: editForm.reference || "",
        invoicePayments: invoicePayments.length > 0 ? invoicePayments : undefined,
        canUsePaymentCredits: 0,
        canUseInvoiceCredits: 0,
        prId: "",
      };

      const response = await receivePayment(location, paymentData);
      if (!response.status) {
        const errorMessage =
          response.message ||
          response.errors?.join(", ") ||
          "Failed to save payment";
        toast.error(errorMessage);
        return;
      }

      toast.success("Payment saved successfully");
      onEdit?.({
        date: formattedDate,
        method: editForm.method,
        reference: editForm.reference,
        amountReceived: amountReceived,
        allocations,
        groupLessonAllocations: glAllocations,
        invoiceAllocations: invAllocations,
      });
      setIsEditing(false);
      fetchPaymentReceiptData();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save payment";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [
    location,
    customerId,
    lessonEditRows,
    groupLessonEditRows,
    invoiceEditRows,
    editForm,
    editDate,
    amountToApply,
    onEdit,
    fetchPaymentReceiptData,
  ]);

  // Print handler - using global utility
  const handlePrint = React.useCallback(() => {
    const success = printPaymentReceipt(paymentReceiptData);
    if (!success) {
      toast.error("Failed to open print dialog. Please check if pop-ups are blocked.");
    }
  }, [paymentReceiptData]);

  // Email handler - using global utility
  const handleEmail = React.useCallback(() => {
    if (onEmail) {
      const emailContent = generatePaymentReceiptEmail(paymentReceiptData);

      onEmail({
        subject: "Payment from Arcadia Academy of Music",
        content: emailContent,
        receiptHtml: emailContent,
      });
    }
  }, [onEmail, paymentReceiptData]);

  const handleDelete = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(() => {
    onDelete?.();
    setShowDeleteConfirm(false);
    onOpenChange(false);
  }, [onDelete, onOpenChange]);

  const handleDeleteCancel = React.useCallback(() => {
    setShowDeleteConfirm(false);
  }, []);

  // Create allocation handlers
  const handleLessonAllocationChange = React.useMemo(
    () => createAllocationHandler(setLessonEditRows),
    []
  );

  const handleGroupLessonAllocationChange = React.useMemo(
    () => createAllocationHandler(setGroupLessonEditRows),
    []
  );

  const handleInvoiceAllocationChange = React.useMemo(
    () => createAllocationHandler(setInvoiceEditRows),
    []
  );

  return (
    <PaymentReceiptModalUI
      open={open}
      onOpenChange={onOpenChange}
      isEditing={isEditing}
      showDeleteConfirm={showDeleteConfirm}
      isSaving={isSaving}
      isLoading={isLoading}
      isLoadingPaymentMethods={isLoading}
      headerAmount={isLoading ? "$0.00" : headerAmount}
      paymentDate={paymentInfo?.date}
      paymentMethod={paymentInfo?.paymentMethod}
      customerName={customerName}
      customerPhone={customerPhone}
      customerEmail={customerEmail}
      hstNumber={paymentInfo?.locationHstRegistrationNo || paymentInfo?.locationDetails?.hstRegistrationNo}
      showAllocations={showAllocations}
      receiptHtmlRef={receiptHtmlRef}
      allocationRows={allocationRows}
      groupLessonRows={groupLessonRows}
      invoiceRows={invoiceRows}
      receiptRows={receiptRows}
      editDate={editDate}
      editForm={editForm}
      paymentMethods={paymentMethods}
      lessonEditRows={lessonEditRows}
      groupLessonEditRows={groupLessonEditRows}
      invoiceEditRows={invoiceEditRows}
      amountToApply={amountToApply}
      amountToCredit={amountToCredit}
      onEditDateChange={setEditDate}
      onEditFormChange={setEditForm}
      onLessonAllocationChange={handleLessonAllocationChange}
      onGroupLessonAllocationChange={handleGroupLessonAllocationChange}
      onInvoiceAllocationChange={handleInvoiceAllocationChange}
      onEditClick={handleEditClick}
      onCancelEdit={handleCancelEdit}
      onSave={handleSave}
      onPrint={handlePrint}
      onEmail={handleEmail}
      onDelete={handleDelete}
      onDeleteConfirm={handleDeleteConfirm}
      onDeleteCancel={handleDeleteCancel}
      mode={mode}
      acknowledgmentMessage={paymentInfo?.acknowledgmentMessage}
      showEditButton={mode === "view"}
      showDeleteButton={mode === "view"}
    />
  );
}
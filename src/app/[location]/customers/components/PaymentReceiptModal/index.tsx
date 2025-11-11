"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "../ReceivePaymentModal/components/DatePicker";
import type { InvoiceData, GroupLessonDueData } from "../../tableConfigs";
import { receivePayment, PaymentReceiveData } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";
import { getPaymentMethods } from "../ReceivePaymentModal/api/receive-payment.api";
import type { PaymentMethod } from "../ReceivePaymentModal/api/receive-payment.api";

export interface PaymentReceiptData {
  date: string;
  notes: string;
  amount: number | string;
  used: number | string;
  remaining: number | string;
}

interface PaymentReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location?: string;
  customerId?: number;
  payment?: PaymentReceiptData | null;
  receiptHtml?: string; // HTML content from API response
  customerName?: string;
  customerEmail?: string;
  customerEmails?: string[];
  customerPhone?: string;
  privateLessonDue?: Array<{
    lessonDate: string;
    studentName: string;
    programName: string;
    teacherName: string;
    amount: number | string;
  }>;
  groupLessonDueData?: GroupLessonDueData[];
  invoiceData?: InvoiceData[];
  totalBalance?: string;
  locationName?: string;
  onEdit?: (data: { date: string; method: string; reference: string; amountReceived: number; allocations?: Array<{ lessonDate: string; amount: number }>; groupLessonAllocations?: Array<{ date: string; student: string; amount: number }>; invoiceAllocations?: Array<{ id: string; amount: number }> }) => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onEmail?: (payload: { subject: string; content: string; receiptHtml?: string }) => void;
}

export function PaymentReceiptModal({
  open,
  onOpenChange,
  location,
  customerId,
  payment,
  receiptHtml,
  customerName,
  customerEmail,
  customerEmails,
  customerPhone,
  privateLessonDue = [],
  groupLessonDueData,
  invoiceData,
  totalBalance,
  locationName,
  onEdit,
  onDelete,
  onPrint,
  onEmail,
}: PaymentReceiptModalProps) {
  const [isEditing, setIsEditing] = React.useState<boolean>(false);
  const [editDate, setEditDate] = React.useState<Date>(new Date());
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [paymentMethods, setPaymentMethods] = React.useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = React.useState<boolean>(false);
  const receiptHtmlRef = React.useRef<HTMLDivElement>(null);

  // Fetch payment methods when modal opens
  React.useEffect(() => {
    if (open) {
      setIsLoadingPaymentMethods(true);
      getPaymentMethods(location || "training-location")
        .then((methods) => {
          setPaymentMethods(methods);
          // Set payment method from existing payment or default to Cash
          if (methods.length > 0) {
            setEditForm((prev) => {
              // If payment exists and has a method name, try to find it by name
              if (payment?.notes && prev.method === "") {
                const foundMethod = methods.find(m => 
                  m.name.toLowerCase() === payment.notes?.toLowerCase()
                );
                if (foundMethod) {
                  return { ...prev, method: foundMethod.id.toString() };
                }
              }
              // Otherwise, set default to Cash if available
              if (!prev.method || prev.method === "") {
                const cashMethod = methods.find(m => m.name.toLowerCase() === 'cash');
                if (cashMethod) {
                  return { ...prev, method: cashMethod.id.toString() };
                } else {
                  return { ...prev, method: methods[0].id.toString() };
                }
              }
              return prev;
            });
          }
        })
        .catch((error) => {
          console.error('Error fetching payment methods:', error);
        })
        .finally(() => {
          setIsLoadingPaymentMethods(false);
        });
    }
  }, [open, payment?.notes]);

  // Handle scripts in HTML receipt content
  React.useEffect(() => {
    if (receiptHtml && receiptHtmlRef.current && open) {
      // Extract and execute scripts from the HTML if needed
      // Note: React's dangerouslySetInnerHTML doesn't execute scripts by default
      // We'll let the browser handle any inline scripts that are safe
      const scripts = receiptHtmlRef.current.querySelectorAll('script');
      scripts.forEach((oldScript) => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });
    }
  }, [receiptHtml, open]);

  // Helper function to format date to "MMM dd, yyyy" format
  const formatDateForLegacy = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${month} ${day}, ${year}`;
  };
  const [editForm, setEditForm] = React.useState<{ date: string; method: string; reference: string; amountReceived: string }>(() => ({
    date: payment?.date || "",
    method: "", // Will be set from payment methods API
    reference: "",
    amountReceived: (() => {
      const raw = payment?.amount as unknown;
      const num = typeof raw === "number" ? raw : typeof raw === "string" ? parseFloat(raw.replace(/[^0-9.-]+/g, "")) : 0;
      return Number.isFinite(num) ? String(num) : "0.00";
    })(),
  }));

  React.useEffect(() => {
    // Reset form when opening or payment changes
    // Note: method will be set from payment methods API in the other useEffect
    setEditForm((prev) => ({
      date: payment?.date || "",
      method: prev.method || "", // Keep existing method or empty
      reference: "",
      amountReceived: (() => {
        const raw = payment?.amount as unknown;
        const num = typeof raw === "number" ? raw : typeof raw === "string" ? parseFloat(raw.replace(/[^0-9.-]+/g, "")) : 0;
        return Number.isFinite(num) ? String(num) : "0.00";
      })(),
    }));
    setEditDate(new Date());
  }, [payment, open]);

  // Money parser utility - must be defined before hooks that depend on it
  const parseMoneyToNumber = React.useCallback((value: unknown) => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const n = parseFloat(value.replace(/[^0-9.-]+/g, ""));
      return Number.isFinite(n) ? n : 0;
    }
    return 0;
  }, []);

  // Used/remaining derived from selected payment – declared early for downstream hooks
  const usedAmount = React.useMemo(() => parseMoneyToNumber(payment?.used), [payment?.used, parseMoneyToNumber]);
  const remainingAmount = React.useMemo(() => parseMoneyToNumber(payment?.remaining), [payment?.remaining, parseMoneyToNumber]);

  // Build rows for edit mode with allocation matching amount received
  type EditLessonRow = AllocationRow & { allocation: number };
  const lessonEditRows: EditLessonRow[] = React.useMemo(() => {
    if (!isEditing) return [];
    const lessons = [...privateLessonDue];
    lessons.sort((a, b) => new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime());
    // Keep allocations static in edit mode; do not tie to Amount Received input
    let remaining = usedAmount;
    const rows: EditLessonRow[] = [];
    for (const l of lessons) {
      const amt = parseMoneyToNumber(l.amount);
      const alloc = Math.min(amt, Math.max(remaining, 0));
      rows.push({
        originalDate: l.lessonDate,
        date: l.lessonDate,
        student: l.studentName,
        program: l.programName,
        teacher: l.teacherName,
        amount: formatCurrency(amt),
        payment: formatCurrency(alloc),
        balance: formatCurrency(alloc),
        allocation: alloc,
      });
      remaining -= alloc;
    }
    return rows;
  }, [isEditing, privateLessonDue, usedAmount]);

  // amountToApply defined later after editable rows declarations
  const amountNumber = React.useMemo(() => {
    if (!payment) return 0;
    const amt = typeof payment.amount === "number" ? payment.amount : parseFloat((payment.amount || "0").toString().replace(/[^0-9.-]+/g, ""));
    return Number.isFinite(amt) ? amt : 0;
  }, [payment]);

  const headerAmount = React.useMemo(() => {
    return formatCurrency(amountNumber);
  }, [amountNumber]);

  const paymentMethod = payment?.notes || "";

  // Build email content for payment receipt (computed after data rows are defined later)

  // When a payment is fully used (remaining = $0.00) show a usage table
  type AllocationRow = {
    originalDate: string;
    date: string;
    student: string;
    program: string;
    teacher: string;
    amount: string;
    payment: string;
    balance: string;
  };

  const showAllocations = usedAmount > 0;

  const allocationColumns: ColumnDef<AllocationRow>[] = [
    {
      accessorKey: "originalDate",
      header: "Original Date",
      cell: ({ row }) => {
        const v = row.getValue("originalDate") as string;
        const display = v && v.includes("@") ? v : `${v} @ 06:00 PM`;
        return <div>{display}</div>;
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => {
        const v = row.getValue("date") as string;
        const display = v && v.includes("@") ? v : `${v} @ 06:00 PM`;
        return <div>{display}</div>;
      },
    },
    { accessorKey: "student", header: "Student" },
    { accessorKey: "program", header: "Program" },
    { accessorKey: "teacher", header: "Teacher" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> },
    { accessorKey: "payment", header: "Payment", cell: ({ row }) => <div className="text-right">{row.getValue("payment") as string}</div> },
    { accessorKey: "balance", header: "Balance", cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> },
  ];

  const allocationRows: AllocationRow[] = React.useMemo(() => {
    if (!showAllocations) return [];
    let remaining = usedAmount;
    const rows: AllocationRow[] = [];
    // Sort by lesson date ascending if possible
    const lessons = [...privateLessonDue];
    // naive parse to sort when dates are consistent
    lessons.sort((a, b) => new Date(a.lessonDate).getTime() - new Date(b.lessonDate).getTime());
    for (const lesson of lessons) {
      if (remaining <= 0) break;
      const lessonAmount = parseMoneyToNumber(lesson.amount);
      const pay = Math.min(lessonAmount, remaining);
      rows.push({
        originalDate: lesson.lessonDate,
        date: lesson.lessonDate,
        student: lesson.studentName,
        program: lesson.programName,
        teacher: lesson.teacherName,
        amount: formatCurrency(lessonAmount),
        payment: formatCurrency(pay),
        balance: formatCurrency(Math.max(lessonAmount - pay, 0)),
      });
      remaining -= pay;
    }
    // Fallback summary row if nothing derived
    if (rows.length === 0) {
      const usedFmt = formatCurrency(usedAmount || 0);
      rows.push({
        originalDate: payment?.date || "",
        date: payment?.date || "",
        student: "",
        program: "",
        teacher: "",
        amount: usedFmt,
        payment: usedFmt,
        balance: "$0.00",
      });
    }
    return rows;
  }, [showAllocations, payment?.date, usedAmount, privateLessonDue]);

  type ReceiptRow = {
    reference: string;
    date: string;
    method: string;
    amount: string;
  };

  const rows: ReceiptRow[] = [
    {
      reference: "—",
      date: payment?.date || "",
      method: paymentMethod || "",
      amount: headerAmount,
    },
  ];

  const columns: ColumnDef<ReceiptRow>[] = [
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

  // Group Lessons table within receipt (read-only)
  type GroupLessonRow = {
    date: string;
    student: string;
    program: string;
    invoiced: string;
    amount: string;
    balance: string;
  };

  const groupLessonRows: GroupLessonRow[] = React.useMemo(() => {
    const data = (groupLessonDueData || []) as GroupLessonDueData[];
    return data.map((g) => ({
      date: g.lessonDate,
      student: g.studentName,
      program: g.programName,
      invoiced: "No",
      amount: typeof g.amount === 'string' ? g.amount : formatCurrency(g.amount || 0),
      balance: "$0.00",
    }));
  }, [groupLessonDueData]);

  const groupLessonColumns: ColumnDef<GroupLessonRow>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "student", header: "Student" },
    { accessorKey: "program", header: "Program" },
    { accessorKey: "invoiced", header: "Invoiced ?" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> },
    { accessorKey: "balance", header: "Balance", cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> },
  ];

  // Invoices table within receipt (read-only)
  type InvoiceRow = {
    date: string;
    number: string;
    amount: string;
    payment: string;
    balance: string;
  };

  const invoiceRows: InvoiceRow[] = React.useMemo(() => {
    const data = (invoiceData || []) as InvoiceData[];
    return data.map((inv) => ({
      date: inv.date,
      number: inv.id,
      amount: formatCurrency(typeof inv.total === 'number' ? inv.total : 0),
      payment: formatCurrency(typeof inv.total === 'number' ? inv.total : 0),
      balance: formatCurrency(typeof inv.balance === 'number' ? inv.balance : 0),
    }));
  }, [invoiceData]);

  const invoiceColumns: ColumnDef<InvoiceRow>[] = [
    { accessorKey: "date", header: "Date" },
    { accessorKey: "number", header: "Number" },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> },
    { accessorKey: "payment", header: "Payment", cell: ({ row }) => <div className="text-right">{row.getValue("payment") as string}</div> },
    { accessorKey: "balance", header: "Balance", cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> },
  ];

  // Editable rows (group lessons + invoices) in edit mode
  type GroupLessonEditRow = GroupLessonRow & { allocation: number };
  type InvoiceEditRow = InvoiceRow & { allocation: number };

  const [groupLessonEditRows, setGroupLessonEditRows] = React.useState<GroupLessonEditRow[]>([]);
  const [invoiceEditRows, setInvoiceEditRows] = React.useState<InvoiceEditRow[]>([]);

  React.useEffect(() => {
    if (isEditing) {
      const gl = (groupLessonRows || []).map((r) => ({ ...r, allocation: (() => { const n = parseMoneyToNumber(r.amount); return Number.isFinite(n) ? n : 0; })() }));
      setGroupLessonEditRows(gl);
      const inv = (invoiceRows || []).map((r) => ({ ...r, allocation: (() => { const n = parseMoneyToNumber(r.amount); return Number.isFinite(n) ? n : 0; })() }));
      setInvoiceEditRows(inv);
    } else {
      setGroupLessonEditRows([]);
      setInvoiceEditRows([]);
    }
  }, [isEditing, groupLessonRows, invoiceRows, parseMoneyToNumber]);

  const amountToApply = React.useMemo(() => {
    const lessonsSum = lessonEditRows.reduce((sum, r) => sum + r.allocation, 0);
    const groupSum = groupLessonEditRows.reduce((sum, r) => sum + (Number.isFinite(r.allocation) ? r.allocation : 0), 0);
    const invSum = invoiceEditRows.reduce((sum, r) => sum + (Number.isFinite(r.allocation) ? r.allocation : 0), 0);
    return lessonsSum + groupSum + invSum;
  }, [lessonEditRows, groupLessonEditRows, invoiceEditRows]);
  const amountToCredit = React.useMemo(() => Math.max(0, parseMoneyToNumber(editForm.amountReceived) - amountToApply), [editForm.amountReceived, amountToApply]);

  // Build email content for payment receipt (only selected payment details)
  const emailSubject = React.useMemo(() => `Payment Receipt - ${headerAmount}`, [headerAmount]);
  const emailContent = React.useMemo(() => {
    const normalize = (v?: string) => (typeof v === 'string' ? v : '').trim();
    const sanitizeName = (name?: string) => {
      const n = normalize(name).replace(/undefined/gi, '').replace(/\s+/g, ' ').trim();
      return n || '';
    };
    const safeCustomerName = sanitizeName(customerName);
    const receiptDate = payment?.date || "";
    const method = paymentMethod || "";

    const lessonsHtml = showAllocations
      ? `
        <h3 style="margin:16px 0 8px;font-size:14px;">Lessons</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Original Date</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Date</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Student</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Program</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Teacher</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Amount</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Payment</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${allocationRows
              .map(
                (r) => `
                <tr>
                  <td style="border:1px solid #ddd;padding:6px;">${r.originalDate}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.date}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.student}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.program}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.teacher}</td>
                  <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.amount}</td>
                  <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.payment}</td>
                  <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.balance}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`
      : "";

    const groupLessonsHtml = groupLessonRows.length > 0
      ? `
        <h3 style="margin:16px 0 8px;font-size:14px;">Group Lessons</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Date</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Student</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Program</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Invoiced ?</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Amount</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${groupLessonRows.map(r => `
              <tr>
                <td style="border:1px solid #ddd;padding:6px;">${r.date}</td>
                <td style="border:1px solid #ddd;padding:6px;">${r.student}</td>
                <td style="border:1px solid #ddd;padding:6px;">${r.program}</td>
                <td style="border:1px solid #ddd;padding:6px;">${r.invoiced}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.amount}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.balance}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
      : "";

    const invoicesHtml = invoiceRows.length > 0
      ? `
        <h3 style="margin:16px 0 8px;font-size:14px;">Invoices</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Date</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Number</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Amount</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Payment</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceRows.map(r => `
              <tr>
                <td style="border:1px solid #ddd;padding:6px;">${r.date}</td>
                <td style="border:1px solid #ddd;padding:6px;">${r.number}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.amount}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.payment}</td>
                <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.balance}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
      : "";

    const paymentsUsedHtml = `
        <h3 style="margin:16px 0 8px;font-size:14px;">Payments Used</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Reference</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Date</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Payment Method</th>
              <th style=\"text-align:right;border:1px solid #ddd;padding:6px;\">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
                <tr>
                  <td style=\"border:1px solid #ddd;padding:6px;\">${r.reference}</td>
                  <td style=\"border:1px solid #ddd;padding:6px;\">${r.date}</td>
                  <td style=\"border:1px solid #ddd;padding:6px;\">${r.method}</td>
                  <td style=\"border:1px solid #ddd;padding:6px;text-align:right;\">${r.amount}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`;

    return `
      <p>Please find the Payment below</p>
      <p>This is to acknowledge the receipt of payment${safeCustomerName ? ` from ${safeCustomerName}` : ""}${receiptDate ? ` on ${receiptDate}` : ""} in the amount of ${headerAmount}${method ? ` via ${method}` : ""}. We have distributed it to the items below.</p>
      ${lessonsHtml}
      ${groupLessonsHtml}
      ${invoicesHtml}
      ${paymentsUsedHtml}
      <div style="margin-top:16px;font-size:12px;font-weight:600;">HST# <span style="font-weight:400">FQRS47785GT1234</span></div>
      <p style="margin-top:16px;">Thank you,</p>
      <p>Arcadia Academy of Music Team</p>
    `;
  }, [customerName, payment?.date, paymentMethod, headerAmount, showAllocations, allocationRows, rows, groupLessonRows, invoiceRows]);

  const handlePrintReceipt = React.useCallback(() => {
    try {
      const title = "Payment Receipt";
      const amountPaid = headerAmount;
      const receiptDate = payment?.date || "";
      const method = paymentMethod || "";
      const origin = window.location.origin || "";
      const logoUrl = `${origin}/SMW.png`;
      const fallbackLogoUrl = `${origin}/SMW-dark.png`;
      const normalize = (v?: string) => (typeof v === 'string' ? v : '').trim();
      const sanitizeName = (name?: string) => {
        const n = normalize(name).replace(/undefined/gi, '').replace(/\s+/g, ' ').trim();
        return n || '';
      };
      const safeCustomerName = sanitizeName(customerName);

      // Company details - update if you have dynamic config later
      const fromBlock = `
        <div style=\"font-size:12px;\">
          <div style=\"font-weight:600;\">Arcadia Academy of Music ( Training Location )</div>
          <div>205 Marycroft Ave., Unit 6</div>
          <div>Toronto, Ontario</div>
          <div>L4L 5X8</div>
          <div>(905) 254-3424</div>
          <div>traininglocation@example.com</div>
          <div>www.arcadiamusicacademy.com</div>
        </div>`;

      const toBlock = `
        <div style=\"font-size:12px;\">
          <div style=\"font-weight:600;\">${safeCustomerName}</div>
          ${customerPhone ? `<div>${customerPhone}</div>` : ""}
          ${customerEmail ? `<div>${customerEmail}</div>` : ""}
        </div>`;

      const lessonsHtml = showAllocations
        ? `
        <h3 style="margin:16px 0 8px;font-size:14px;">Lessons</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Original Date</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Date</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Student</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Program</th>
              <th style="text-align:left;border:1px solid #ddd;padding:6px;">Teacher</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Amount</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Payment</th>
              <th style="text-align:right;border:1px solid #ddd;padding:6px;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${allocationRows
              .map(
                (r) => `
                <tr>
                  <td style="border:1px solid #ddd;padding:6px;">${r.originalDate}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.date}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.student}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.program}</td>
                  <td style="border:1px solid #ddd;padding:6px;">${r.teacher}</td>
                  <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.amount}</td>
                  <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.payment}</td>
                  <td style="border:1px solid #ddd;padding:6px;text-align:right;">${r.balance}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`
        : "";

      const groupLessonsHtml = groupLessonRows.length > 0
        ? `
        <h3 style=\"margin:16px 0 8px;font-size:14px;\">Group Lessons</h3>
        <table style=\"width:100%;border-collapse:collapse;font-size:12px;\">
          <thead>
            <tr>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Date</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Student</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Program</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Invoiced ?</th>
              <th style=\"text-align:right;border:1px solid #ddd;padding:6px;\">Amount</th>
              <th style=\"text-align:right;border:1px solid #ddd;padding:6px;\">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${groupLessonRows.map(r => `
              <tr>
                <td style=\"border:1px solid #ddd;padding:6px;\">${r.date}</td>
                <td style=\"border:1px solid #ddd;padding:6px;\">${r.student}</td>
                <td style=\"border:1px solid #ddd;padding:6px;\">${r.program}</td>
                <td style=\"border:1px solid #ddd;padding:6px;\">${r.invoiced}</td>
                <td style=\"border:1px solid #ddd;padding:6px;text-align:right;\">${r.amount}</td>
                <td style=\"border:1px solid #ddd;padding:6px;text-align:right;\">${r.balance}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
        : "";

      const invoicesHtml = invoiceRows.length > 0
        ? `
        <h3 style=\"margin:16px 0 8px;font-size:14px;\">Invoices</h3>
        <table style=\"width:100%;border-collapse:collapse;font-size:12px;\">
          <thead>
            <tr>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Date</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Number</th>
              <th style=\"text-align:right;border:1px solid #ddd;padding:6px;\">Amount</th>
              <th style=\"text-align:right;border:1px solid #ddd;padding:6px;\">Payment</th>
              <th style=\"text-align:right;border:1px solid #ddd;padding:6px;\">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${invoiceRows.map(r => `
              <tr>
                <td style=\"border:1px solid #ddd;padding:6px;\">${r.date}</td>
                <td style=\"border:1px solid #ddd;padding:6px;\">${r.number}</td>
                <td style=\"border:1px solid #ddd;padding:6px;text-align:right;\">${r.amount}</td>
                <td style=\"border:1px solid #ddd;padding:6px;text-align:right;\">${r.payment}</td>
                <td style=\"border:1px solid #ddd;padding:6px;text-align:right;\">${r.balance}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>`
        : "";

      const paymentsUsedHtml = `
        <h3 style="margin:16px 0 8px;font-size:14px;">Payments Used</h3>
        <table style="width:100%;border-collapse:collapse;font-size:12px;">
          <thead>
            <tr>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Reference</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Date</th>
              <th style=\"text-align:left;border:1px solid #ddd;padding:6px;\">Payment Method</th>
              <th style=\"text-align:right;border:1px solid #ddd;padding:6px;\">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${rows
              .map(
                (r) => `
                <tr>
                  <td style=\"border:1px solid #ddd;padding:6px;\">${r.reference}</td>
                  <td style=\"border:1px solid #ddd;padding:6px;\">${r.date}</td>
                  <td style=\"border:1px solid #ddd;padding:6px;\">${r.method}</td>
                  <td style=\"border:1px solid #ddd;padding:6px;text-align:right;\">${r.amount}</td>
                </tr>`
              )
              .join("")}
          </tbody>
        </table>`;

      const headerHtml = `
        <div style=\"display:flex;align-items:center;justify-content:flex-start;gap:16px;margin-bottom:16px;\">
          <img src=\"${logoUrl}\" onerror=\"this.onerror=null;this.src='${fallbackLogoUrl}';\" alt=\"Logo\" style=\"height:56px;object-fit:contain\" />
        </div>
        <div style=\"display:flex;justify-content:space-between;margin-top:8px;margin-bottom:8px;gap:24px;\">
          <div>
            <div style=\"font-size:12px;margin-bottom:6px;\">From</div>
            ${fromBlock}
          </div>
          <div style=\"text-align:left;\">
            <div style=\"font-size:12px;margin-bottom:6px;\">To</div>
            ${toBlock}
          </div>
        </div>`;

      const body = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111;">
          <div style="display:flex;justify-content:space-between;align-items-center;margin-bottom:12px;">
            <h1 style="font-size:18px;margin:0;">Payment Receipt</h1>
            <div style="font-weight:600;">Amount Paid ${amountPaid}</div>
          </div>
          ${headerHtml}
          <p style="font-size:12px;line-height:1.6;margin:12px 0 16px;">
            This is to acknowledge the receipt of payment${safeCustomerName ? ` from ${safeCustomerName}` : ""}${receiptDate ? ` on ${receiptDate}` : ""} in the amount of ${amountPaid}${method ? ` via ${method}` : ""}. We have distributed it to the items below.
          </p>
          ${lessonsHtml}
          ${groupLessonsHtml}
          ${invoicesHtml}
          ${paymentsUsedHtml}
          <div style="margin-top:16px;font-size:12px;font-weight:600;">HST# <span style="font-weight:400">FQRS47785GT1234</span></div>
        </div>`;

      const html = `
        <html>
        <head>
          <title>${title}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            @media print {
              @page { margin: 16mm; }
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${body}</body>
        </html>`;

      const win = window.open("", "_blank");
      if (!win) return;
      win.document.open();
      win.document.write(html);
      win.document.close();
      win.focus();
      // give time to render
      setTimeout(() => win.print(), 150);
    } catch (e) {
      console.error("Failed to render print view", e);
    }
  }, [headerAmount, payment?.date, paymentMethod, customerName, showAllocations, allocationRows, rows, groupLessonRows, invoiceRows, customerPhone, customerEmail]);

  const handleEmailClick = React.useCallback(() => {
    const contentToUse = receiptHtml || emailContent;
    if (onEmail) {
      onEmail({
        subject: emailSubject,
        content: contentToUse,
        receiptHtml,
      });
      return;
    }

    if (receiptHtml) {
      const emailForm = document.querySelector("#modal-form");
      if (emailForm && emailForm instanceof HTMLFormElement) {
        emailForm.submit();
      }
    }
  }, [onEmail, emailSubject, emailContent, receiptHtml]);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[98vw] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">{isEditing ? "Edit Payment" : "Payment Receipt"}</DialogTitle>
            {!receiptHtml && <div className="text-sm font-semibold">Amount Paid {headerAmount}</div>}
          </div>
        </DialogHeader>

        <div className="px-6 pb-4 space-y-6 overflow-y-auto max-h-[70vh]">
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
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <Label>Date</Label>
                    <DatePicker date={editDate} onDateChange={setEditDate} />
                  </div>
                  <div className="space-y-1">
                    <Label>Payment Method</Label>
                    <Select 
                      value={editForm.method} 
                      onValueChange={(v) => setEditForm((s) => ({ ...s, method: v }))}
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
                      onChange={(e) => setEditForm((s) => ({ ...s, reference: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>Amount Received</Label>
                    <Input
                      type="number"
                      className="text-right"
                      value={editForm.amountReceived}
                      onChange={(e) => setEditForm((s) => ({ ...s, amountReceived: e.target.value }))}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {`This is to acknowledge the receipt of payment${customerName ? ` from ${customerName}` : ""}${payment?.date ? ` on ${payment.date}` : ""} in the amount of ${headerAmount}${paymentMethod ? ` via ${paymentMethod}` : ""}.`}
                  {" We have distributed it to the items below."}
                </p>
              )}

              {!isEditing && showAllocations ? (
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
              ) : !isEditing ? (
                <div className="text-center py-8">
                  <h3 className="text-2xl font-semibold mb-2">You didn&apos;t select any lessons or invoices</h3>
                  <p className="text-muted-foreground">
                    so we&apos;ll save this payment as credit to your customer account
                  </p>
                </div>
              ) : null}

              {isEditing && (
                <>
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Lessons</div>
                    <CustomTable
                      data={lessonEditRows}
                      columns={[
                        allocationColumns[0],
                        allocationColumns[1],
                        { accessorKey: "student", header: "Student" },
                        { accessorKey: "program", header: "Program" },
                        { accessorKey: "teacher", header: "Teacher" },
                        { accessorKey: "amount", header: "Amount", cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> },
                        { accessorKey: "payment", header: "Payment", cell: ({ row }) => <div className="text-right">{row.getValue("payment") as string}</div> },
                        { accessorKey: "balance", header: "Balance", cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> },
                        {
                          id: "paymentInput",
                          header: "Payment",
                          cell: ({ row }) => {
                            const current = (row.original as EditLessonRow).allocation;
                            return (
                              <Input
                                type="number"
                                value={Number(current).toString()}
                                onChange={(e) => {
                                  const v = parseFloat(e.target.value || "0");
                                  // Update via a shallow rebuild of memo data is not possible; keep disabled for lessons for now
                                }}
                                className="h-8 text-right"
                                disabled
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

                  {/* Group Lessons - editable payments */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Group Lessons</div>
                    <CustomTable
                      data={groupLessonEditRows}
                      columns={[
                        { accessorKey: "date", header: "Date" },
                        { accessorKey: "student", header: "Student" },
                        { accessorKey: "program", header: "Program" },
                        { accessorKey: "invoiced", header: "Invoiced ?" },
                        { accessorKey: "amount", header: "Amount", cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> },
                        { accessorKey: "balance", header: "Balance", cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> },
                        {
                          id: "glPayment",
                          header: "Payment",
                          cell: ({ row }) => (
                            <Input
                              type="number"
                              value={(row.original as GroupLessonEditRow).allocation.toString()}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value || "0");
                                setGroupLessonEditRows((prev) =>
                                  prev.map((r, i) => (i === row.index ? { ...r, allocation: Number.isFinite(v) ? v : 0 } : r))
                                );
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

                  {/* Invoices - editable payments */}
                  <div className="space-y-3">
                    <div className="text-sm font-semibold">Invoices</div>
                    <CustomTable
                      data={invoiceEditRows}
                      columns={[
                        { accessorKey: "date", header: "Date" },
                        { accessorKey: "number", header: "Number" },
                        { accessorKey: "amount", header: "Amount", cell: ({ row }) => <div className="text-right">{row.getValue("amount") as string}</div> },
                        { accessorKey: "payment", header: "Payment", cell: ({ row }) => <div className="text-right">{row.getValue("payment") as string}</div> },
                        { accessorKey: "balance", header: "Balance", cell: ({ row }) => <div className="text-right">{row.getValue("balance") as string}</div> },
                        {
                          id: "invPayment",
                          header: "Payment",
                          cell: ({ row }) => (
                            <Input
                              type="number"
                              value={(row.original as InvoiceEditRow).allocation.toString()}
                              onChange={(e) => {
                                const v = parseFloat(e.target.value || "0");
                                setInvoiceEditRows((prev) =>
                                  prev.map((r, i) => (i === row.index ? { ...r, allocation: Number.isFinite(v) ? v : 0 } : r))
                                );
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
                  <div className="flex flex-col items-end gap-2 pt-2">
                    <div className="text-muted-foreground">Amount To Apply {formatCurrency(amountToApply)}</div>
                    <div className="text-muted-foreground">Amount To Credit {formatCurrency(amountToCredit)}</div>
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

              {/* Payments Used must always be last */}
              {!isEditing && (
                <div className="space-y-3">
                  <div className="text-sm font-semibold">Payments Used</div>
                  <CustomTable
                    data={rows}
                    columns={columns}
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

              {/* Tax number placeholder row */}
              {!isEditing && (
                <div className="text-sm font-medium pt-2">
                  HST# <span className="text-muted-foreground">FQRS47785GT1234</span>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="px-6 py-4 border-t w-full flex flex-row items-center justify-between sm:justify-between">
          {receiptHtml && !isEditing ? (
            <div className="flex gap-2 w-full justify-end">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button
                variant="default"
                onClick={handleEmailClick}
              >
                Email
              </Button>
              <Button
                variant="default"
                onClick={() => {
                  // Extract print URL from HTML or use window print
                  const printUrl = '/admin/training-location/print/receipt';
                  if (printUrl) {
                    window.open(printUrl, '_blank');
                  } else {
                    window.print();
                  }
                }}
              >
                Print
              </Button>
            </div>
          ) : (
            <>
              <div>
                {!receiptHtml && <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>}
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                    <Button
                      disabled={isSaving}
                      onClick={async () => {
                    if (!location || !customerId) {
                      toast.error('Location and customer ID are required');
                      return;
                    }

                    setIsSaving(true);
                    try {
                      const allocations = lessonEditRows.map(r => ({ lessonDate: r.date, amount: r.allocation }));
                      const glAllocations = groupLessonEditRows.map(r => ({ date: r.date, student: r.student, amount: r.allocation }));
                      const invAllocations = invoiceEditRows.map(r => ({ id: r.number, amount: r.allocation }));
                      
                      const amountReceived = parseMoneyToNumber(editForm.amountReceived);
                      const calculatedAmountToApply = amountToApply;
                      const calculatedAmountToCredit = amountToCredit;
                      
                      // Format date
                      const formattedDate = formatDateForLegacy(editDate);
                      
                      // Payment method value is already the ID as a string, just convert to number
                      const paymentMethodId = Number(editForm.method) || 1; // Default to 1 if invalid
                      
                      // Prepare invoice payments array
                      // Convert invoice ID from string to number (handle both "I-06489" format and numeric strings)
                      const invoicePayments = invAllocations
                        .filter(inv => inv.amount > 0)
                        .map(inv => {
                          // Extract numeric ID from string (handle "I-06489" format or numeric string)
                          let cleanId = inv.id;
                          if (typeof cleanId === 'string') {
                            // Remove "I-" prefix if present (e.g., "I-52343" -> "52343")
                            cleanId = cleanId.startsWith('I-') ? cleanId.substring(2) : cleanId;
                            // Ensure it's a valid numeric ID (remove any other prefixes or non-numeric characters)
                            cleanId = cleanId.replace(/[^0-9]/g, '');
                          }
                          // Convert to number
                          const numericId = cleanId && !isNaN(Number(cleanId)) ? Number(cleanId) : 0;
                          return {
                            id: numericId,
                            value: inv.amount,
                          };
                        })
                        .filter(inv => inv.id > 0); // Filter out invalid IDs

                      // Prepare payment data for legacy API
                      const paymentData: PaymentReceiveData = {
                        userId: customerId,
                        date: formattedDate,
                        paymentMethodId: paymentMethodId,
                        reference: editForm.reference || '',
                        amount: amountReceived,
                        amountNeeded: calculatedAmountToApply,
                        selectedCreditValue: 0.00,
                        amountToDistribute: calculatedAmountToApply,
                        notes: editForm.reference || '',
                        invoicePayments: invoicePayments.length > 0 ? invoicePayments : undefined,
                        canUsePaymentCredits: 0,
                        canUseInvoiceCredits: 0,
                        prId: '',
                      };

                      // Call legacy API
                      const response = await receivePayment(location, paymentData);

                      if (response.status) {
                        toast.success('Payment saved successfully');
                        // Call onEdit callback to update local state
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
                      } else {
                        const errorMessage = response.message || response.errors?.join(", ") || "Failed to save payment";
                        toast.error(errorMessage);
                      }
                    } catch (error) {
                      const errorMessage = error instanceof Error ? error.message : "Failed to save payment";
                      toast.error(errorMessage);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button variant="default" onClick={() => setIsEditing(true)}>Edit</Button>
                <Button variant="default" onClick={handlePrintReceipt}>Print</Button>
                <Button
                  variant="default"
                  onClick={handleEmailClick}
                >
                  EMail
                </Button>
              </>
            )}
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Delete confirmation modal */}
    <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">Are you sure you want to delete this?</DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onDelete?.();
              setShowDeleteConfirm(false);
              onOpenChange(false);
            }}
          >
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    </>
  );
}



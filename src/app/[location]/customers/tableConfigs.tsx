import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";

// Data interfaces
export interface InvoiceData {
  id: string;
  date: string;
  status: string;
  total: number;
  balance: number;
}

export interface OutstandingInvoiceData {
  id: string;
  date: string;
  amount: number;
  payments: number;
  balanceDue: number;
}

export interface EquipmentRentalData {
  student: string;
  startDate: string;
  returnDate: string;
  rentalTerm: string;
  depositAmount: number;
  equipmentReturned: string;
  equipmentReturnedDate: string;
}

export interface RecurringPaymentData {
  toBeEnteredOn: string;
  nextPaymentDate: string;
  frequency: string;
  expiryDate: string;
  method: string;
  amount: number;
}

export interface PrivateLessonDueData {
  lessonDate: string;
  studentName: string;
  programName: string;
  teacherName: string;
  amount: number | string;
}

export interface GroupLessonDueData {
  lessonDate: string;
  studentName: string;
  programName: string;
  teacherName: string;
  amount: number | string;
}

export interface PaymentData {
  date: string;
  notes: string;
  amount: number | string;
  used: number | string;
  remaining: number | string;
}

// Column definitions
export const invoiceColumns: ColumnDef<InvoiceData>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
        {row.getValue("status")}
      </span>
    ),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("total"))}</div>
    ),
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("balance"))}</div>
    ),
  },
];

export const outstandingInvoiceColumns: ColumnDef<OutstandingInvoiceData>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      const value = row.getValue ? (row.getValue("id") as string) : (row.original as OutstandingInvoiceData).id;
      return <div className="font-medium">{value}</div>;
    },
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      const value = row.getValue ? (row.getValue("date") as string) : (row.original as OutstandingInvoiceData).date;
      return <div>{value}</div>;
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const value = row.getValue ? (row.getValue("amount") as number) : (row.original as OutstandingInvoiceData).amount;
      return <div className="text-right">{formatCurrency(value)}</div>;
    },
  },
  {
    accessorKey: "payments",
    header: "Payments",
    cell: ({ row }) => {
      const value = row.getValue ? (row.getValue("payments") as number) : (row.original as OutstandingInvoiceData).payments;
      return <div className="text-right">{formatCurrency(value)}</div>;
    },
  },
  {
    accessorKey: "balanceDue",
    header: "Balance Due",
    cell: ({ row }) => {
      const value = row.getValue ? (row.getValue("balanceDue") as number) : (row.original as OutstandingInvoiceData).balanceDue;
      return <div className="text-right">{formatCurrency(value)}</div>;
    },
  },
];

export const equipmentRentalColumns: ColumnDef<EquipmentRentalData>[] = [
  {
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
  },
  {
    accessorKey: "returnDate",
    header: "Return Date",
  },
  {
    accessorKey: "rentalTerm",
    header: "Rental Term",
  },
  {
    accessorKey: "depositAmount",
    header: "Deposit Amount",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("depositAmount"))}</div>
    ),
  },
  {
    accessorKey: "equipmentReturned",
    header: "Equipment Returned",
  },
  {
    accessorKey: "equipmentReturnedDate",
    header: "Equipment Returned Date",
  },
];

export const recurringPaymentColumns: ColumnDef<RecurringPaymentData>[] = [
  {
    accessorKey: "toBeEnteredOn",
    header: "To Be Entered On",
  },
  {
    accessorKey: "nextPaymentDate",
    header: "Next Payment Date",
  },
  {
    accessorKey: "frequency",
    header: "Frequency",
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
  },
  {
    accessorKey: "method",
    header: "Method",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("amount"))}</div>
    ),
  },
];

export const privateLessonDueColumns: ColumnDef<PrivateLessonDueData>[] = [
  {
    accessorKey: "lessonDate",
    header: "Lesson Date",
  },
  {
    accessorKey: "studentName",
    header: "Student",
  },
  {
    accessorKey: "programName",
    header: "Program",
  },
  {
    accessorKey: "teacherName",
    header: "Teacher",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const raw = row.getValue ? (row.getValue("amount") as unknown) : (row.original as unknown as { amount: unknown }).amount;
      if (typeof raw === "string") {
        return <div className="text-right">{raw}</div>;
      }
      const value = typeof raw === "number" ? raw : 0;
      return <div className="text-right">{formatCurrency(value)}</div>;
    },
  },
];

export const groupLessonDueColumns: ColumnDef<GroupLessonDueData>[] = [
  {
    accessorKey: "lessonDate",
    header: "Lesson Date",
  },
  {
    accessorKey: "studentName",
    header: "Student",
  },
  {
    accessorKey: "programName",
    header: "Program",
  },
  {
    accessorKey: "teacherName",
    header: "Teacher",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const raw = row.getValue ? (row.getValue("amount") as unknown) : (row.original as unknown as { amount: unknown }).amount;
      if (typeof raw === "string") {
        return <div className="text-right">{raw}</div>;
      }
      const value = typeof raw === "number" ? raw : 0;
      return <div className="text-right">{formatCurrency(value)}</div>;
    },
  },
];

export const paymentColumns: ColumnDef<PaymentData>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      // Handle both regular rows and footer rows
      const raw = row.getValue ? (row.getValue("amount") as unknown) : (row.original as unknown as { amount: unknown }).amount;
      const value = typeof raw === "number" ? raw : NaN;
      // Don't show amount in footer row
      if (value === 0 && (row.original as PaymentData).date === "") {
        return <div className="text-right"></div>;
      }
      if (typeof raw === "string") {
        return <div className="text-right">{raw}</div>;
      }
      return <div className="text-right">{formatCurrency(Number.isFinite(value) ? value : 0)}</div>;
    },
  },
  {
    accessorKey: "used",
    header: "Used",
    cell: ({ row }) => {
      // Handle both regular rows and footer rows
      const raw = row.getValue ? (row.getValue("used") as unknown) : (row.original as unknown as { used: unknown }).used;
      const value = typeof raw === "number" ? raw : NaN;
      // Don't show used in footer row
      if (value === 0 && (row.original as PaymentData).date === "") {
        return <div className="text-right"></div>;
      }
      if (typeof raw === "string") {
        return <div className="text-right">{raw}</div>;
      }
      return <div className="text-right">{formatCurrency(Number.isFinite(value) ? value : 0)}</div>;
    },
  },
  {
    accessorKey: "remaining",
    header: "Remaining",
    cell: ({ row }) => {
      // Handle both regular rows and footer rows
      const raw = row.getValue ? (row.getValue("remaining") as unknown) : (row.original as unknown as { remaining: unknown }).remaining;
      if (typeof raw === "string") {
        return <div className="text-right">{raw}</div>;
      }
      const value = typeof raw === "number" ? raw : 0;
      return <div className="text-right">{formatCurrency(value)}</div>;
    },
  },
];

// Table configurations
export const CUSTOMER_TABLE_CONFIGS = {
  invoices: {
    title: "Invoices",
    columns: invoiceColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  outstandingInvoices: {
    title: "Outstanding Invoices",
    columns: outstandingInvoiceColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  equipmentRentals: {
    title: "Equipment Rentals",
    columns: equipmentRentalColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  recurringPayments: {
    title: "Recurring Payments",
    columns: recurringPaymentColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  privateLessonDue: {
    title: "Private Lesson Due",
    columns: privateLessonDueColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  groupLessonDue: {
    title: "Group Lesson Due",
    columns: groupLessonDueColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
  payments: {
    title: "Payments",
    columns: paymentColumns,
    size: "compact" as const,
    variant: "striped" as const,
    enableSorting: true,
    enableExport: false,
    enablePrint: false,
    enableSearch: false,
    enableFilter: false,
    enableRowsPerPage: false,
  },
};
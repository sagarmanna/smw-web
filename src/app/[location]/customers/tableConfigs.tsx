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
  student: string;
  program: string;
  teacher: string;
  amount: number;
}

export interface GroupLessonDueData {
  lessonDate: string;
  student: string;
  program: string;
  teacher: string;
  amount: number;
}

export interface PaymentData {
  date: string;
  notes: string;
  amount: number;
  used: number;
  remaining: number;
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
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("id")}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("amount"))}</div>
    ),
  },
  {
    accessorKey: "payments",
    header: "Payments",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("payments"))}</div>
    ),
  },
  {
    accessorKey: "balanceDue",
    header: "Balance Due",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("balanceDue"))}</div>
    ),
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
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      // Handle both regular rows and footer rows
      const value = row.getValue ? (row.getValue("amount") as number) : (row.original as PrivateLessonDueData).amount;
      return (
        <div className="text-right">{formatCurrency(value)}</div>
      );
    },
  },
];

export const groupLessonDueColumns: ColumnDef<GroupLessonDueData>[] = [
  {
    accessorKey: "lessonDate",
    header: "Lesson Date",
  },
  {
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      // Handle both regular rows and footer rows
      const value = row.getValue ? (row.getValue("amount") as number) : (row.original as GroupLessonDueData).amount;
      return (
        <div className="text-right">{formatCurrency(value)}</div>
      );
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
      const value = row.getValue ? (row.getValue("amount") as number) : (row.original as PaymentData).amount;
      // Don't show amount in footer row
      if (value === 0 && (row.original as PaymentData).date === "") {
        return <div className="text-right"></div>;
      }
      return (
        <div className="text-right">{formatCurrency(value)}</div>
      );
    },
  },
  {
    accessorKey: "used",
    header: "Used",
    cell: ({ row }) => {
      // Handle both regular rows and footer rows
      const value = row.getValue ? (row.getValue("used") as number) : (row.original as PaymentData).used;
      // Don't show used in footer row
      if (value === 0 && (row.original as PaymentData).date === "") {
        return <div className="text-right"></div>;
      }
      return (
        <div className="text-right">{formatCurrency(value)}</div>
      );
    },
  },
  {
    accessorKey: "remaining",
    header: "Remaining",
    cell: ({ row }) => {
      // Handle both regular rows and footer rows
      const value = row.getValue ? (row.getValue("remaining") as number) : (row.original as PaymentData).remaining;
      return (
        <div className="text-right">{formatCurrency(value)}</div>
      );
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

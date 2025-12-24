import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { InvoiceRow } from "./invoicesListing.api";
import { formatCurrency } from "@/utils/formatCurrency";
import { startOfMonth, endOfMonth } from "date-fns";

// Column definitions for invoices table
export const invoiceColumns: ColumnDef<InvoiceRow>[] = [
  {
    accessorKey: "number",
    header: () => <span>Number</span>,
    cell: ({ row }: { row: { original: InvoiceRow } }) => (
      <span className="truncate block max-w-[120px]" title={row.original.number}>
        {row.original.number}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Number" },
  } as ColumnDef<InvoiceRow> & { filter: { type: string } },
  {
    accessorKey: "date",
    header: () => <span>Date</span>,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return (
        <span className="truncate block max-w-[140px]" title={date || ""}>
          {date || "-"}
        </span>
      );
    },
    enableSorting: true,
    filter: {
      type: "date-range",
      quickPreset: "privateLessons",
      initialValue: {
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
      }
    },
    meta: { printable: true, printableName: "Date" },
  } as ColumnDef<InvoiceRow> & { filter: { type: "date-range"; quickPreset?: string; initialValue?: { from: Date; to: Date } } },
  {
    accessorKey: "customer",
    header: () => <span>Customer</span>,
    cell: ({ row }: { row: { original: InvoiceRow } }) => (
      <span className="truncate block max-w-[200px]" title={row.original.customer}>
        {row.original.customer}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Customer" },
  } as ColumnDef<InvoiceRow> & { filter: { type: string } },
  {
    accessorKey: "student",
    header: () => <span>Student</span>,
    cell: ({ row }: { row: { original: InvoiceRow } }) => (
      <span className="truncate block max-w-[200px]" title={row.original.student}>
        {row.original.student}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Student" },
  } as ColumnDef<InvoiceRow> & { filter: { type: string } },
  {
    accessorKey: "phone",
    header: () => <span>Phone</span>,
    cell: ({ getValue }) => {
      const phone = getValue() as string;
      return (
        <span className="truncate block max-w-[150px]" title={phone || ""}>
          {phone || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Phone" },
  } as ColumnDef<InvoiceRow> & { filter: { type: string } },
  {
    accessorKey: "status",
    header: () => <span>Status</span>,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const statusLower = status?.toLowerCase();
      let statusColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      
      if (statusLower === "owing") {
        statusColor = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      } else if (statusLower === "paid") {
        statusColor = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      } else if (statusLower === "cancelled" || statusLower === "voided") {
        statusColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
      } else if (statusLower === "credit") {
        statusColor = "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      }
      
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {status || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: {
      type: "dropdown",
      options: [
        { value: "All", label: "All" },
        { value: "Credit", label: "Credit" },
        { value: "Owing", label: "Owing" },
        { value: "Paid", label: "Paid" },
        { value: "Voided", label: "Voided" },
      ]
    },
    meta: { printable: true, printableName: "Status" },
  } as ColumnDef<InvoiceRow> & { filter: { type: "dropdown"; options: { value: string; label: string }[] } },
  {
    accessorKey: "total",
    header: () => <span>Total</span>,
    cell: ({ getValue }) => {
      const total = getValue() as number;
      return (
        <span className="truncate block max-w-[100px] font-medium">
          {formatCurrency(total)}
        </span>
      );
    },
    enableSorting: false,
    meta: { printable: true, printableName: "Total" },
  } as ColumnDef<InvoiceRow>,
];


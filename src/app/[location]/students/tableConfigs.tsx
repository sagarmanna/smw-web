import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { StudentRow } from "./studentsListing.api";

// Column definitions for students table
export const studentColumns: ColumnDef<StudentRow>[] = [
  {
    accessorKey: "firstName",
    header: () => <span>First Name</span>,
    cell: ({ row }: { row: { original: StudentRow } }) => <span className="truncate block max-w-[220px]" title={row.original.firstName}>{row.original.firstName}</span>,
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "First Name" },
  } as ColumnDef<StudentRow> & { filter: { type: string } },
  {
    accessorKey: "lastName",
    header: () => <span>Last Name</span>,
    cell: ({ row }: { row: { original: StudentRow } }) => <span className="truncate block max-w-[220px]" title={row.original.lastName}>{row.original.lastName}</span>,
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Last Name" },
  } as ColumnDef<StudentRow> & { filter: { type: string } },
  {
    accessorKey: "customerName",
    header: () => <span>Customer</span>,
    cell: ({ row }: { row: { original: StudentRow } }) => <span className="truncate block max-w-[260px]" title={row.original.customerName}>{row.original.customerName}</span>,
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { 
      printable: true, 
      printableName: "Customer"
    },
  } as ColumnDef<StudentRow> & { filter: { type: string } },
  {
    accessorKey: "phoneNumber",
    header: () => <span>Phone</span>,
    cell: ({ getValue }) => {
      const phoneNumber = getValue() as string;
      return (
        <span className="truncate block max-w-[260px]" title={phoneNumber || ""}>
          {phoneNumber || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Phone" },
  } as ColumnDef<StudentRow> & { filter: { type: string } },
];


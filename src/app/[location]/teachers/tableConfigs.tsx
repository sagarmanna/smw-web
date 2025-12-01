import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TeacherRow } from "./teachers.api";

// Column definitions for teachers table
export const teacherColumns: ColumnDef<TeacherRow>[] = [
  {
    accessorKey: "firstName",
    header: () => <span>First Name</span>,
    cell: ({ row }: { row: { original: TeacherRow } }) => <span className="truncate block max-w-[220px]" title={row.original.firstName}>{row.original.firstName}</span>,
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "First Name" },
  } as ColumnDef<TeacherRow> & { filter: { type: string } },
  {
    accessorKey: "lastName",
    header: () => <span>Last Name</span>,
    cell: ({ row }: { row: { original: TeacherRow } }) => <span className="truncate block max-w-[220px]" title={row.original.lastName}>{row.original.lastName}</span>,
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Last Name" },
  } as ColumnDef<TeacherRow> & { filter: { type: string } },
  {
    accessorKey: "email",
    header: () => <span>Email</span>,
    cell: ({ row }: { row: { original: TeacherRow } }) => <span className="truncate block max-w-[260px]" title={row.original.email}>{row.original.email}</span>,
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { 
      printable: true, 
      printableName: "Email"
    },
  } as ColumnDef<TeacherRow> & { filter: { type: string } },
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
  } as ColumnDef<TeacherRow> & { filter: { type: string } },
];

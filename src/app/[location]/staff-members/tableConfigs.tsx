/**
 * Staff Members table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { StaffMemberRow } from "./staffMembers.api";

export const staffMemberColumns: ColumnDef<StaffMemberRow>[] = [
  {
    accessorKey: "firstName",
    header: () => <span>First Name</span>,
    cell: ({ row }: { row: { original: StaffMemberRow } }) => (
      <span className="text-sm">{row.original.firstName}</span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "First Name" },
  } as ColumnDef<StaffMemberRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "lastName",
    header: () => <span>Last Name</span>,
    cell: ({ row }: { row: { original: StaffMemberRow } }) => (
      <span className="text-sm">{row.original.lastName || ""}</span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Last Name" },
  } as ColumnDef<StaffMemberRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "email",
    header: () => <span>Email</span>,
    cell: ({ row }: { row: { original: StaffMemberRow } }) => (
      <span className="text-sm">{row.original.email}</span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Email" },
  } as ColumnDef<StaffMemberRow> & { filter: { type: string; initialValue?: string } },
];


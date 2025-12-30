/**
 * Administrators table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { AdministratorRow } from "./administrators.api";

export const administratorColumns: ColumnDef<AdministratorRow>[] = [
  {
    accessorKey: "firstName",
    header: () => <span>First Name</span>,
    cell: ({ row }: { row: { original: AdministratorRow } }) => (
      <span className="text-sm">{row.original.firstName}</span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "First Name" },
  } as ColumnDef<AdministratorRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "lastName",
    header: () => <span>Last Name</span>,
    cell: ({ row }: { row: { original: AdministratorRow } }) => (
      <span className="text-sm">{row.original.lastName || ""}</span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Last Name" },
  } as ColumnDef<AdministratorRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "email",
    header: () => <span>Email</span>,
    cell: ({ row }: { row: { original: AdministratorRow } }) => (
      <span className="text-sm">{row.original.email}</span>
    ),
    enableSorting: false,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Email" },
  } as ColumnDef<AdministratorRow> & { filter: { type: string; initialValue?: string } },
];


/**
 * Locations table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";

import { LocationRow } from "./locations.api";

export const locationColumns: ColumnDef<LocationRow>[] = [
  {
    accessorKey: "name",
    header: () => <span>Name</span>,
    cell: ({ row }: { row: { original: LocationRow } }) => <span className="text-sm">{row.original.name}</span>,
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Name" },
  } as ColumnDef<LocationRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "address",
    header: () => <span>Address</span>,
    cell: ({ row }: { row: { original: LocationRow } }) => <span className="text-sm">{row.original.address || ""}</span>,
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Address" },
  } as ColumnDef<LocationRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "email",
    header: () => <span>Email</span>,
    cell: ({ row }: { row: { original: LocationRow } }) => <span className="text-sm">{row.original.email || ""}</span>,
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Email" },
  } as ColumnDef<LocationRow> & { filter: { type: string; initialValue?: string } },
];



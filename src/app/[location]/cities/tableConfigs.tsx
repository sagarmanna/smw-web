/**
 * Cities table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CityRow } from "./cities.api";

export const cityColumns: ColumnDef<CityRow>[] = [
  {
    accessorKey: "name",
    header: () => <span>Name</span>,
    cell: ({ row }: { row: { original: CityRow } }) => <span className="text-sm">{row.original.name}</span>,
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Name" },
  } as ColumnDef<CityRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "province",
    header: () => <span>Province</span>,
    cell: ({ row }: { row: { original: CityRow } }) => <span className="text-sm">{row.original.province || ""}</span>,
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Province" },
  } as ColumnDef<CityRow> & { filter: { type: string; initialValue?: string } },
];


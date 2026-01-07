/**
 * Provinces table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ProvinceRow } from "./provinces.api";

export const provinceColumns: ColumnDef<ProvinceRow>[] = [
  {
    accessorKey: "name",
    header: () => <span>Name</span>,
    cell: ({ row }: { row: { original: ProvinceRow } }) => <span className="text-sm">{row.original.name}</span>,
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Name" },
  } as ColumnDef<ProvinceRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "taxRate",
    header: () => <span>Tax Rate (%)</span>,
    cell: ({ row }: { row: { original: ProvinceRow } }) => (
      <span className="text-sm">{Number.isFinite(row.original.taxRate) ? row.original.taxRate : ""}</span>
    ),
    meta: { printable: true, printableName: "Tax Rate (%)" },
  },
  {
    accessorKey: "country",
    header: () => <span>Country</span>,
    cell: ({ row }: { row: { original: ProvinceRow } }) => <span className="text-sm">{row.original.country || ""}</span>,
    meta: { printable: true, printableName: "Country" },
  },
];



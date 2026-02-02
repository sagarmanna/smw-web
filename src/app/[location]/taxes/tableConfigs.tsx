/**
 * Tax Codes table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TaxCodeRow } from "./taxes.api";
import { formatStartDateForDisplay } from "./utils/taxCodeUtils";

export const taxCodeColumns: ColumnDef<TaxCodeRow>[] = [
  {
    accessorKey: "taxName",
    header: () => <span>Tax Name</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => <span className="text-sm">{row.original.taxName}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "provinceName",
    header: () => <span>Province Name</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => <span className="text-sm">{row.original.provinceName || ""}</span>,
    enableSorting: true,
  },
  {
    accessorKey: "rate",
    header: () => <span>Rate (%)</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => (
      <span className="text-sm tabular-nums">{Number(row.original.rate ?? 0).toFixed(2)}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "startDate",
    header: () => <span>Start Date</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => (
      <span className="text-sm">{formatStartDateForDisplay(row.original.startDate)}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "code",
    header: () => <span>Code</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => <span className="text-sm">{row.original.code || ""}</span>,
    enableSorting: true,
  },
];



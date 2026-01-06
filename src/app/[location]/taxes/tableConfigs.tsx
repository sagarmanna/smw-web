/**
 * Tax Codes table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatDisplayDate } from "@/utils/dateUtils";
import { TaxCodeRow } from "./taxes.api";

const DEFAULT_EMPTY_START_DATE = "Dec 02, 2002";

const normalizeStartDateForDisplay = (value?: string): string => {
  if (!value) return DEFAULT_EMPTY_START_DATE;
  // Handles odd values like "Dec 02, 0002" or ISO-like "0002-12-02"
  if (value.includes("0002")) return DEFAULT_EMPTY_START_DATE;
  return formatDisplayDate(value);
};

export const taxCodeColumns: ColumnDef<TaxCodeRow>[] = [
  {
    accessorKey: "taxName",
    header: () => <span>Tax Name</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => <span className="text-sm">{row.original.taxName}</span>,
    enableSorting: true,
    filter: { type: "string", initialValue: "" },
    meta: { printable: true, printableName: "Tax Name" },
  } as ColumnDef<TaxCodeRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "provinceName",
    header: () => <span>Province Name</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => <span className="text-sm">{row.original.provinceName || ""}</span>,
    enableSorting: true,
    filter: { type: "string", initialValue: "" },
    meta: { printable: true, printableName: "Province Name" },
  } as ColumnDef<TaxCodeRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "rate",
    header: () => <span>Rate (%)</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => (
      <span className="text-sm tabular-nums">{Number(row.original.rate ?? 0).toFixed(2)}</span>
    ),
    enableSorting: false,
    meta: { printable: true, printableName: "Rate (%)" },
  },
  {
    accessorKey: "startDate",
    header: () => <span>Start Date</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => (
      <span className="text-sm">{normalizeStartDateForDisplay(row.original.startDate)}</span>
    ),
    enableSorting: true,
    filter: { type: "string", initialValue: "" },
    meta: { printable: true, printableName: "Start Date" },
  } as ColumnDef<TaxCodeRow> & { filter: { type: string; initialValue?: string } },
  {
    accessorKey: "code",
    header: () => <span>Code</span>,
    cell: ({ row }: { row: { original: TaxCodeRow } }) => <span className="text-sm">{row.original.code || ""}</span>,
    enableSorting: true,
    filter: { type: "string", initialValue: "" },
    meta: { printable: true, printableName: "Code" },
  } as ColumnDef<TaxCodeRow> & { filter: { type: string; initialValue?: string } },
];



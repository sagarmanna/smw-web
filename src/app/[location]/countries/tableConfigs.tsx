/**
 * Countries table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CountryRow } from "./countries.api";

export const countryColumns: ColumnDef<CountryRow>[] = [
  {
    accessorKey: "name",
    header: () => <span>Name</span>,
    cell: ({ row }: { row: { original: CountryRow } }) => <span className="text-sm">{row.original.name}</span>,
    enableSorting: true,
    filter: {
      type: "string",
      initialValue: "",
    },
    meta: { printable: true, printableName: "Name" },
  } as ColumnDef<CountryRow> & { filter: { type: string; initialValue?: string } },
];



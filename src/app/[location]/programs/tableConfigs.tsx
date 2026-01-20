/**
 * Programs table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ProgramRow } from "./programs.api";
import { formatRateForDisplay, parseRateInputToNumber } from "./utils/programsUtils";

export const createProgramColumns = (type: "PRIVATE" | "GROUP"): ColumnDef<ProgramRow>[] => {
  const isPrivate = type === "PRIVATE";
  
  return [
    {
      accessorKey: "name",
      header: () => <span>Name</span>,
      cell: ({ row }: { row: { original: ProgramRow } }) => <span className="text-sm">{row.original.name}</span>,
      enableSorting: true,
      meta: { printable: true, printableName: "Name" },
    },
    {
      id: "rate",
      accessorFn: (row: ProgramRow) => parseRateInputToNumber(row.rate),
      header: () => <span>{isPrivate ? "Rate Per Hour" : "Rate Per Course"}</span>,
      cell: ({ row }: { row: { original: ProgramRow } }) => {
        return <span className="text-sm">{formatRateForDisplay(row.original.rate)}</span>;
      },
      enableSorting: true,
      meta: { printable: true, printableName: isPrivate ? "Rate Per Hour" : "Rate Per Course" },
    },
  ];
};


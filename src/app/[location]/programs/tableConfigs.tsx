/**
 * Programs table column configurations
 */

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ProgramRow } from "./programs.api";

export const createProgramColumns = (type: "PRIVATE" | "GROUP"): ColumnDef<ProgramRow>[] => {
  const isPrivate = type === "PRIVATE";
  const rateAccessorKey = isPrivate ? "ratePerHour" : "ratePerCourse";
  
  return [
    {
      accessorKey: "name",
      header: () => <span>Name</span>,
      cell: ({ row }: { row: { original: ProgramRow } }) => <span className="text-sm">{row.original.name}</span>,
      enableSorting: true,
      meta: { printable: true, printableName: "Name" },
    },
    {
      id: rateAccessorKey,
      accessorFn: (row: ProgramRow) => {
        return isPrivate ? (row.ratePerHour ?? null) : (row.ratePerCourse ?? null);
      },
      header: () => <span>{isPrivate ? "Rate Per Hour" : "Rate Per Course"}</span>,
      cell: ({ row }: { row: { original: ProgramRow } }) => {
        // Directly access the rate from the row data
        const program = row.original;
        const rate = isPrivate ? program.ratePerHour : program.ratePerCourse;
        const displayValue = rate !== undefined && rate !== null ? `$${rate.toFixed(2)}` : "-";
        return <span className="text-sm">{displayValue}</span>;
      },
      enableSorting: true,
      meta: { printable: true, printableName: isPrivate ? "Rate Per Hour" : "Rate Per Course" },
    },
  ];
};


import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UnscheduledLessonRow } from "./unscheduledLessonsListing.api";

// Column definitions for unscheduled lessons table
export const unscheduledLessonColumns: ColumnDef<UnscheduledLessonRow>[] = [
  {
    accessorKey: "student",
    header: () => <span>Student</span>,
    cell: ({ row }: { row: { original: UnscheduledLessonRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.student}>
        {row.original.student}
      </span>
    ),
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Student" },
  } as ColumnDef<UnscheduledLessonRow> & { filter: { type: string } },
  {
    accessorKey: "program",
    header: () => <span>Program</span>,
    cell: ({ row }: { row: { original: UnscheduledLessonRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.program}>
        {row.original.program}
      </span>
    ),
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Program" },
  } as ColumnDef<UnscheduledLessonRow> & { filter: { type: string } },
  {
    accessorKey: "teacher",
    header: () => <span>Teacher</span>,
    cell: ({ row }: { row: { original: UnscheduledLessonRow } }) => (
      <span className="truncate block max-w-[260px]" title={row.original.teacher}>
        {row.original.teacher || "-"}
      </span>
    ),
    enableSorting: false,
    filter: {
      type: "string"
    },
    meta: { 
      printable: true, 
      printableName: "Teacher"
    },
  } as ColumnDef<UnscheduledLessonRow> & { filter: { type: string } },
  {
    accessorKey: "duration",
    header: () => <span>Duration</span>,
    cell: ({ getValue }) => {
      const duration = getValue() as string;
      return (
        <span className="truncate block max-w-[260px]" title={duration || ""}>
          {duration || "-"}
        </span>
      );
    },
    enableSorting: false,
    meta: { printable: true, printableName: "Duration" },
  },
  {
    accessorKey: "date",
    header: () => <span>Date</span>,
    cell: ({ getValue }) => {
      const date = getValue() as string;
      return (
        <span className="truncate block max-w-[260px]" title={date || ""}>
          {date || "-"}
        </span>
      );
    },
    enableSorting: false,
    meta: { printable: true, printableName: "Date" },
  },
  {
    accessorKey: "expiryDate",
    header: () => <span>Expiry Date</span>,
    cell: ({ getValue }) => {
      const expiryDate = getValue() as string;
      return (
        <span className="truncate block max-w-[260px]" title={expiryDate || ""}>
          {expiryDate || "-"}
        </span>
      );
    },
    enableSorting: false,
    meta: { printable: true, printableName: "Expiry Date" },
  },
];


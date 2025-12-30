import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { EnrolmentRow } from "./enrolmentsListing.api";

// Extended interface for rows with selection state
export interface EnrolmentRowWithSelection extends EnrolmentRow {
  selected?: boolean;
}

// Column definitions for enrolments table
export const enrolmentColumns: ColumnDef<EnrolmentRow>[] = [
  {
    accessorKey: "program",
    header: () => <span>Program</span>,
    cell: ({ row }: { row: { original: EnrolmentRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.program}>
        {row.original.program}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    minSize: 180,
    meta: { printable: true, printableName: "Program" },
  } as ColumnDef<EnrolmentRow> & { filter: { type: string } },
  {
    accessorKey: "student",
    header: () => <span>Student</span>,
    cell: ({ row }: { row: { original: EnrolmentRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.student}>
        {row.original.student}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    minSize: 180,
    meta: { printable: true, printableName: "Student" },
  } as ColumnDef<EnrolmentRow> & { filter: { type: string } },
  {
    accessorKey: "teacher",
    header: () => <span>Teacher</span>,
    cell: ({ row }: { row: { original: EnrolmentRow } }) => (
      <span className="truncate block max-w-[260px]" title={row.original.teacher}>
        {row.original.teacher}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    minSize: 180,
    meta: { 
      printable: true, 
      printableName: "Teacher"
    },
  } as ColumnDef<EnrolmentRow> & { filter: { type: string } },
  {
    accessorKey: "autoRenewal",
    header: () => <span>Auto Renewal</span>,
    cell: ({ getValue }) => {
      const autoRenewal = getValue() as string;
      const isEnabled = autoRenewal?.toLowerCase() === "enabled";
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isEnabled 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        }`}>
          {autoRenewal || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: {
      type: "dropdown",
      options: [
        { value: "Enabled", label: "Enabled" },
        { value: "Disabled", label: "Disabled" },
      ]
    },
    meta: { printable: true, printableName: "Auto Renewal" },
  } as ColumnDef<EnrolmentRow> & { filter: { type: "dropdown"; options: { value: string; label: string }[] } },
  {
    accessorKey: "startDate",
    header: () => <span>Start Date</span>,
    cell: ({ getValue }) => {
      const startDate = getValue() as string;
      return (
        <span className="truncate block max-w-[260px]" title={startDate || ""}>
          {startDate || "-"}
        </span>
      );
    },
    enableSorting: true,
    filter: {
      type: "date-range"
    },
    meta: { printable: true, printableName: "Start Date" },
  } as ColumnDef<EnrolmentRow> & { filter: { type: "date-range" } },
  {
    accessorKey: "endDate",
    header: () => <span>End Date</span>,
    cell: ({ getValue }) => {
      const endDate = getValue() as string;
      return (
        <span className="truncate block max-w-[260px]" title={endDate || ""}>
          {endDate || "-"}
        </span>
      );
    },
    enableSorting: true,
    filter: {
      type: "date-range"
    },
    meta: { printable: true, printableName: "End Date" },
  } as ColumnDef<EnrolmentRow> & { filter: { type: "date-range" } },
  {
    accessorKey: "lessonsRemaining",
    header: () => <span>Lessons Remaining</span>,
    cell: ({ getValue }) => {
      const lessonsRemaining = getValue() as number;
      return (
        <span className="truncate block max-w-[260px]">
          {lessonsRemaining ?? "-"}
        </span>
      );
    },
    enableSorting: true,
    filter: {
      type: "string"
    },
    minSize: 160,
    meta: { printable: true, printableName: "Lessons Remaining" },
  } as ColumnDef<EnrolmentRow> & { filter: { type: string } },
];



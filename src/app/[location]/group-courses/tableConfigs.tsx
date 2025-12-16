import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { GroupCourseRow } from "./types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDisplayDate } from "@/utils/dateUtils";

// Column definitions for group courses table
export const groupCourseColumns: ColumnDef<GroupCourseRow>[] = [
  {
    accessorKey: "course",
    header: () => <span>Course</span>,
    cell: ({ row }: { row: { original: GroupCourseRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.course}>
        {row.original.course}
      </span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Course" },
  },
  {
    accessorKey: "teacher",
    header: () => <span>Teacher</span>,
    cell: ({ row }: { row: { original: GroupCourseRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.teacher}>
        {row.original.teacher}
      </span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Teacher" },
  },
  {
    accessorKey: "rate",
    header: () => <span>Rate</span>,
    cell: ({ row }: { row: { original: GroupCourseRow } }) => (
      <div className="text-right">
        {formatCurrency(row.original.rate)}
      </div>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Rate" },
  },
  {
    accessorKey: "fromTime",
    header: () => <span>From Time</span>,
    cell: ({ row }: { row: { original: GroupCourseRow } }) => (
      <span className="truncate block max-w-[150px]" title={row.original.fromTime}>
        {row.original.fromTime}
      </span>
    ),
    enableSorting: false,
    meta: { printable: true, printableName: "From Time" },
  },
  {
    accessorKey: "duration",
    header: () => <span>Duration</span>,
    cell: ({ row }: { row: { original: GroupCourseRow } }) => (
      <span className="truncate block max-w-[120px]" title={row.original.duration}>
        {row.original.duration}
      </span>
    ),
    enableSorting: false,
    meta: { printable: true, printableName: "Duration" },
  },
  {
    accessorKey: "startDate",
    header: () => <span>Start Date</span>,
    cell: ({ row }: { row: { original: GroupCourseRow } }) => (
      <span className="truncate block max-w-[150px]" title={row.original.startDate}>
        {formatDisplayDate(row.original.startDate)}
      </span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Start Date" },
  },
  {
    accessorKey: "endDate",
    header: () => <span>End Date</span>,
    cell: ({ row }: { row: { original: GroupCourseRow } }) => (
      <span className="truncate block max-w-[150px]" title={row.original.endDate}>
        {formatDisplayDate(row.original.endDate)}
      </span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "End Date" },
  },
];


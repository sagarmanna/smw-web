import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PrivateLessonRow } from "./privateLessonsListing.api";
import { startOfDay, endOfDay } from "date-fns";

// Column definitions for private lessons table
export const privateLessonColumns: ColumnDef<PrivateLessonRow>[] = [
  {
    accessorKey: "date",
    header: () => <span>Date</span>,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.date}>
        {row.original.date}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "date-range",
      quickPreset: "privateLessons",
      initialValue: {
        from: startOfDay(new Date()),
        to: endOfDay(new Date()),
      }
    },
    meta: { printable: true, printableName: "Date" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: "date-range"; quickPreset?: string; initialValue?: { from: Date; to: Date } } },
  {
    accessorKey: "student",
    header: () => <span>Student</span>,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.student}>
        {row.original.student}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Student" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: string } },
  {
    accessorKey: "program",
    header: () => <span>Program</span>,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[220px]" title={row.original.program}>
        {row.original.program}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { printable: true, printableName: "Program" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: string } },
  {
    accessorKey: "teacher",
    header: () => <span>Teacher</span>,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[260px]" title={row.original.teacher}>
        {row.original.teacher}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string"
    },
    meta: { 
      printable: true, 
      printableName: "Teacher"
    },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: string } },
  {
    accessorKey: "duration",
    header: () => <span>Duration</span>,
    cell: ({ getValue }) => {
      const duration = getValue() as string;
      return (
        <span className="truncate block max-w-[120px]" title={duration || ""}>
          {duration || "-"}
        </span>
      );
    },
    enableSorting: false,
    meta: { printable: true, printableName: "Duration" },
  } as ColumnDef<PrivateLessonRow>,
  {
    accessorKey: "online",
    header: () => <span>Online</span>,
    cell: ({ getValue }) => {
      const online = getValue() as string;
      const isOnline = online?.toLowerCase() === "yes";
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isOnline 
            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" 
            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
        }`}>
          {online || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: {
      type: "dropdown",
      options: [
        { value: "Yes", label: "Yes" },
        { value: "No", label: "No" },
      ]
    },
    meta: { printable: true, printableName: "Online" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: "dropdown"; options: { value: string; label: string }[] } },
  {
    accessorKey: "status",
    header: () => <span>Status</span>,
    cell: ({ getValue }) => {
      const status = getValue() as string;
      const isCompleted = status?.toLowerCase() === "completed";
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isCompleted 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
        }`}>
          {status || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: {
      type: "dropdown",
      options: [
        { value: "Completed", label: "Completed" },
        { value: "Scheduled", label: "Scheduled" },
        { value: "Rescheduled", label: "Rescheduled" },
        { value: "Unscheduled", label: "Unscheduled" },
        { value: "Absent", label: "Absent" },
      ]
    },
    meta: { printable: true, printableName: "Status" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: "dropdown"; options: { value: string; label: string }[] } },
  {
    accessorKey: "payment",
    header: () => <span>Payment</span>,
    cell: ({ getValue }) => {
      const payment = getValue() as string;
      const isOwing = payment?.toLowerCase() === "owing";
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isOwing 
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" 
            : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
        }`}>
          {payment || "-"}
        </span>
      );
    },
    enableSorting: false,
    filter: {
      type: "dropdown",
      options: [
        { value: "Paid", label: "Paid" },
        { value: "Owing", label: "Owing" },
      ]
    },
    meta: { printable: true, printableName: "Payment" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: "dropdown"; options: { value: string; label: string }[] } },
  {
    accessorKey: "price",
    header: () => <span>Price</span>,
    cell: ({ getValue }) => {
      const price = getValue() as string;
      return (
        <span className="truncate block max-w-[120px]" title={price || ""}>
          {price || "-"}
        </span>
      );
    },
    enableSorting: false,
    meta: { printable: true, printableName: "Price" },
  } as ColumnDef<PrivateLessonRow>,
];


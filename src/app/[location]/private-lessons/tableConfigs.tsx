import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { PrivateLessonRow } from "./privateLessonsListing.api";
import { startOfDay, endOfDay } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

// Column definitions for private lessons table
export const privateLessonColumns: ColumnDef<PrivateLessonRow>[] = [
  {
    accessorKey: "date",
    header: () => <span>Date</span>,
    size: 160,
    minSize: 160,
    maxSize: 180,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[150px] xl:max-w-[170px]" title={row.original.date}>
        {row.original.date}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "date-range",
      quickPreset: "privateLessons",
      hideClearButton: true,
      compactDateLabel: true,
      controlClassName: "!w-full min-w-0",
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
    size: 120,
    minSize: 110,
    maxSize: 150,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[110px] xl:max-w-[130px]" title={row.original.student}>
        {row.original.student}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      controlClassName: "min-w-[90px] xl:min-w-[120px]",
    },
    meta: { printable: true, printableName: "Student" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: string } },
  {
    accessorKey: "program",
    header: () => <span>Program</span>,
    size: 120,
    minSize: 110,
    maxSize: 150,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[110px] xl:max-w-[130px]" title={row.original.program}>
        {row.original.program}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      controlClassName: "min-w-[90px] xl:min-w-[120px]",
    },
    meta: { printable: true, printableName: "Program" },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: string } },
  {
    accessorKey: "teacher",
    header: () => <span>Teacher</span>,
    size: 130,
    minSize: 120,
    maxSize: 160,
    cell: ({ row }: { row: { original: PrivateLessonRow } }) => (
      <span className="truncate block max-w-[120px] xl:max-w-[145px]" title={row.original.teacher}>
        {row.original.teacher}
      </span>
    ),
    enableSorting: true,
    filter: {
      type: "string",
      controlClassName: "min-w-[90px] xl:min-w-[120px]",
    },
    meta: { 
      printable: true, 
      printableName: "Teacher"
    },
  } as ColumnDef<PrivateLessonRow> & { filter: { type: string } },
  {
    accessorKey: "duration",
    header: () => <span>Duration</span>,
    size: 60,
    minSize: 56,
    maxSize: 70,
    cell: ({ getValue }) => {
      const duration = getValue() as string;
      return (
        <span className="truncate block max-w-[58px] xl:max-w-[70px]" title={duration || ""}>
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
    size: 72,
    minSize: 68,
    maxSize: 80,
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
      showLeadingFilterIcon: false,
      controlClassName: "!w-full min-w-0",
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
    size: 88,
    minSize: 84,
    maxSize: 100,
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
      showLeadingFilterIcon: false,
      controlClassName: "!w-full min-w-0",
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
    size: 80,
    minSize: 76,
    maxSize: 90,
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
      showLeadingFilterIcon: false,
      controlClassName: "!w-full min-w-0",
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
    size: 60,
    minSize: 56,
    maxSize: 70,
    cell: ({ getValue }) => {
      const price = getValue() as string;
      return (
        <span className="truncate block max-w-[58px] xl:max-w-[70px]" title={price || ""}>
          {price || "-"}
        </span>
      );
    },
    enableSorting: false,
    meta: { printable: true, printableName: "Price" },
  } as ColumnDef<PrivateLessonRow>,
];

// Export-specific columns for CSV, PDF, etc.
export const exportColumns: ColumnDef<PrivateLessonRow>[] = [
  {
    accessorKey: "date",
    header: "Date",
    meta: { printable: true, printableName: "Date" },
  },
  {
    accessorKey: "student",
    header: "Student",
    meta: { printable: true, printableName: "Student" },
  },
  {
    accessorKey: "program",
    header: "Program",
    meta: { printable: true, printableName: "Program" },
  },
  {
    accessorKey: "teacher",
    header: "Teacher",
    meta: { printable: true, printableName: "Teacher" },
  },
  {
    accessorKey: "duration",
    header: "Duration",
    meta: { printable: true, printableName: "Duration" },
  },
  {
    accessorKey: "online",
    header: "Online",
    meta: { printable: true, printableName: "Online" },
  },
  {
    accessorKey: "status",
    header: "Status",
    meta: { printable: true, printableName: "Status" },
  },
  {
    accessorKey: "payment",
    header: "Payment",
    meta: { printable: true, printableName: "Payment" },
  },
  {
    accessorKey: "price",
    header: "Price",
    meta: { printable: true, printableName: "Price" },
  },
];

// Helper function to create checkbox column
export function createCheckboxColumn(
  rows: PrivateLessonRow[],
  selectedRows: Set<number>,
  setSelectedRows: React.Dispatch<React.SetStateAction<Set<number>>>,
  clearSelection: () => void
): ColumnDef<PrivateLessonRow> {
  return {
    id: "select",
    header: () => {
      const allSelected = rows.length > 0 && rows.every(row => selectedRows.has(row.id));
      const someSelected = rows.some(row => selectedRows.has(row.id));

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={allSelected}
            onCheckedChange={(checked: boolean) => {
              if (checked) {
                setSelectedRows(new Set(rows.map(row => row.id)));
              } else {
                clearSelection();
              }
            }}
            aria-label="Select all"
            className={someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""}
          />
        </div>
      );
    },
    cell: ({ row }) => (
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={selectedRows.has(row.original.id)}
          onCheckedChange={(checked: boolean) => {
            setSelectedRows(prev => {
              const newSet = new Set(prev);
              if (checked) {
                newSet.add(row.original.id);
              } else {
                newSet.delete(row.original.id);
              }
              return newSet;
            });
          }}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 40,
  };
}


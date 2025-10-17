import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

// Data interfaces
export interface EnrolmentData {
  program: string;
  teacher: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface PrivateLessonData {
  dueDate: string;
  programName: string;
  date: string;
  duration: string;
  status: string;
  price: number;
  owing: number;
  online: string;
}

export interface GroupLessonData {
  dueDate: string;
  programName: string;
  date: string;
  duration: string;
  status: string;
  price: number;
  owing: number;
  online: string;
}

export interface AbsentLessonData {
  date: string;
  program: string;
  teacher: string;
  duration: string;
  invoiceId: string;
  online: string;
}

export interface UnscheduledLessonData {
  program: string;
  phone: string;
  duration: string;
  originalDate: string;
  expiryDate: string;
  online: string;
}

export interface CommentData {
  date: string;
  author: string;
  comment: string;
}

export interface HistoryData {
  message: string;
}

// Column definitions
export const enrolmentColumns: ColumnDef<EnrolmentData>[] = [
  { accessorKey: "program", header: "Program" },
  { accessorKey: "teacher", header: "Teacher" },
  { accessorKey: "day", header: "Day" },
  { accessorKey: "fromTime", header: "From Time" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "endDate", header: "End Date" },
];

export const privateLessonColumns: ColumnDef<PrivateLessonData>[] = [
  { 
    accessorKey: "dueDate", 
    header: "Due Date",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "programName", 
    header: "Program Name",
    size: 200,
    minSize: 150,
    maxSize: 300,
  },
  { 
    accessorKey: "date", 
    header: "Date",
    size: 180,
    minSize: 150,
    maxSize: 220,
  },
  { 
    accessorKey: "duration", 
    header: "Duration",
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
  { 
    accessorKey: "status", 
    header: "Status",
    size: 120,
    minSize: 100,
    maxSize: 140,
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("price") as number)}</div>
    ),
  },
  {
    accessorKey: "owing",
    header: "Owing",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("owing") as number)}</div>
    ),
  },
  { 
    accessorKey: "online", 
    header: "Online",
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
];

export const groupLessonColumns: ColumnDef<GroupLessonData>[] = [
  { 
    accessorKey: "dueDate", 
    header: "Due Date",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "programName", 
    header: "Program Name",
    size: 200,
    minSize: 150,
    maxSize: 300,
  },
  { 
    accessorKey: "date", 
    header: "Date",
    size: 180,
    minSize: 150,
    maxSize: 220,
  },
  { 
    accessorKey: "duration", 
    header: "Duration",
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
  { 
    accessorKey: "status", 
    header: "Status",
    size: 120,
    minSize: 100,
    maxSize: 140,
  },
  {
    accessorKey: "price",
    header: "Price",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("price") as number)}</div>
    ),
  },
  {
    accessorKey: "owing",
    header: "Owing",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("owing") as number)}</div>
    ),
  },
  { 
    accessorKey: "online", 
    header: "Online",
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
];

export const absentLessonColumns: ColumnDef<AbsentLessonData>[] = [
  { 
    accessorKey: "date", 
    header: "Date",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "program", 
    header: "Program",
    size: 200,
    minSize: 150,
    maxSize: 300,
  },
  { 
    accessorKey: "teacher", 
    header: "Teacher",
    size: 180,
    minSize: 150,
    maxSize: 220,
  },
  { 
    accessorKey: "duration", 
    header: "Duration",
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
  { 
    accessorKey: "invoiceId", 
    header: "Invoice ID",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "online", 
    header: "Online",
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
];

export const unscheduledLessonColumns: ColumnDef<UnscheduledLessonData>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(checked: boolean) => table.toggleAllPageRowsSelected(!!checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked: boolean) => row.toggleSelected(!!checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
  },
  { 
    accessorKey: "program", 
    header: "Program",
    size: 200,
    minSize: 150,
    maxSize: 300,
  },
  { 
    accessorKey: "phone", 
    header: "Phone",
    size: 150,
    minSize: 120,
    maxSize: 180,
  },
  { 
    accessorKey: "duration", 
    header: "Duration",
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
  { 
    accessorKey: "originalDate", 
    header: "Original Date",
    size: 150,
    minSize: 120,
    maxSize: 180,
  },
  { 
    accessorKey: "expiryDate", 
    header: "Expiry Date",
    size: 150,
    minSize: 120,
    maxSize: 180,
  },
  { 
    accessorKey: "online", 
    header: "Online",
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
  {
    id: "actions",
    header: "",
    cell: () => (
      <Button variant="ghost" size="icon" className="h-6 w-6">
        <ChevronDown className="h-4 w-4" />
      </Button>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
    minSize: 50,
    maxSize: 50,
  },
];

export const commentColumns: ColumnDef<CommentData>[] = [
  { 
    accessorKey: "date", 
    header: "Date",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "author", 
    header: "Author",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "comment", 
    header: "Comment",
    size: 300,
    minSize: 200,
    maxSize: 400,
  },
];

export const historyColumns: ColumnDef<HistoryData>[] = [
  { 
    accessorKey: "message", 
    header: "Message",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("message") as string}
      </div>
    ),
  },
];

interface DropdownMenuItem {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// Tab configuration
export interface TabConfig<TData = unknown> {
  id: string;
  title: string;
  hasAddButton: boolean;
  hasTable: boolean;
  emptyState?: string;
  columns?: ColumnDef<TData>[];
  dataKey: string;
  showMoreButton?: boolean;
  showAllCheckbox?: boolean;
  dropdownItems?: DropdownMenuItem[];
  dropdownLabel?: string;
}

export const STUDENT_TAB_CONFIGS: Record<string, TabConfig<unknown>> = {
  "private-lessons": {
    id: "private-lessons",
    title: "Private Lessons",
    hasAddButton: true,
    hasTable: true,
    columns: privateLessonColumns as ColumnDef<unknown>[],
    dataKey: "privateLessonData",
    showMoreButton: true,
  },
  "group-lessons": {
    id: "group-lessons",
    title: "Group Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: groupLessonColumns as ColumnDef<unknown>[],
    dataKey: "groupLessonData",
  },
  "absent-lessons": {
    id: "absent-lessons",
    title: "Absent Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: absentLessonColumns as ColumnDef<unknown>[],
    dataKey: "absentLessonData",
  },
  "unscheduled-lessons": {
    id: "unscheduled-lessons",
    title: "Unscheduled Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: unscheduledLessonColumns as ColumnDef<unknown>[],
    dataKey: "unscheduledLessonData",
    showAllCheckbox: true,
    dropdownItems: [
      { label: "Change Program/Teacher..", onClick: () => {
        // TODO: Implement change program/teacher functionality
      } },
      
    ],
    dropdownLabel: "Actions",
  },
  comments: {
    id: "comments",
    title: "Comments",
    hasAddButton: false,
    hasTable: false,
    emptyState: "No results found.",
    columns: commentColumns as ColumnDef<unknown>[],
    dataKey: "commentData",
  },
  history: {
    id: "history",
    title: "History",
    hasAddButton: false,
    hasTable: true,
    columns: historyColumns as ColumnDef<unknown>[],
    dataKey: "historyData",
  },
};

// Tab order
export const STUDENT_TAB_ORDER = [
  "private-lessons",
  "group-lessons",
  "absent-lessons",
  "unscheduled-lessons",
  "comments",
  "history",
];

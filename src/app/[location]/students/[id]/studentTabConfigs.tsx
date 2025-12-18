import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";

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
  id?: number;
  url?: string;
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
    maxSize: 150,
  },
  { 
    accessorKey: "price", 
    header: "Price",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  { 
    accessorKey: "owing", 
    header: "Owing",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => formatCurrency(row.original.owing),
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
  },
  { 
    accessorKey: "programName", 
    header: "Program Name",
  },
  { 
    accessorKey: "date", 
    header: "Date",
  },
  { 
    accessorKey: "duration", 
    header: "Duration",
  },
  { 
    accessorKey: "status", 
    header: "Status",
  },
  { 
    accessorKey: "price", 
    header: "Price",
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  { 
    accessorKey: "owing", 
    header: "Owing",
    cell: ({ row }) => formatCurrency(row.original.owing),
  },
  { 
    accessorKey: "online", 
    header: "Online",
  },
];

export const absentLessonColumns: ColumnDef<AbsentLessonData>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "program", header: "Program" },
  { accessorKey: "teacher", header: "Teacher" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "invoiceId", header: "Invoice ID" },
  { accessorKey: "online", header: "Online" },
];

export const unscheduledLessonColumns: ColumnDef<UnscheduledLessonData>[] = [
  { accessorKey: "program", header: "Program" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "originalDate", header: "Original Date" },
  { accessorKey: "expiryDate", header: "Expiry Date" },
  { accessorKey: "online", header: "Online" },
];

export const commentColumns: ColumnDef<CommentData>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "author", header: "Author" },
  { accessorKey: "comment", header: "Comment" },
];

export const historyColumns: ColumnDef<HistoryData>[] = [
  { accessorKey: "message", header: "Message" },
];

// Tab configuration interface
export interface StudentTabConfig<TData = unknown> {
  id: string;
  title: string;
  hasAddButton: boolean;
  hasTable: boolean;
  emptyState?: string;
  columns?: ColumnDef<TData>[];
  dataKey: string;
  showMoreButton?: boolean;
  showAllCheckbox?: boolean;
  dropdownItems?: Array<{ label: string; onClick: () => void }>;
  dropdownLabel?: string;
}

// Tab configurations
export const STUDENT_TAB_CONFIGS: Record<string, StudentTabConfig<unknown>> = {
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


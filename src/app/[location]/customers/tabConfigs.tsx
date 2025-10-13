import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";

// Data interfaces
export interface EnrolmentData {
  studentName: string;
  programName: string;
  teacherName: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  renewalDate: string;
}

export interface PrivateLessonData {
  studentName: string;
  teacherName: string;
  lessonDate: string;
  time: string;
  duration: string;
  status: string;
  notes: string;
}

export interface GroupLessonData {
  studentName: string;
  programName: string;
  teacherName: string;
  lessonDate: string;
  time: string;
  duration: string;
  status: string;
}

export interface ProformaInvoiceData {
  invoiceNumber: string;
  date: string;
  amount: number;
  status: string;
  dueDate: string;
}

export interface CommentData {
  date: string;
  author: string;
  comment: string;
  type: string;
}

export interface HistoryData {
  date: string;
  action: string;
  description: string;
  user: string;
}

// Column definitions
export const enrolmentColumns: ColumnDef<EnrolmentData>[] = [
  { accessorKey: "studentName", header: "Student Name" },
  { accessorKey: "programName", header: "Program Name" },
  { accessorKey: "teacherName", header: "Teacher Name" },
  { accessorKey: "day", header: "Day" },
  { accessorKey: "fromTime", header: "From Time" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "renewalDate", header: "Renewal Date" },
];

export const privateLessonColumns: ColumnDef<PrivateLessonData>[] = [
  { accessorKey: "studentName", header: "Student Name" },
  { accessorKey: "teacherName", header: "Teacher Name" },
  { accessorKey: "lessonDate", header: "Lesson Date" },
  { accessorKey: "time", header: "Time" },
  { accessorKey: "duration", header: "Duration" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
        {row.getValue("status")}
      </span>
    ),
  },
  { accessorKey: "notes", header: "Notes" },
];

export const groupLessonColumns: ColumnDef<GroupLessonData>[] = [
  { accessorKey: "studentName", header: "Student Name" },
  { accessorKey: "programName", header: "Program Name" },
  { accessorKey: "teacherName", header: "Teacher Name" },
  { accessorKey: "lessonDate", header: "Lesson Date" },
  { accessorKey: "time", header: "Time" },
  { accessorKey: "duration", header: "Duration" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
        {row.getValue("status")}
      </span>
    ),
  },
];

export const proformaInvoiceColumns: ColumnDef<ProformaInvoiceData>[] = [
  { accessorKey: "invoiceNumber", header: "Invoice Number" },
  { accessorKey: "date", header: "Date" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("amount"))}</div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
        {row.getValue("status")}
      </span>
    ),
  },
  { accessorKey: "dueDate", header: "Due Date" },
];

export const commentColumns: ColumnDef<CommentData>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "author", header: "Author" },
  { accessorKey: "comment", header: "Comment" },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium">
        {row.getValue("type")}
      </span>
    ),
  },
];

export const historyColumns: ColumnDef<HistoryData>[] = [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "action", header: "Action" },
  { accessorKey: "description", header: "Description" },
  { accessorKey: "user", header: "User" },
];

// Tab configuration
export interface TabConfig {
  id: string;
  title: string;
  hasAddButton: boolean;
  hasTable: boolean;
  emptyState?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  columns?: ColumnDef<any>[];
  dataKey: string;
}

export const CUSTOMER_TAB_CONFIGS: Record<string, TabConfig> = {
  students: {
    id: "students",
    title: "Students",
    hasAddButton: false,
    hasTable: false,
    emptyState: "No students found for this customer.",
    dataKey: "studentData",
  },
  enrolments: {
    id: "enrolments",
    title: "Enrolments",
    hasAddButton: true,
    hasTable: true,
    columns: enrolmentColumns,
    dataKey: "enrolmentData",
  },
  "private-lessons": {
    id: "private-lessons",
    title: "Private Lessons",
    hasAddButton: true,
    hasTable: true,
    columns: privateLessonColumns,
    dataKey: "privateLessonData",
  },
  "group-lessons": {
    id: "group-lessons",
    title: "Group Lessons",
    hasAddButton: true,
    hasTable: true,
    columns: groupLessonColumns,
    dataKey: "groupLessonData",
  },
  "proforma-invoices": {
    id: "proforma-invoices",
    title: "Pro-forma Invoices",
    hasAddButton: true,
    hasTable: true,
    columns: proformaInvoiceColumns,
    dataKey: "proformaInvoiceData",
  },
  comments: {
    id: "comments",
    title: "Comments",
    hasAddButton: true,
    hasTable: true,
    columns: commentColumns,
    dataKey: "commentData",
  },
  history: {
    id: "history",
    title: "History",
    hasAddButton: false,
    hasTable: true,
    columns: historyColumns,
    dataKey: "historyData",
  },
};

// Tab order
export const TAB_ORDER = [
  "students",
  "enrolments",
  "private-lessons",
  "group-lessons",
  "proforma-invoices",
  "comments",
  "history",
];

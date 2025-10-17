import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";

// Data interfaces
export interface StudentData {
  id: string;
  firstName: string;
  lastName: string;
  name: string; // Computed field for display
  birthDate: string;
  customerName: string;
  customerId?: string;
  phone?: string;
  email?: string;
  gender?: string;
  status?: string;
  notes?: string;
}

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
  dueDate: string;
  studentName: string;
  programName: string;
  date: string;
  duration: string;
  status: string;
  price: number;
  owing: number;
}

export interface GroupLessonData {
  dueDate: string;
  studentName: string;
  programName: string;
  date: string;
  duration: string;
  status: string;
  price: number;
  owing: number;
}

export interface ProformaInvoiceData {
  studentName: string;
  date: string;
  status: string;
  paymentFrequency: string;
  total: number;
}

export interface CommentData {
  date: string;
  author: string;
  comment: string;
  type: string;
}

export interface HistoryData {
  message: string;
}

// Column definitions
export const studentColumns: ColumnDef<StudentData>[] = [
  { accessorKey: "name", header: "Name" },
  { 
    accessorKey: "birthDate", 
    header: "Birth Date",
    cell: ({ row }) => (
      <span className=" font-medium">
        {row.getValue("birthDate")}
      </span>
    ),
  },
  { accessorKey: "customerName", header: "Customer Name" },
];

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
  { accessorKey: "dueDate", header: "Due Date" },
  { accessorKey: "studentName", header: "Student Name" },
  { accessorKey: "programName", header: "Program Name" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("price") as number)}</div>
    ),
  },
  {
    accessorKey: "owing",
    header: "Owing",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("owing") as number)}</div>
    ),
  },
];

export const groupLessonColumns: ColumnDef<GroupLessonData>[] = [
  { accessorKey: "dueDate", header: "Due Date" },
  { accessorKey: "studentName", header: "Student Name" },
  { accessorKey: "programName", header: "Program Name" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "status", header: "Status" },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("price") as number)}</div>
    ),
  },
  {
    accessorKey: "owing",
    header: "Owing",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("owing") as number)}</div>
    ),
  },
];

export const proformaInvoiceColumns: ColumnDef<ProformaInvoiceData>[] = [
  { accessorKey: "studentName", header: "Student Name" },
  { accessorKey: "date", header: "Date" },
  { accessorKey: "status", header: "Status" },
  { accessorKey: "paymentFrequency", header: "Payment Frequency" },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("total") as number)}</div>
    ),
  },
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

// Tab configuration
export interface TabConfig<TData = unknown> {
  id: string;
  title: string;
  hasAddButton: boolean;
  hasTable: boolean;
  emptyState?: string;
  columns?: ColumnDef<TData>[];
  dataKey: string;
}

export const CUSTOMER_TAB_CONFIGS: Record<string, TabConfig<unknown>> = {
  students: {
    id: "students",
    title: "Students",
    hasAddButton: true,
    hasTable: true,
    columns: studentColumns as ColumnDef<unknown>[],
    dataKey: "studentData",
  },
  enrolments: {
    id: "enrolments",
    title: "Enrolments",
    hasAddButton: false,
    hasTable: true,
    columns: enrolmentColumns as ColumnDef<unknown>[],
    dataKey: "enrolmentData",
  },
  "private-lessons": {
    id: "private-lessons",
    title: "Private Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: privateLessonColumns as ColumnDef<unknown>[],
    dataKey: "privateLessonData",
  },
  "group-lessons": {
    id: "group-lessons",
    title: "Group Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: groupLessonColumns as ColumnDef<unknown>[],
    dataKey: "groupLessonData",
  },
  "proforma-invoices": {
    id: "proforma-invoices",
    title: "Pro-forma Invoices",
    hasAddButton: true,
    hasTable: true,
    columns: proformaInvoiceColumns as ColumnDef<unknown>[],
    dataKey: "proformaInvoiceData",
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
export const TAB_ORDER = [
  "students",
  "enrolments",
  "private-lessons",
  "group-lessons",
  "proforma-invoices",
  "comments",
  "history",
];

import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";

// Data interfaces
export interface StudentData {
  id: number;
  fullName: string;
  firstName?: string;
  lastName?: string;
  birthDate: string;
  customerName: string;
  status: number;
  phone?: string;
  email?: string;
  gender?: string;
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

// Detailed Proforma Invoice rows used on the standalone page
export interface ProformaInvoiceDetailData {
  student: string;
  program: string;
  startDate: string;
  endDate: string;
  dueDate: string;
  proFormaInvoice: string;
  status: string;
}

export interface CommentData {
  id?: number;
  content: string;
  createdUser: string;
  avatar: string;
  createdOn: string;
}

export interface HistoryData {
  id?: number;
  createdOn?: string;
  message: string;
}

// Column definitions
export const studentColumns: ColumnDef<StudentData>[] = [
  { accessorKey: "fullName", header: "Name" },
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

// Columns for the standalone detailed page
export const proformaInvoiceDetailColumns: ColumnDef<ProformaInvoiceDetailData>[] = [
  { accessorKey: "student", header: "Student" },
  { accessorKey: "program", header: "Program" },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {return row.getValue("startDate")}
    
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {return row.getValue("endDate")}
  },
  { accessorKey: "dueDate", header: "Due Date" },
  { accessorKey: "proFormaInvoice", header: "Pro-Forma Invoice" },
  { accessorKey: "status", header: "Status" },
];

export const commentColumns: ColumnDef<CommentData>[] = [
  { accessorKey: "createdOn", header: "Created On" },
  { accessorKey: "createdUser", header: "Author" },
  { accessorKey: "content", header: "Comment" },
];

export const historyColumns: ColumnDef<HistoryData>[] = [
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const item = row.original as HistoryData;
      const created = item.createdOn ? `On ${item.createdOn}, ` : "";
      // The API may include HTML links inside `message`; render safely and ensure links open in a new tab
      const combined = `${created}${item.message}`;
      let styled = combined.replace(/<a\b([^>]*)>/g, (_match, attrs: string) => {
        let newAttrs = attrs || "";
        if (!/target=/.test(newAttrs)) {
          newAttrs += ' target="_blank" rel="noopener noreferrer"';
        }
        const linkClasses = 'text-blue-600 hover:text-blue-800 font-medium';
        if (/class=/.test(newAttrs)) {
          newAttrs = newAttrs.replace(/class=\"([^\"]*)\"/, (_m, cls: string) => `class=\"${cls} ${linkClasses}\"`);
        } else {
          newAttrs += ` class=\"${linkClasses}\"`;
        }
        return `<a${newAttrs}>`;
      });
      // Style placeholders like {{username}} when backend sends plain text
      styled = styled.replace(/\{\{([^}]+)\}\}/g, (_m, name: string) => {
        return `<span class=\"text-blue-600 hover:text-blue-800 font-medium\">${name}</span>`;
      });
      return <div className="text-sm" dangerouslySetInnerHTML={{ __html: styled }} />;
    },
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

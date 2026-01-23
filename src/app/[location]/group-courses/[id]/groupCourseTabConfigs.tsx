import { ColumnDef } from "@tanstack/react-table";
import { formatDisplayDate } from "@/utils/dateUtils";

// Data interfaces
export interface LessonData {
  id: string;
  date: string;
  status: string;
  isOnline: boolean;
}

export interface StudentData {
  id: string;
  studentName: string;
  customerName: string;
  discount: string;
  /**
   * Raw studentId from the API (used for navigation)
   */
  studentId?: number;
  /**
   * Raw customerId from the API (used for navigation)
   */
  customerId?: number;
  /**
   * Raw enrolmentId from the API (used for discount API calls)
   */
  enrolmentId?: number;
}

export interface HistoryData {
  id: string;
  message: string;
}

// Column definitions
export const lessonColumns: ColumnDef<LessonData>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "isOnline",
    header: "Online",
    cell: ({ row }) => (row.getValue("isOnline") ? "Yes" : "No"),
  },
];

export const studentColumns: ColumnDef<StudentData>[] = [
  {
    accessorKey: "studentName",
    header: "Student Name",
  },
  {
    accessorKey: "customerName",
    header: "Customer Name",
  },
  {
    accessorKey: "discount",
    header: "Discount",
  },
];

export const historyColumns: ColumnDef<HistoryData>[] = [
  {
    accessorKey: "message",
    header: "Message",
  },
];

// Tab configuration interface
export interface GroupCourseTabConfig<TData = unknown> {
  id: string;
  title: string;
  hasAddButton: boolean;
  hasTable: boolean;
  emptyState?: string;
  columns?: ColumnDef<TData>[];
  dataKey: string;
}

// Tab configurations
export const GROUP_COURSE_TAB_CONFIGS: Record<string, GroupCourseTabConfig<unknown>> = {
  lessons: {
    id: "lessons",
    title: "Lessons",
    hasAddButton: false,
    hasTable: true,
    emptyState: "No lessons found.",
    columns: lessonColumns as ColumnDef<unknown>[],
    dataKey: "lessonData",
  },
  students: {
    id: "students",
    title: "Students",
    hasAddButton: true,
    hasTable: true,
    emptyState: "No students found.",
    columns: studentColumns as ColumnDef<unknown>[],
    dataKey: "studentData",
  },
  history: {
    id: "history",
    title: "History",
    hasAddButton: false,
    hasTable: true,
    emptyState: "No history found.",
    columns: historyColumns as ColumnDef<unknown>[],
    dataKey: "historyData",
  },
};

// Tab order
export const GROUP_COURSE_TAB_ORDER = [
  "lessons",
  "students",
  "history",
];


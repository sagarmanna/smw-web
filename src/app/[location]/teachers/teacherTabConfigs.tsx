import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatISOToDisplay } from "@/utils/dateUtils";

// Data interfaces
export interface UnavailabilityData {
  id: string;
  fromDateTime: string;
  toDateTime: string;
  reason: string;
}

export interface TeacherStudentData {
  id: string;
  studentName: string;
}

export interface InvoicedLessonData {
  id: string;
  time: string;
  program: string;
  student: string;
  duration: string;
  ratePerHour: number;
  cost: number;
}

export interface UnscheduledLessonData {
  id: string;
  student: string;
  phone: string;
  program: string;
  duration: string;
  originalDate: string;
  expiryDate: string;
}

export interface TimeVoucherData {
  id: string;
  time: string;
  program: string;
  student: string;
  duration: string;
}

export interface CommentData {
  id: string;
  content: string;
  createdUser: string;
  createdOn: string;
}

export interface HistoryData {
  id: string;
  message: string;
  createdOn: string;
}

// Column definitions
export const unavailabilityColumns: ColumnDef<UnavailabilityData>[] = [
  {
    accessorKey: "fromDateTime",
    header: "From Date Time",
    cell: ({ row }) => {
      const isoString = row.getValue("fromDateTime") as string;
      // Convert ISO string directly to display format (no parsing needed)
      const displayFormat = formatISOToDisplay(isoString);
      return <span className="font-medium">{displayFormat}</span>;
    },
  },
  {
    accessorKey: "toDateTime",
    header: "To Date Time",
    cell: ({ row }) => {
      const isoString = row.getValue("toDateTime") as string;
      // Convert ISO string directly to display format (no parsing needed)
      const displayFormat = formatISOToDisplay(isoString);
      return <span className="font-medium">{displayFormat}</span>;
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
];

export const teacherStudentColumns: ColumnDef<TeacherStudentData>[] = [
  {
    accessorKey: "studentName",
    header: "Student Name",
  },
];

export const invoicedLessonColumns: ColumnDef<InvoicedLessonData>[] = [
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "duration",
    header: "Duration(hrs)",
  },
  {
    accessorKey: "ratePerHour",
    header: "Rate/hr",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("ratePerHour") as number)}</div>
    ),
  },
  {
    accessorKey: "cost",
    header: "Cost",
    cell: ({ row }) => (
      <div className="text-right">{formatCurrency(row.getValue("cost") as number)}</div>
    ),
  },
];

export const unscheduledLessonColumns: ColumnDef<UnscheduledLessonData>[] = [
  {
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "duration",
    header: "Duration",
  },
  {
    accessorKey: "originalDate",
    header: "Original Date",
  },
  {
    accessorKey: "expiryDate",
    header: "Expiry Date",
  },
];

export const timeVoucherColumns: ColumnDef<TimeVoucherData>[] = [
  {
    accessorKey: "time",
    header: "Time",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "student",
    header: "Student",
  },
  {
    accessorKey: "duration",
    header: "Duration(hrs)",
  },
];

export const commentColumns: ColumnDef<CommentData>[] = [
  {
    accessorKey: "createdOn",
    header: "Date",
  },
  {
    accessorKey: "createdUser",
    header: "Author",
  },
  {
    accessorKey: "content",
    header: "Comment",
  },
];

export const historyColumns: ColumnDef<HistoryData>[] = [
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      const item = row.original as HistoryData;
      // Use message as-is if it already starts with "On", otherwise prepend createdOn
      let combined = item.message;
      if (item.createdOn && !item.message.startsWith("On ")) {
        combined = `On ${item.createdOn}, ${item.message}`;
      }
      // The API may include HTML links inside `message`; render safely and ensure links open in a new tab
      let styled = combined.replace(
        /<a\b([^>]*)>/g,
        (_match, attrs: string) => {
          let newAttrs = attrs || "";
          if (!/target=/.test(newAttrs)) {
            newAttrs += ' target="_blank" rel="noopener noreferrer"';
          }
          const linkClasses = "text-blue-600 hover:text-blue-800 font-medium";
          if (/class=/.test(newAttrs)) {
            newAttrs = newAttrs.replace(
              /class=\"([^\"]*)\"/,
              (_m, cls: string) => `class=\"${cls} ${linkClasses}\"`
            );
          } else {
            newAttrs += ` class=\"${linkClasses}\"`;
          }
          return `<a${newAttrs}>`;
        }
      );
      // Make placeholders like {{entityName}} clickable
      styled = styled.replace(/\{\{([^}]+)\}\}/g, (_m, name: string) => {
        const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<a href="#" data-entity-name="${safeName}" class="text-blue-600 hover:text-blue-800 font-medium underline">${safeName}</a>`;
      });
      return (
        <div className="text-sm py-2 px-3" dangerouslySetInnerHTML={{ __html: styled }} />
      );
    },
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
  showAllCheckbox?: boolean;
  dropdownItems?: DropdownMenuItem[];
  dropdownLabel?: string;
  isCalendarView?: boolean;
}

export const TEACHER_TAB_CONFIGS: Record<string, TabConfig<unknown>> = {
  unavailabilities: {
    id: "unavailabilities",
    title: "Unavailabilities",
    hasAddButton: true,
    hasTable: true,
    emptyState: "No unavailabilities found.",
    columns: unavailabilityColumns as ColumnDef<unknown>[],
    dataKey: "unavailabilityData",
  },
  students: {
    id: "students",
    title: "Students",
    hasAddButton: false,
    hasTable: true,
    emptyState: "No students found.",
    columns: teacherStudentColumns as ColumnDef<unknown>[],
    dataKey: "studentData",
  },
  "invoiced-lessons": {
    id: "invoiced-lessons",
    title: "Invoiced Lessons",
    hasAddButton: false,
    hasTable: true,
    emptyState: "No invoiced lessons found.",
    columns: invoicedLessonColumns as ColumnDef<unknown>[],
    dataKey: "invoicedLessonData",
  },
  "unscheduled-lesson": {
    id: "unscheduled-lesson",
    title: "Unscheduled Lesson",
    hasAddButton: false,
    hasTable: true,
    emptyState: "No unscheduled lessons found.",
    columns: unscheduledLessonColumns as ColumnDef<unknown>[],
    dataKey: "unscheduledLessonData",
    showAllCheckbox: true,
  },
  "time-voucher": {
    id: "time-voucher",
    title: "Time Voucher",
    hasAddButton: false,
    hasTable: true,
    emptyState: "No time vouchers found.",
    columns: timeVoucherColumns as ColumnDef<unknown>[],
    dataKey: "timeVoucherData",
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
    emptyState: "No history found.",
    columns: historyColumns as ColumnDef<unknown>[],
    dataKey: "historyData",
  },
};

// Tab order
export const TEACHER_TAB_ORDER = [
  "unavailabilities",
  "students",
  "invoiced-lessons",
  "unscheduled-lesson",
  "time-voucher",
  "comments",
  "history",
];


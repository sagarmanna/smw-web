import { ColumnDef } from "@tanstack/react-table";

// Tab configuration interface
export interface TabConfig<TData = unknown> {
  id: string;
  title: string;
  hasAddButton: boolean;
  hasTable: boolean;
  emptyState?: string;
  columns?: ColumnDef<TData>[];
  dataKey: string;
}

// Basic tab configuration for group courses
// Currently only has one tab since the image shows a simple table
export const GROUP_COURSE_TAB_CONFIGS: Record<string, TabConfig<unknown>> = {
  courses: {
    id: "courses",
    title: "Group Courses",
    hasAddButton: true,
    hasTable: true,
    emptyState: "No group courses found.",
    dataKey: "courseData",
  },
};

// Tab order
export const GROUP_COURSE_TAB_ORDER = [
  "courses",
];


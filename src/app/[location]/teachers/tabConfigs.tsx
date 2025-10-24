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

// Basic tab configuration for teachers
// Currently only has one tab since the image shows a simple table
export const TEACHER_TAB_CONFIGS: Record<string, TabConfig<unknown>> = {
  teachers: {
    id: "teachers",
    title: "Teachers",
    hasAddButton: true,
    hasTable: true,
    emptyState: "No teachers found.",
    dataKey: "teacherData",
  },
};

// Tab order
export const TEACHER_TAB_ORDER = [
  "teachers",
];

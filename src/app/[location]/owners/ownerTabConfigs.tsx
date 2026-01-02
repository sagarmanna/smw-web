import { ColumnDef } from "@tanstack/react-table";
import { formatISOToDisplay } from "@/utils/dateUtils";

// Data interfaces
export interface HistoryData {
  id: string;
  message: string;
  createdOn: string;
}

// Column definitions
export const historyColumns: ColumnDef<HistoryData>[] = [
  {
    accessorKey: "createdOn",
    header: "Date",
    cell: ({ row }) => {
      const isoString = row.getValue("createdOn") as string;
      const displayFormat = formatISOToDisplay(isoString);
      return <span className="font-medium">{displayFormat}</span>;
    },
  },
  {
    accessorKey: "message",
    header: "Message",
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

export const OWNER_TAB_CONFIGS: Record<string, TabConfig<unknown>> = {
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
export const OWNER_TAB_ORDER = [
  "history",
];


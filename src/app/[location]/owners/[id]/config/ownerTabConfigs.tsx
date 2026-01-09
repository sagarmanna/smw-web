import { ColumnDef } from "@tanstack/react-table";
import { formatISOToDisplay } from "@/utils/dateUtils";
import { createHistoryTabConfig } from "@/components/tabs/HistoryTab";
import { fetchHistoryData } from "../ownersTabs.slice";
import type { HistoryTabConfig } from "@/components/tabs/HistoryTab";

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

/**
 * Redux state selectors for owner history tab
 * Extracted for reusability and testability
 */
export const ownerHistorySelectors = {
  selectData: (state: unknown): HistoryData[] => {
    const ownerState = state as { ownerTabs: { historyData: HistoryData[] } };
    return ownerState.ownerTabs.historyData;
  },
  selectLoading: (state: unknown): boolean => {
    const ownerState = state as { ownerTabs: { historyLoading: boolean } };
    return ownerState.ownerTabs.historyLoading;
  },
  selectError: (state: unknown): string | null => {
    const ownerState = state as { ownerTabs: { historyError: string | null } };
    return ownerState.ownerTabs.historyError;
  },
  selectEntityId: (state: unknown): number | null => {
    const ownerState = state as { ownerTabs: { historyOwnerId: number | null } };
    return ownerState.ownerTabs.historyOwnerId;
  },
  selectPagination: (state: unknown): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null => {
    const ownerState = state as { ownerTabs: { historyPagination: { page: number; limit: number; total: number; totalPages: number } | null } };
    return ownerState.ownerTabs.historyPagination;
  },
};

/**
 * Factory function to create owner history tab configuration
 * Memoize this in the component that uses it
 */
export function createOwnerHistoryTabConfig(): HistoryTabConfig<HistoryData> {
  return createHistoryTabConfig({
    selectors: ownerHistorySelectors,
    columns: historyColumns,
    fetchAction: fetchHistoryData,
    entityIdParamName: "ownerId",
  });
}

// Tab configuration
export interface TabConfig {
  id: string;
  title: string;
}

export const OWNER_TAB_CONFIGS: Record<string, TabConfig> = {
  history: {
    id: "history",
    title: "History",
  },
};

// Tab order
export const OWNER_TAB_ORDER: string[] = [
  "history",
];


import { ColumnDef } from "@tanstack/react-table";
import { formatISOToDisplay } from "@/utils/dateUtils";
import { createHistoryTabConfig } from "@/components/tabs/HistoryTab";
import { fetchHistoryData } from "../administratorTabs.slice";
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
 * Redux state selectors for administrator history tab
 * Extracted for reusability and testability
 */
export const administratorHistorySelectors = {
  selectData: (state: unknown): HistoryData[] => {
    const adminState = state as { administratorTabs: { historyData: HistoryData[] } };
    return adminState.administratorTabs.historyData;
  },
  selectLoading: (state: unknown): boolean => {
    const adminState = state as { administratorTabs: { historyLoading: boolean } };
    return adminState.administratorTabs.historyLoading;
  },
  selectError: (state: unknown): string | null => {
    const adminState = state as { administratorTabs: { historyError: string | null } };
    return adminState.administratorTabs.historyError;
  },
  selectEntityId: (state: unknown): number | null => {
    const adminState = state as { administratorTabs: { historyAdministratorId: number | null } };
    return adminState.administratorTabs.historyAdministratorId;
  },
};

/**
 * Factory function to create administrator history tab configuration
 * Memoize this in the component that uses it
 */
export function createAdministratorHistoryTabConfig(): HistoryTabConfig<HistoryData> {
  return createHistoryTabConfig({
    selectors: administratorHistorySelectors,
    columns: historyColumns,
    fetchAction: fetchHistoryData,
    entityIdParamName: "administratorId",
  });
}

// Tab configuration
export interface TabConfig {
  id: string;
  title: string;
}

export const ADMINISTRATOR_TAB_CONFIGS: Record<string, TabConfig> = {
  history: {
    id: "history",
    title: "History",
  },
};

// Tab order
export const ADMINISTRATOR_TAB_ORDER: string[] = [
  "history",
];


import { ColumnDef } from "@tanstack/react-table";
import { formatISOToDisplay } from "@/utils/dateUtils";
import { createHistoryTabConfig } from "@/components/tabs/HistoryTab";
import { fetchHistoryData } from "../staffMembersTabs.slice";
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
 * Redux state selectors for staff member history tab
 * Extracted for reusability and testability
 */
export const staffMemberHistorySelectors = {
  selectData: (state: unknown): HistoryData[] => {
    const staffState = state as { staffMemberTabs: { historyData: HistoryData[] } };
    return staffState.staffMemberTabs.historyData;
  },
  selectLoading: (state: unknown): boolean => {
    const staffState = state as { staffMemberTabs: { historyLoading: boolean } };
    return staffState.staffMemberTabs.historyLoading;
  },
  selectError: (state: unknown): string | null => {
    const staffState = state as { staffMemberTabs: { historyError: string | null } };
    return staffState.staffMemberTabs.historyError;
  },
  selectEntityId: (state: unknown): number | null => {
    const staffState = state as { staffMemberTabs: { historyStaffMemberId: number | null } };
    return staffState.staffMemberTabs.historyStaffMemberId;
  },
};

/**
 * Factory function to create staff member history tab configuration
 * Memoize this in the component that uses it
 */
export function createStaffMemberHistoryTabConfig(): HistoryTabConfig<HistoryData> {
  return createHistoryTabConfig({
    selectors: staffMemberHistorySelectors,
    columns: historyColumns,
    fetchAction: fetchHistoryData,
    entityIdParamName: "staffMemberId",
  });
}

// Tab configuration
export interface TabConfig {
  id: string;
  title: string;
}

export const STAFF_MEMBER_TAB_CONFIGS: Record<string, TabConfig> = {
  history: {
    id: "history",
    title: "History",
  },
};

// Tab order
export const STAFF_MEMBER_TAB_ORDER: string[] = [
  "history",
];


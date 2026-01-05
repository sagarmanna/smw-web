import type { ColumnDef } from "@tanstack/react-table";

/**
 * Base interface for history data
 */
export interface HistoryData {
  id: string | number;
  message: string;
  createdOn: string;
}

/**
 * Redux state selector functions
 */
export interface HistoryTabSelectors<TData extends HistoryData> {
  selectData: (state: unknown) => TData[];
  selectLoading: (state: unknown) => boolean;
  selectError: (state: unknown) => string | null;
  selectEntityId: (state: unknown) => number | string | null;
  selectPagination?: (state: unknown) => {
    page?: number;
    totalPages?: number;
    total?: number;
    limit?: number;
  } | null;
}

/**
 * Configuration for history tab
 * Uses dependency injection pattern for proper separation of concerns
 */
export interface HistoryTabConfig<TData extends HistoryData = HistoryData> {
  selectors: HistoryTabSelectors<TData>;
  columns: ColumnDef<TData>[];
  fetchAction: (params: { location: string; [key: string]: unknown }) => ReturnType<import("@/redux/store").AppDispatch>;
  entityIdParamName: string;
}

/**
 * Props for HistoryTab component
 * Pure UI component - all logic injected via config
 */
export interface HistoryTabProps<TData extends HistoryData = HistoryData> {
  location: string;
  entityId: number | string;
  config: HistoryTabConfig<TData>;
}


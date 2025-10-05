// Re-export the new modular CustomTable component
export { CustomTable } from "./CustomTable";
export type { CustomTableProps } from "./CustomTable";

// Re-export components for direct use
export { 
  TableHeader, 
  TableBody, 
  TablePagination, 
  ServerSidePagination,
  TableToolbar, 
  ExportDialog 
} from "./components";

// Re-export types for backward compatibility
export type {
  FilterOption,
  ServerSideFilterOption,
  ColumnGroup,
  TableSize,
  TableVariant,
} from "./components";
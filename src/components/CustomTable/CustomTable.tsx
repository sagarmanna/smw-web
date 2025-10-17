"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { TooltipProvider } from "@/components/ui/tooltip";
 

// Import components and types
import { 
  TableHeader, 
  TableBody, 
  ServerSidePagination,
  TableToolbar, 
  ExportDialog,
  FilterOption, 
  ServerSideFilterOption, 
  ColumnGroup, 
  TableSize, 
  TableVariant 
} from "./components";

// Column filter types
export interface ColumnFilter {
  type: "date" | "date-range" | "string" | "dropdown";
  initialValue?: unknown;
  options?: { value: string; label: string }[]; // For dropdown type
  disabled?: (date: Date) => boolean; // Function to disable specific dates
}

export interface CustomTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  columnGroups?: ColumnGroup[]; // Optional column grouping
  footerRow?: TData; // Optional footer row data
  
  // Visual configuration
  size?: TableSize; // compact, normal, comfortable
  variant?: TableVariant; // default, bordered, striped
  stickyHeader?: boolean; // Sticky table header on scroll
  maxHeight?: string; // Max height for scrollable table (e.g., "500px", "70vh")
  
  // Feature flags
  enableSearch?: boolean;
  enableExport?: boolean;
  enableFilter?: boolean;
  enablePrint?: boolean;
  enableDateRangePicker?: boolean;
  enableSorting?: boolean; // Enable column sorting
  enableRowsPerPage?: boolean; // Enable rows per page selector
  
  // Server-side sorting configuration
  sorting?: SortingState;
  onSortingChange?: (sorting: SortingState) => void;
  manualSorting?: boolean;

  // Search configuration
  searchPlaceholder?: string;
  getSearchValue?: (row: TData) => string;
  
  // Filter configuration (client-side)
  filterOptions?: FilterOption<TData>[];
  
  // Server-side filter configuration
  serverSideFilterOptions?: ServerSideFilterOption[];
  activeServerSideFilter?: string;
  onServerSideFilterChange?: (filterKey: string | undefined) => void;
  defaultFilterLabel?: string;
  
  // Export configuration
  onExport?: {
    html?: (data: TData[]) => void;
    csv?: (data: TData[]) => void;
    text?: (data: TData[]) => void;
    excel?: (data: TData[]) => void;
    pdf?: (data: TData[]) => void;
    json?: (data: TData[]) => void;
  };
  
  // Print configuration
  onPrint?: () => void;
  
  // Pagination configuration (removed - using server-side only)
  
  // Server-side pagination configuration
  serverSidePagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onServerSidePageChange?: (page: number) => void;
  
  // Rows per page configuration
  initialRowsPerPage?: number; // Initial rows per page (default: 20)
  rowsPerPageOptions?: number[]; // Available options (default: [5, 10, 20, 50, 100])
  onRowsPerPageChange?: (rowsPerPage: number) => void; // Callback when rows per page changes
  rowsPerPage?: number; // Controlled rows per page value
  
  // Custom components
  customHeaderComponent?: React.ReactNode;
  customEmptyState?: React.ReactNode;
  customLoadingState?: React.ReactNode;
  
  // Loading state
  isLoading?: boolean;
  
  // DateRangePicker configuration
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  
  // Custom styling
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((row: TData) => string);
  
  // Row interaction
  onRowClick?: (row: TData) => void;
  
  // Column-level filtering
  enableColumnFilters?: boolean; // Enable column-level filtering
  onColumnFilterChange?: (columnKey: string, filterValue: unknown) => void; // Callback when column filter changes
  onColumnFilterEnter?: (columnKey: string) => void; // Callback when Enter is pressed in column filter
  columnFilters?: Record<string, unknown>; // External column filter state
  columnFilterPlaceholders?: Record<string, string>; // Custom placeholders for column filters
}

export function CustomTable<TData, TValue>({
  data,
  columns,
  title,
  columnGroups,
  footerRow,
  
  // Visual configuration
  size = "compact",
  variant = "default",
  stickyHeader = false,
  maxHeight,
  
  // Feature flags with defaults
  enableSearch = false,
  enableExport = false,
  enableFilter = false,
  enablePrint = true,
  enableDateRangePicker = false,
  enableSorting = true,
  enableRowsPerPage = false,
  
  // Sorting configuration
  sorting: controlledSorting,
  onSortingChange,
  manualSorting = false,

  // Search configuration
  searchPlaceholder = "Search...",
  getSearchValue,
  
  // Filter configuration (client-side)
  filterOptions,
  
  // Server-side filter configuration
  serverSideFilterOptions,
  activeServerSideFilter,
  onServerSideFilterChange,
  defaultFilterLabel,
  
  // Export configuration
  onExport,
  
  // Print configuration
  onPrint,
  
  // Pagination configuration (removed - using server-side only)
  
  // Server-side pagination configuration
  serverSidePagination,
  onServerSidePageChange,
  
  // Rows per page configuration
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 20, 50, 100],
  onRowsPerPageChange,
  rowsPerPage: controlledRowsPerPage,
  
  // Custom components
  customHeaderComponent,
  customEmptyState,
  customLoadingState,
  
  // Loading state
  isLoading = false,
  
  // DateRangePicker configuration
  dateRange,
  onDateRangeChange,
  
  // Custom styling
  className,
  headerClassName,
  rowClassName,
  
  // Row interaction
  onRowClick,
  
  // Column-level filtering
  enableColumnFilters = false,
  onColumnFilterChange,
  onColumnFilterEnter,
  columnFilters: externalColumnFilters,
  columnFilterPlaceholders = {},
}: CustomTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);

  const sorting = controlledSorting ?? internalSorting;

  const processedColumns = React.useMemo(() => columns.map(col => ({
    ...col,
    enableSorting: col.enableSorting === true,
  })), [columns]);

  const setSorting = (updater: React.SetStateAction<SortingState>) => {
    const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
    if (controlledSorting === undefined) { // Uncontrolled
      setInternalSorting(newSorting);
    }
    onSortingChange?.(newSorting);
  };
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  // Use controlled value if provided, otherwise use internal state
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState<number>(initialRowsPerPage);
  const rowsPerPage = controlledRowsPerPage !== undefined ? controlledRowsPerPage : internalRowsPerPage;
  const rowsPerPageRef = React.useRef<number>(rowsPerPage);
  const hasUserChangedRowsPerPageRef = React.useRef<boolean>(false);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);
  
  // Initialize column filters with initial values from column definitions
  const initialColumnFilters = React.useMemo(() => {
    const filters: Record<string, unknown> = {};
    columns.forEach(column => {
      const filterConfig = (column as { filter?: { initialValue?: unknown } }).filter;
      if (filterConfig && filterConfig.initialValue !== undefined) {
        filters[column.id || (column as { accessorKey?: string }).accessorKey || ''] = filterConfig.initialValue;
      }
    });
    return filters;
  }, [columns]);

  // Column filter state - use external if provided, otherwise use internal
  const [internalColumnFilters, setInternalColumnFilters] = React.useState<Record<string, unknown>>(initialColumnFilters);
  const columnFilters = externalColumnFilters ?? internalColumnFilters;

  // Update internal column filters when columns change (only if not using external)
  React.useEffect(() => {
    if (!externalColumnFilters) {
      setInternalColumnFilters(initialColumnFilters);
    }
  }, [initialColumnFilters, externalColumnFilters]);

  // Get size-based classes
  const getSizeClasses = React.useMemo(() => {
    switch (size) {
      case "compact":
        return {
          // card: "p-3 sm:p-4",
          header: "px-2 sm:px-3 py-2 sm:py-2.5 text-sm font-semibold",
          cell: "px-2 sm:px-3 py-2 sm:py-2.5 text-xs",
          text: "text-xs",
        };
      case "comfortable":
        return {
          // card: "p-4 sm:p-5 md:p-6",
          header: "px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-semibold",
          cell: "px-4 sm:px-5 py-3 sm:py-4 text-sm",
          text: "text-sm sm:text-base",
        };
      default: // normal
        return {
          // card: "p-3 sm:p-4 md:p-5",
          header: "px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base font-semibold",
          cell: "px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm",
          text: "text-xs sm:text-sm",
        };
    }
  }, [size]);

  // Get variant-based row classes
  const getRowClasses = React.useCallback((index: number) => {
    const baseClasses = "transition-colors duration-150 hover:bg-muted/30";
    if (variant === "striped") {
      return `${baseClasses} ${index % 2 === 0 ? "bg-muted/5" : "bg-background"}`;
    }
    return baseClasses;
  }, [variant]);

  // Handle rows per page change
  const handleRowsPerPageChange = React.useCallback((newRowsPerPage: number) => {
    // Update internal state only if not controlled
    if (controlledRowsPerPage === undefined) {
      setInternalRowsPerPage(newRowsPerPage);
    }
    rowsPerPageRef.current = newRowsPerPage;
    hasUserChangedRowsPerPageRef.current = true;
    
    // Trigger server-side pagination change
    onRowsPerPageChange?.(newRowsPerPage);
  }, [onRowsPerPageChange, controlledRowsPerPage]);

  // Handle column filter change
  const handleColumnFilterChange = React.useCallback((columnKey: string, filterValue: unknown) => {
    // Update internal state only if not using external state
    if (!externalColumnFilters) {
      setInternalColumnFilters(prev => ({
        ...prev,
        [columnKey]: filterValue
      }));
    }
    
    // Call the external callback if provided
    onColumnFilterChange?.(columnKey, filterValue);
  }, [onColumnFilterChange, externalColumnFilters]);

  type ExportKind = "html" | "csv" | "text" | "excel" | "pdf" | "json";
  const [confirmOpen, setConfirmOpen] = React.useState<boolean>(false);
  const [pendingExport, setPendingExport] = React.useState<ExportKind | null>(null);

  const startExport = (kind: ExportKind) => {
    setPendingExport(kind);
    setConfirmOpen(true);
  };

  const confirmAndExport = () => {
    if (!pendingExport || !onExport) {
      setConfirmOpen(false);
      return;
    }
    const dataset = filteredData as TData[];
    switch (pendingExport) {
      case "html":
        onExport.html?.(dataset);
        break;
      case "csv":
        onExport.csv?.(dataset);
        break;
      case "text":
        onExport.text?.(dataset);
        break;
      case "excel":
        onExport.excel?.(dataset);
        break;
      case "pdf":
        onExport.pdf?.(dataset);
        break;
      case "json":
        onExport.json?.(dataset);
        break;
    }
    setConfirmOpen(false);
    setPendingExport(null);
  };

  // Apply filtering
  const filteredData = React.useMemo(() => {
    let result = data;
    
    // Apply search filter
    if (enableSearch && globalFilter && getSearchValue) {
      result = result.filter(row => 
        getSearchValue(row).toLowerCase().includes(globalFilter.toLowerCase())
      );
    }
    
    return result;
  }, [data, enableSearch, globalFilter, getSearchValue]);


  const table = useReactTable({
    data: filteredData,
    columns: processedColumns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: enableSearch ? globalFilter : "",
    },
    manualPagination: true, // Always use manual pagination (server-side)
    manualSorting: manualSorting,
  });

  // No client-side pagination effects needed - using server-side only

  return (
    <TooltipProvider>
      <div className={`w-full ${className || ""}`}>
        <div className={`flex flex-col gap-2 ${title ? 'md:flex-row md:items-center md:justify-between' : 'md:flex-row md:items-center md:justify-end'}`}>
          {title && <h2 className="text-base font-semibold md:text-lg">{title}</h2>}
          
          <TableToolbar
            enableSearch={enableSearch}
            searchPlaceholder={searchPlaceholder}
            globalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
            enableDateRangePicker={enableDateRangePicker}
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            enablePrint={enablePrint}
            onPrint={onPrint}
            enableExport={enableExport}
            onExport={onExport}
            onStartExport={startExport}
            enableRowsPerPage={enableRowsPerPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={handleRowsPerPageChange}
            enableFilter={enableFilter}
            filterOptions={filterOptions}
            serverSideFilterOptions={serverSideFilterOptions}
            activeServerSideFilter={activeServerSideFilter}
            onServerSideFilterChange={onServerSideFilterChange}
            defaultFilterLabel={defaultFilterLabel}
            customHeaderComponent={customHeaderComponent}
          />
        </div>
        
        {/* Table */}
        <div 
          ref={tableContainerRef} 
          className="mt-4 overflow-hidden rounded-lg border border-border/50 shadow-sm bg-card"
          style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
        >
          <div className="overflow-x-auto">
            <table className={`w-full min-w-full ${getSizeClasses.text} border-collapse`} style={{ border: '1px solid hsl(var(--border))' }}>
              <TableHeader
                table={table}
                columnGroups={columnGroups}
                getSizeClasses={getSizeClasses}
                stickyHeader={stickyHeader}
                headerClassName={headerClassName}
                enableColumnFilters={enableColumnFilters}
                columnFilters={columnFilters}
                onColumnFilterChange={handleColumnFilterChange}
                onColumnFilterEnter={onColumnFilterEnter}
                columnFilterPlaceholders={columnFilterPlaceholders}
              />
              <TableBody
                table={table}
                columns={columns}
                footerRow={footerRow}
                isLoading={isLoading}
                customLoadingState={customLoadingState}
                customEmptyState={customEmptyState}
                getSizeClasses={getSizeClasses}
                getRowClasses={getRowClasses}
                rowClassName={rowClassName}
                onRowClick={onRowClick}
              />
            </table>
          </div>
        </div>
        
        {/* Pagination Controls - Server-side only */}
        {serverSidePagination && onServerSidePageChange ? (
          <ServerSidePagination
            pagination={serverSidePagination}
            onPageChange={onServerSidePageChange}
            enablePagination={true}
          />
        ) : null}
      </div>

      {/* Export confirmation dialog */}
      <ExportDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmAndExport}
        exportType={pendingExport}
      />
    </TooltipProvider>
  );
}

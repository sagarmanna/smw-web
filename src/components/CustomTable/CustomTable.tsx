"use client";

import * as React from "react";
import {
  ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DateRangePicker } from "@/components/DateRangePicker";

// Import components and types
import { 
  TableHeader, 
  TableBody, 
  TablePagination, 
  TableToolbar, 
  ExportDialog,
  FilterOption, 
  ServerSideFilterOption, 
  ColumnGroup, 
  TableSize, 
  TableVariant 
} from "./components";

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
  enablePagination?: boolean;
  enablePrint?: boolean;
  enableShowAll?: boolean;
  enableDateRangePicker?: boolean;
  enableSorting?: boolean; // Enable column sorting
  enableRowsPerPage?: boolean; // Enable rows per page selector
  
  // Search configuration
  searchPlaceholder?: string;
  getSearchValue?: (row: TData) => string;
  
  // Filter configuration (client-side)
  filterOptions?: FilterOption<TData>[];
  
  // Server-side filter configuration
  serverSideFilterOptions?: ServerSideFilterOption[];
  activeServerSideFilter?: string;
  onServerSideFilterChange?: (filterKey: string | undefined) => void;
  
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
  
  // Pagination configuration
  pageSize?: number;
  showPageSizeOptions?: boolean;
  pageSizeOptions?: number[];
  
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
  enablePagination = true,
  enablePrint = true,
  enableShowAll = true,
  enableDateRangePicker = false,
  enableSorting = true,
  enableRowsPerPage = false,
  
  // Search configuration
  searchPlaceholder = "Search...",
  getSearchValue,
  
  // Filter configuration (client-side)
  filterOptions,
  
  // Server-side filter configuration
  serverSideFilterOptions,
  activeServerSideFilter,
  onServerSideFilterChange,
  
  // Export configuration
  onExport,
  
  // Print configuration
  onPrint,
  
  // Pagination configuration
  pageSize = 10,
  
  // Rows per page configuration
  initialRowsPerPage = 20,
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
}: CustomTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSize,
  });
  // Use controlled value if provided, otherwise use internal state
  const [internalRowsPerPage, setInternalRowsPerPage] = React.useState<number>(initialRowsPerPage);
  const rowsPerPage = controlledRowsPerPage !== undefined ? controlledRowsPerPage : internalRowsPerPage;
  const rowsPerPageRef = React.useRef<number>(rowsPerPage);
  const hasUserChangedRowsPerPageRef = React.useRef<boolean>(false);
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  // Get size-based classes
  const getSizeClasses = React.useMemo(() => {
    switch (size) {
      case "compact":
        return {
          card: "p-2 sm:p-3",
          header: "px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs",
          cell: "px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs",
          text: "text-xs",
        };
      case "comfortable":
        return {
          card: "p-4 sm:p-5 md:p-6",
          header: "px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base",
          cell: "px-4 sm:px-5 py-3 sm:py-4 text-sm",
          text: "text-sm sm:text-base",
        };
      default: // normal
        return {
          card: "p-2 sm:p-3 md:p-4",
          header: "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
          cell: "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
          text: "text-xs sm:text-sm",
        };
    }
  }, [size]);

  // Get variant-based row classes
  const getRowClasses = React.useCallback((index: number) => {
    const baseClasses = "hover:bg-muted/20";
    if (variant === "striped") {
      return `${baseClasses} ${index % 2 === 0 ? "" : "bg-muted/10"}`;
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
    
    // If "All" is selected (-1), use a large number for pagination
    const actualPageSize = newRowsPerPage === -1 ? 999999 : newRowsPerPage;
    setPagination(prev => ({ ...prev, pageIndex: 0, pageSize: actualPageSize }));
    onRowsPerPageChange?.(newRowsPerPage);
  }, [onRowsPerPageChange, controlledRowsPerPage]);

  const printCurrentTable = React.useCallback(() => {
    const tableEl = tableContainerRef.current?.querySelector('table');
    if (!tableEl) return;
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"], v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    const fmt = (d: Date) => {
      try {
        const day = d.getDate();
        const month = d.toLocaleString("en-US", { month: "long" });
        const year = d.getFullYear();
        return `${month} ${day}${getOrdinal(day)}, ${year}`;
      } catch { return ""; }
    };
    const rangeHtml = (dateRange?.from && dateRange?.to)
      ? `<div style="margin:4px 0 12px;color:#334155;">${fmt(dateRange.from)} to ${fmt(dateRange.to)}</div>`
      : "";
    const titleHtml = title ? `<h1 style=\"margin:0 0 6px;font-size:20px;font-weight:700;color:#0f172a;\">${title}</h1>` : "";
    const styles = `
      * { box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, Noto Sans, 'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'; }
      body { margin: 16px; color: #0f172a; }
      table { width: 100%; border-collapse: collapse; }
      thead th { background: #f1f5f9; font-weight: 600; }
      th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
      tbody tr:hover { background: transparent !important; }
      tbody tr:last-child td { font-weight: 700; }
    `;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Report</title><style>${styles}</style></head><body>${titleHtml}${rangeHtml}${tableEl.outerHTML}</body></html>`;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  }, [dateRange?.from, dateRange?.to, title]);

  React.useEffect(() => {
    const onHotkey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        printCurrentTable();
      }
    };
    window.addEventListener('keydown', onHotkey);
    return () => window.removeEventListener('keydown', onHotkey);
  }, [printCurrentTable]);

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
    columns,
    onSortingChange: enableSorting ? setSorting : undefined,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: enableSearch ? globalFilter : "",
      pagination: showAll || !enablePagination 
        ? { pageIndex: 0, pageSize: filteredData.length } 
        : {
            ...pagination,
            pageSize: rowsPerPage === -1 ? 999999 : pagination.pageSize
          },
    },
    manualPagination: false,
  });

  // Update pagination when showAll changes
  React.useEffect(() => {
    if (enablePagination) {
      if (showAll) {
        setPagination(prev => ({ ...prev, pageSize: filteredData.length, pageIndex: 0 }));
      } else {
        // Use rowsPerPage state if it's been set by user, otherwise use pageSize prop
        const actualPageSize = hasUserChangedRowsPerPageRef.current ? 
          (rowsPerPage === -1 ? 999999 : rowsPerPage) : 
          pageSize;
        setPagination(prev => ({ ...prev, pageSize: actualPageSize, pageIndex: 0 }));
      }
    }
  }, [showAll, filteredData.length, enablePagination, pageSize, rowsPerPage]);

  // Reset pagination when data changes
  React.useEffect(() => {
    if (enablePagination && !showAll) {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
  }, [filteredData, enablePagination, showAll]);

  return (
    <TooltipProvider>
      <Card className={`w-full ${getSizeClasses.card} ${className || ""}`}>
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
            onPrint={onPrint || printCurrentTable}
            enableExport={enableExport}
            onExport={onExport}
            onStartExport={startExport}
            enableShowAll={enableShowAll}
            enablePagination={enablePagination}
            showAll={showAll}
            onShowAllToggle={() => setShowAll((v) => !v)}
            enableRowsPerPage={enableRowsPerPage}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            onRowsPerPageChange={handleRowsPerPageChange}
            enableFilter={enableFilter}
            filterOptions={filterOptions}
            serverSideFilterOptions={serverSideFilterOptions}
            activeServerSideFilter={activeServerSideFilter}
            onServerSideFilterChange={onServerSideFilterChange}
            customHeaderComponent={customHeaderComponent}
          />
        </div>
        
        {/* Table */}
        <div 
          ref={tableContainerRef} 
          className="mt-3 overflow-hidden rounded-md border"
          style={maxHeight ? { maxHeight, overflowY: "auto" } : undefined}
        >
          <div className="overflow-x-auto">
            <table className={`w-full min-w-full ${getSizeClasses.text}`}>
              <TableHeader
                table={table}
                columnGroups={columnGroups}
                getSizeClasses={getSizeClasses}
                stickyHeader={stickyHeader}
                headerClassName={headerClassName}
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
              />
            </table>
          </div>
        </div>
        
        {/* Pagination Controls */}
        <TablePagination
          table={table}
          showAll={showAll}
          enablePagination={enablePagination}
        />
      </Card>

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

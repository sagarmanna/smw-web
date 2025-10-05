"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Filter, Printer, Infinity, List, Search, Check } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface FilterOption<TData> {
  key: string;
  label: string;
  predicate: (row: TData) => boolean;
  checked?: boolean;
  onToggle?: (checked: boolean) => void;
}

export interface ServerSideFilterOption {
  key: string;
  label: string;
}

export interface ColumnGroup {
  label: string;
  columnKeys: string[]; // accessorKeys that belong to this group
}

export interface CustomTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  columnGroups?: ColumnGroup[]; // Optional column grouping
  
  // Feature flags
  enableSearch?: boolean;
  enableExport?: boolean;
  enableFilter?: boolean;
  enablePagination?: boolean;
  enablePrint?: boolean;
  enableShowAll?: boolean;
  enableDateRangePicker?: boolean;
  
  // Search configuration
  searchPlaceholder?: string;
  getSearchValue?: (row: TData) => string;
  
  // Filter configuration (client-side)
  filterOptions?: FilterOption<TData>[];
  initialFilterKey?: string;
  
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
  
  // Custom components
  customHeaderComponent?: React.ReactNode;
  
  // DateRangePicker configuration
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
}

export function CustomTable<TData, TValue>({
  data,
  columns,
  title,
  columnGroups,
  
  // Feature flags with defaults
  enableSearch = false,
  enableExport = false,
  enableFilter = false,
  enablePagination = true,
  enablePrint = true,
  enableShowAll = true,
  enableDateRangePicker = false,
  
  // Search configuration
  searchPlaceholder = "Search...",
  getSearchValue,
  
  // Filter configuration (client-side)
  filterOptions,
  initialFilterKey,
  
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
  
  // Custom components
  customHeaderComponent,
  
  // DateRangePicker configuration
  dateRange,
  onDateRangeChange,
}: CustomTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

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
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      globalFilter: enableSearch ? globalFilter : "",
      pagination: showAll || !enablePagination 
        ? { pageIndex: 0, pageSize: filteredData.length } 
        : pagination,
    },
    manualPagination: false,
  });

  // Update pagination when showAll changes
  React.useEffect(() => {
    if (enablePagination) {
      if (showAll) {
        setPagination(prev => ({ ...prev, pageSize: filteredData.length, pageIndex: 0 }));
      } else {
        setPagination(prev => ({ ...prev, pageSize: pageSize, pageIndex: 0 }));
      }
    }
  }, [showAll, filteredData.length, enablePagination, pageSize]);

  // Reset pagination when data changes
  React.useEffect(() => {
    if (enablePagination && !showAll) {
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }
  }, [filteredData, enablePagination, showAll]);

  return (
    <TooltipProvider>
      <Card className="w-full p-2 sm:p-3 md:p-4">
        <div className={`flex flex-col gap-2 ${title ? 'md:flex-row md:items-center md:justify-between' : 'md:flex-row md:items-center md:justify-end'}`}>
          {title && <h2 className="text-base font-semibold md:text-lg">{title}</h2>}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {/* Custom Header Component */}
            {customHeaderComponent}
            
            {/* DateRangePicker */}
            {enableDateRangePicker && dateRange && onDateRangeChange && (
              <DateRangePicker
                value={dateRange}
                onChange={onDateRangeChange}
              />
            )}
            
            {/* Search Input */}
            {enableSearch && (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input
                  placeholder={searchPlaceholder}
                  className="h-8 w-full max-w-xs rounded border px-2 text-sm"
                  value={globalFilter}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
                />
              </div>
            )}
            
            {/* Print Button */}
            {enablePrint && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={onPrint || printCurrentTable}
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Print</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Export Dropdown */}
            {enableExport && onExport && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Download className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Export Data</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {onExport.html && (
                    <DropdownMenuItem onClick={() => startExport("html")}>
                      Export as HTML
                    </DropdownMenuItem>
                  )}
                  {onExport.csv && (
                    <DropdownMenuItem onClick={() => startExport("csv")}>
                      Export as CSV
                    </DropdownMenuItem>
                  )}
                  {onExport.text && (
                    <DropdownMenuItem onClick={() => startExport("text")}>
                      Export as Text
                    </DropdownMenuItem>
                  )}
                  {onExport.excel && (
                    <DropdownMenuItem onClick={() => startExport("excel")}>
                      Export as Excel
                    </DropdownMenuItem>
                  )}
                  {onExport.pdf && (
                    <DropdownMenuItem onClick={() => startExport("pdf")}>
                      Export as PDF
                    </DropdownMenuItem>
                  )}
                  {onExport.json && (
                    <DropdownMenuItem onClick={() => startExport("json")}>
                      Export as JSON
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {/* Show All/Pages Toggle */}
            {enableShowAll && enablePagination && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowAll((v) => !v)}
                  >
                    {showAll ? <List className="h-4 w-4" /> : <Infinity className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{showAll ? "Show Pages" : "Show All"}</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {/* Filter Dropdown */}
            {enableFilter && ((filterOptions && filterOptions.length > 0) || (serverSideFilterOptions && serverSideFilterOptions.length > 0)) && (
              <DropdownMenu>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Filter Data</p>
                  </TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* Server-Side Filter Options - Clean Select Style */}
                  {serverSideFilterOptions && serverSideFilterOptions.length > 0 && (
                    <>
                      <DropdownMenuItem 
                        onClick={() => onServerSideFilterChange?.(undefined)}
                        className={`cursor-pointer ${
                          !activeServerSideFilter 
                            ? 'bg-primary/10 text-primary font-medium' 
                            : ''
                        }`}
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>All Customers</span>
                          {!activeServerSideFilter && (
                            <Check className="h-4 w-4 ml-auto" />
                          )}
                        </span>
                      </DropdownMenuItem>
                      {serverSideFilterOptions.map((option) => (
                        <DropdownMenuItem 
                          key={option.key}
                          onClick={() => onServerSideFilterChange?.(option.key)}
                          className={`cursor-pointer ${
                            activeServerSideFilter === option.key 
                              ? 'bg-primary/10 text-primary font-medium' 
                              : ''
                          }`}
                        >
                          <span className="flex items-center justify-between w-full">
                            <span>{option.label}</span>
                            {activeServerSideFilter === option.key && (
                              <Check className="h-4 w-4 ml-auto" />
                            )}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                  
                  {/* Client-Side Filter Options - Checkboxes */}
                  {filterOptions && filterOptions.length > 0 && filterOptions.map((option) => (
                    <div key={option.key} className="px-2 py-1.5">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`filter-${option.key}`}
                          checked={option.checked || false}
                          onChange={(e) => option.onToggle?.(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label 
                          htmlFor={`filter-${option.key}`} 
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {option.label}
                        </label>
                      </div>
                    </div>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Table */}
        <div ref={tableContainerRef} className="mt-3 overflow-hidden rounded-md border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-full">
            <thead className="bg-muted/30">
              {columnGroups && columnGroups.length > 0 ? (
                <>
                  {/* Column Group Header Row */}
                  <tr>
                    {table.getHeaderGroups()[0]?.headers.map((header) => {
                      const columnKey = header.column.id;
                      const group = columnGroups.find(g => g.columnKeys.includes(columnKey));
                      
                      // Check if this is the first column in the group
                      if (group) {
                        const isFirstInGroup = group.columnKeys[0] === columnKey;
                        if (isFirstInGroup) {
                          return (
                            <th
                              key={`group-${columnKey}`}
                              colSpan={group.columnKeys.length}
                              className="border-b px-2 sm:px-3 py-1.5 sm:py-2 text-center font-bold bg-muted/50 text-xs sm:text-sm"
                            >
                              {group.label}
                            </th>
                          );
                        }
                        return null; // Skip other columns in the group
                      }
                      
                      // Column not in any group
                      return (
                        <th
                          key={`group-${columnKey}`}
                          rowSpan={2}
                          className="border-b px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-xs sm:text-sm"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      );
                    })}
                  </tr>
                  {/* Regular Column Header Row */}
                  <tr>
                    {table.getHeaderGroups()[0]?.headers.map((header) => {
                      const columnKey = header.column.id;
                      const isInGroup = columnGroups.some(g => g.columnKeys.includes(columnKey));
                      
                      if (!isInGroup) {
                        return null; // Already rendered with rowSpan in previous row
                      }
                      
                      return (
                        <th key={header.id} className="border-b px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-xs sm:text-sm">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      );
                    })}
                  </tr>
                </>
              ) : (
                /* Standard single header row when no groups */
                table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="border-b px-2 sm:px-3 py-1.5 sm:py-2 text-left font-semibold text-xs sm:text-sm">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))
              )}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border-b px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 border-b text-center text-xs sm:text-sm">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
        
        {/* Pagination Controls */}
        {enablePagination && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 py-3 print:hidden">
            <div className="text-muted-foreground text-xs sm:text-sm">
              {table.getFilteredRowModel().rows.length} row(s)
              {!showAll && ` (Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()})`}
            </div>
            {!showAll && (
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1 sm:gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.setPageIndex(0)} 
                  disabled={!table.getCanPreviousPage()}
                  className="text-xs px-2 h-8"
                >
                  First
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.previousPage()} 
                  disabled={!table.getCanPreviousPage()}
                  className="text-xs px-2 h-8"
                >
                  Prev
                </Button>
                <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2">
                  {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.nextPage()} 
                  disabled={!table.getCanNextPage()}
                  className="text-xs px-2 h-8"
                >
                  Next
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
                  disabled={!table.getCanNextPage()}
                  className="text-xs px-2 h-8"
                >
                  Last
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Export confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmation</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p>
              The {pendingExport?.toUpperCase()} export file will be generated for download.
            </p>
            <p className="text-muted-foreground">
              Disable any popup blockers in your browser to ensure proper download.
            </p>
            <p>Ok to proceed?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={confirmAndExport}>Ok</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

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
import { Download, Filter, Printer, Infinity, List, Search } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export interface FilterOption<TData> {
  key: string;
  label: string;
  predicate: (row: TData) => boolean;
}

export interface CustomTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  title?: string;
  
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
  
  // Filter configuration
  filterOptions?: FilterOption<TData>[];
  initialFilterKey?: string;
  
  // Export configuration
  onExport?: {
    html?: (data: TData[]) => void;
    csv?: (data: TData[]) => void;
    text?: (data: TData[]) => void;
    excel?: (data: TData[]) => void;
    pdf?: (data: TData[]) => void;
    json?: (data: TData[]) => void;
  };
  
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
  
  // Filter configuration
  filterOptions,
  initialFilterKey,
  
  // Export configuration
  onExport,
  
  // Pagination configuration
  pageSize = 10,
  showPageSizeOptions = false,
  pageSizeOptions = [5, 10, 20, 50, 100],
  
  // Custom components
  customHeaderComponent,
  
  // DateRangePicker configuration
  dateRange,
  onDateRangeChange,
}: CustomTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [activeFilterKey, setActiveFilterKey] = React.useState<string | undefined>(initialFilterKey);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: pageSize,
  });
  const tableContainerRef = React.useRef<HTMLDivElement | null>(null);

  const printCurrentTable = React.useCallback(() => {
    const tableEl = tableContainerRef.current?.querySelector('table');
    if (!tableEl) {
      window.print();
      return;
    }
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
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      window.print();
      return;
    }
    doc.open();
    doc.write(`<!doctype html><html><head><meta charset="utf-8"><title>Report</title><style>${styles}</style></head><body>${titleHtml}${rangeHtml}${tableEl.outerHTML}</body></html>`);
    doc.close();
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 0);
    };
  }, []);

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
    
    // Apply custom filter
    if (enableFilter && filterOptions && activeFilterKey) {
      const filter = filterOptions.find(f => f.key === activeFilterKey);
      if (filter) {
        result = result.filter(filter.predicate);
      }
    }
    
    return result;
  }, [data, enableSearch, globalFilter, getSearchValue, enableFilter, filterOptions, activeFilterKey]);

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
      <Card className="w-full p-3 md:p-4">
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
                    onClick={printCurrentTable}
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
            {enableFilter && filterOptions && filterOptions.length > 0 && (
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
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setActiveFilterKey(undefined)}>
                    All Records
                  </DropdownMenuItem>
                  {filterOptions.map((option) => (
                    <DropdownMenuItem
                      key={option.key}
                      onClick={() => setActiveFilterKey(option.key)}
                    >
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        {/* Table */}
        <div ref={tableContainerRef} className="mt-3 overflow-hidden rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="border-b px-3 py-2 text-left font-semibold">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/20">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border-b px-3 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 border-b text-center">
                    No results.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {enablePagination && (
          <div className="flex items-center justify-between px-2 py-2 print:hidden">
            <div className="text-muted-foreground text-sm">
              {table.getFilteredRowModel().rows.length} row(s)
              {!showAll && ` (Page ${table.getState().pagination.pageIndex + 1} of ${table.getPageCount()})`}
            </div>
            {!showAll && (
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.setPageIndex(0)} 
                  disabled={!table.getCanPreviousPage()}
                >
                  First
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.previousPage()} 
                  disabled={!table.getCanPreviousPage()}
                >
                  Prev
                </Button>
                <span className="text-sm text-muted-foreground px-2">
                  {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.nextPage()} 
                  disabled={!table.getCanNextPage()}
                >
                  Next
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)} 
                  disabled={!table.getCanNextPage()}
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

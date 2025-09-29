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
          <div className="flex flex-wrap items-center gap-2">
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
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => window.print()}>
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
                    <DropdownMenuItem onClick={() => onExport.html?.(filteredData)}>
                      Export as HTML
                    </DropdownMenuItem>
                  )}
                  {onExport.csv && (
                    <DropdownMenuItem onClick={() => onExport.csv?.(filteredData)}>
                      Export as CSV
                    </DropdownMenuItem>
                  )}
                  {onExport.text && (
                    <DropdownMenuItem onClick={() => onExport.text?.(filteredData)}>
                      Export as Text
                    </DropdownMenuItem>
                  )}
                  {onExport.excel && (
                    <DropdownMenuItem onClick={() => onExport.excel?.(filteredData)}>
                      Export as Excel
                    </DropdownMenuItem>
                  )}
                  {onExport.pdf && (
                    <DropdownMenuItem onClick={() => onExport.pdf?.(filteredData)}>
                      Export as PDF
                    </DropdownMenuItem>
                  )}
                  {onExport.json && (
                    <DropdownMenuItem onClick={() => onExport.json?.(filteredData)}>
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
        <div className="mt-3 overflow-hidden rounded-md border">
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
          <div className="flex items-center justify-between px-2 py-2">
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
    </TooltipProvider>
  );
}

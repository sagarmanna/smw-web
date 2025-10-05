import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Download, Filter, Printer, Infinity, List, Search, Check } from "lucide-react";
import { DateRangePicker } from "@/components/DateRangePicker";
import { FilterOption, ServerSideFilterOption } from "./types";

interface TableToolbarProps<TData> {
  // Search
  enableSearch: boolean;
  searchPlaceholder: string;
  globalFilter: string;
  onGlobalFilterChange: (value: string) => void;
  
  // Date Range Picker
  enableDateRangePicker: boolean;
  dateRange?: { from: Date; to: Date };
  onDateRangeChange?: (range: { from: Date; to: Date }) => void;
  
  // Print
  enablePrint: boolean;
  onPrint?: () => void;
  
  // Export
  enableExport: boolean;
  onExport?: {
    html?: (data: TData[]) => void;
    csv?: (data: TData[]) => void;
    text?: (data: TData[]) => void;
    excel?: (data: TData[]) => void;
    pdf?: (data: TData[]) => void;
    json?: (data: TData[]) => void;
  };
  onStartExport: (kind: "html" | "csv" | "text" | "excel" | "pdf" | "json") => void;
  
  // Show All/Pages Toggle
  enableShowAll: boolean;
  enablePagination: boolean;
  showAll: boolean;
  onShowAllToggle: () => void;
  
  // Rows per page
  enableRowsPerPage: boolean;
  rowsPerPage: number;
  rowsPerPageOptions: number[];
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  
  // Filter
  enableFilter: boolean;
  filterOptions?: FilterOption<TData>[];
  serverSideFilterOptions?: ServerSideFilterOption[];
  activeServerSideFilter?: string;
  onServerSideFilterChange?: (filterKey: string | undefined) => void;
  
  // Custom header component
  customHeaderComponent?: React.ReactNode;
}

export function TableToolbar<TData>({
  enableSearch,
  searchPlaceholder,
  globalFilter,
  onGlobalFilterChange,
  enableDateRangePicker,
  dateRange,
  onDateRangeChange,
  enablePrint,
  onPrint,
  enableExport,
  onExport,
  onStartExport,
  enableShowAll,
  enablePagination,
  showAll,
  onShowAllToggle,
  enableRowsPerPage,
  rowsPerPage,
  rowsPerPageOptions,
  onRowsPerPageChange,
  enableFilter,
  filterOptions,
  serverSideFilterOptions,
  activeServerSideFilter,
  onServerSideFilterChange,
  customHeaderComponent,
}: TableToolbarProps<TData>) {
  return (
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onGlobalFilterChange(e.target.value)}
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
              onClick={onPrint}
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
              <DropdownMenuItem onClick={() => onStartExport("html")}>
                Export as HTML
              </DropdownMenuItem>
            )}
            {onExport.csv && (
              <DropdownMenuItem onClick={() => onStartExport("csv")}>
                Export as CSV
              </DropdownMenuItem>
            )}
            {onExport.text && (
              <DropdownMenuItem onClick={() => onStartExport("text")}>
                Export as Text
              </DropdownMenuItem>
            )}
            {onExport.excel && (
              <DropdownMenuItem onClick={() => onStartExport("excel")}>
                Export as Excel
              </DropdownMenuItem>
            )}
            {onExport.pdf && (
              <DropdownMenuItem onClick={() => onStartExport("pdf")}>
                Export as PDF
              </DropdownMenuItem>
            )}
            {onExport.json && (
              <DropdownMenuItem onClick={() => onStartExport("json")}>
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
              onClick={onShowAllToggle}
            >
              {showAll ? <List className="h-4 w-4" /> : <Infinity className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{showAll ? "Show Pages" : "Show All"}</p>
          </TooltipContent>
        </Tooltip>
      )}
      
      {/* Rows per page selector */}
      {enableRowsPerPage && (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <span className="text-xs font-medium">
                    {rowsPerPage === -1 ? "All" : rowsPerPage}
                  </span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Rows per page</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {rowsPerPageOptions.map((option) => (
              <DropdownMenuItem 
                key={option}
                onClick={() => onRowsPerPageChange(option)}
                className={`cursor-pointer ${
                  rowsPerPage === option 
                    ? 'bg-primary/10 text-primary font-medium' 
                    : ''
                }`}
              >
                <span className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {rowsPerPage === option && (
                    <Check className="h-4 w-4 ml-auto" />
                  )}
                </span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => onRowsPerPageChange(-1)}
              className={`cursor-pointer ${
                rowsPerPage === -1 
                  ? 'bg-primary/10 text-primary font-medium' 
                  : ''
              }`}
            >
              <span className="flex items-center justify-between w-full">
                <span>All</span>
                {rowsPerPage === -1 && (
                  <Check className="h-4 w-4 ml-auto" />
                )}
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
  );
}

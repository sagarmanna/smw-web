import * as React from "react";
import { flexRender, Table, Header } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { ColumnGroup } from "./types";
import { ColumnFilterComponent } from "./ColumnFilter";
import { ColumnFilter } from "../CustomTable";

interface TableHeaderProps<TData> {
  table: Table<TData>;
  columnGroups?: ColumnGroup[];
  getSizeClasses: {
    header: string;
  };
  stickyHeader?: boolean;
  headerClassName?: string;
  enableColumnFilters?: boolean;
  columnFilters?: Record<string, unknown>;
  onColumnFilterChange?: (columnKey: string, filterValue: unknown) => void;
  onColumnFilterEnter?: (columnKey: string) => void;
}

export function TableHeader<TData>({
  table,
  columnGroups,
  getSizeClasses,
  stickyHeader = false,
  headerClassName,
  enableColumnFilters = false,
  columnFilters = {},
  onColumnFilterChange,
  onColumnFilterEnter,
}: TableHeaderProps<TData>) {
  // Helper function to render a sortable header
  const renderSortableHeader = (header: Header<TData, unknown>) => {
    const canSort = header.column.getCanSort();
    return (
      <div
        className={canSort ? "cursor-pointer select-none flex items-center justify-center gap-2" : "flex items-center justify-center gap-2"}
        onClick={header.column.getToggleSortingHandler()}
      >
        {flexRender(header.column.columnDef.header, header.getContext())}
        {canSort && (
          <ArrowUpDown
            className={`h-3 w-3 transition-transform duration-150 ${
              header.column.getIsSorted() === "asc"
                ? "transform rotate-180 text-primary"
                : header.column.getIsSorted() === "desc"
                ? "text-primary"
                : "text-muted-foreground/50"
            }`}
          />
        )}
      </div>
    );
  };

  // Helper function to render column filter
  const renderColumnFilter = (header: Header<TData, unknown>) => {
    if (!enableColumnFilters || !onColumnFilterChange) return null;
    
    const columnKey = header.column.id;
    const filterConfig = (header.column.columnDef as { filter?: ColumnFilter }).filter;
    
    if (!filterConfig) return null;

    const handleFilterChange = (value: unknown) => {
      onColumnFilterChange(columnKey, value);
    };

    const handleFilterClear = () => {
      onColumnFilterChange(columnKey, null);
    };

    return (
      <ColumnFilterComponent
        filter={filterConfig}
        value={columnFilters[columnKey]}
        onValueChange={handleFilterChange}
        onClear={handleFilterClear}
        onEnter={onColumnFilterEnter ? () => onColumnFilterEnter(columnKey) : undefined}
      />
    );
  };
  
  const renderHeaderRows = () => {
    return columnGroups && columnGroups.length > 0 ? (
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
                    className={`${getSizeClasses.header} text-center font-bold bg-muted/40 text-foreground border-b border-border/30`}
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
                className={`${getSizeClasses.header} text-center font-semibold text-foreground border-r border-border/50`}
                style={{
                  width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined,
                  minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined,
                  maxWidth: header.column.columnDef.maxSize ? `${header.column.columnDef.maxSize}px` : undefined,
                }}
              >
                {renderSortableHeader(header)}
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
              <th
                key={header.id}
                className={`${getSizeClasses.header} text-center font-semibold text-foreground border-r border-border/50`}
                style={{
                  width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined,
                  minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined,
                  maxWidth: header.column.columnDef.maxSize ? `${header.column.columnDef.maxSize}px` : undefined,
                }}
              >
                {renderSortableHeader(header)}
              </th>
            );
          })}
        </tr>
        {/* Column Filter Row */}
        {enableColumnFilters && (
          <tr>
            {table.getHeaderGroups()[0]?.headers.map((header) => {
              const columnKey = header.column.id;
              const isInGroup = columnGroups.some(g => g.columnKeys.includes(columnKey));
              
              if (!isInGroup) {
                return null; // Already rendered with rowSpan in previous row
              }
              
              return (
                <th 
                  key={`filter-${header.id}`} 
                  className={`px-2 py-2 text-center border-r border-border/50`}
                  style={{
                    width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined,
                    minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined,
                    maxWidth: header.column.columnDef.maxSize ? `${header.column.columnDef.maxSize}px` : undefined,
                  }}
                >
                  {renderColumnFilter(header)}
                </th>
              );
            })}
          </tr>
        )}
      </>
    ) : (
      <>
        {/* Standard single header row when no groups */}
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className={`${getSizeClasses.header} text-center font-semibold text-foreground border-r border-border/50`}
                style={{
                  width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined,
                  minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined,
                  maxWidth: header.column.columnDef.maxSize ? `${header.column.columnDef.maxSize}px` : undefined,
                }}
              >
                {renderSortableHeader(header)}
              </th>
            ))}
          </tr>
        ))}
        {/* Column Filter Row */}
        {enableColumnFilters && (
          <tr>
            {table.getHeaderGroups()[0]?.headers.map((header) => (
              <th 
                key={`filter-${header.id}`} 
                className={`px-2 py-2 text-center border-r border-border/50`}
                style={{
                  width: header.column.columnDef.size ? `${header.column.columnDef.size}px` : undefined,
                  minWidth: header.column.columnDef.minSize ? `${header.column.columnDef.minSize}px` : undefined,
                  maxWidth: header.column.columnDef.maxSize ? `${header.column.columnDef.maxSize}px` : undefined,
                }}
              >
                {renderColumnFilter(header)}
              </th>
            ))}
          </tr>
        )}
      </>
    );
  };

  return (
    <thead className={`bg-muted/40 border-b border-border/50 ${stickyHeader ? "sticky top-0 z-10" : ""} ${headerClassName || ""}`}>
      {renderHeaderRows()}
    </thead>
  );
}

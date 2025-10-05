import * as React from "react";
import { flexRender, Table } from "@tanstack/react-table";
import { ColumnGroup } from "./types";

interface TableHeaderProps<TData> {
  table: Table<TData>;
  columnGroups?: ColumnGroup[];
  getSizeClasses: {
    header: string;
  };
  stickyHeader?: boolean;
  headerClassName?: string;
}

export function TableHeader<TData>({
  table,
  columnGroups,
  getSizeClasses,
  stickyHeader = false,
  headerClassName,
}: TableHeaderProps<TData>) {
  return (
    <thead className={`bg-muted/30 ${stickyHeader ? "sticky top-0 z-10" : ""} ${headerClassName || ""}`}>
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
                      className={`border-b ${getSizeClasses.header} text-center font-bold bg-muted/50`}
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
                  className={`border-b ${getSizeClasses.header} text-left font-semibold`}
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
                <th key={header.id} className={`border-b ${getSizeClasses.header} text-left font-semibold`}>
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
              <th key={header.id} className={`border-b ${getSizeClasses.header} text-left font-semibold`}>
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))
      )}
    </thead>
  );
}

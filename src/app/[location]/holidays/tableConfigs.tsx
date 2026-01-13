/**
 * Holidays table column configurations
 * 
 * Defines the column structure for the holidays listing table,
 * including custom headers with sortable functionality
 */

import React from "react";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { HolidayRow } from "./holidays.api";

/**
 * Column definitions for holidays table
 * Includes custom headers with left-aligned titles and sort arrows
 */
export const holidaysColumns: ColumnDef<HolidayRow>[] = [
  {
    accessorKey: "date",
    header: ({ column }: HeaderContext<HolidayRow, unknown>) => {
      const canSort = column.getCanSort();
      const isSorted = column.getIsSorted();
      
      /**
       * Handle click on header to toggle sorting
       * Prevents event propagation to avoid triggering parent click handlers
       */
      const handleClick = (e: React.MouseEvent) => {
        if (canSort) {
          e.stopPropagation();
          column.getToggleSortingHandler()?.(e);
        }
      };
      
      return (
        <div 
          className="flex items-center gap-1.5 text-left w-full justify-start"
          onClick={handleClick}
        >
          <span className={canSort ? "cursor-pointer select-none" : ""}>Date</span>
          {canSort && (
            <ArrowUpDown
              className={`h-3 w-3 transition-transform duration-150 flex-shrink-0 cursor-pointer ${
                isSorted === "asc"
                  ? "transform rotate-180 text-primary"
                  : isSorted === "desc"
                  ? "text-primary"
                  : "text-muted-foreground/50"
              }`}
            />
          )}
        </div>
      );
    },
    cell: ({ row }: { row: { original: HolidayRow } }) => (
      <span className="text-sm">{row.original.date}</span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Date" },
  } as ColumnDef<HolidayRow>,
  {
    accessorKey: "description",
    header: ({ column }: HeaderContext<HolidayRow, unknown>) => {
      const canSort = column.getCanSort();
      const isSorted = column.getIsSorted();
      
      /**
       * Handle click on header to toggle sorting
       * Prevents event propagation to avoid triggering parent click handlers
       */
      const handleClick = (e: React.MouseEvent) => {
        if (canSort) {
          e.stopPropagation();
          column.getToggleSortingHandler()?.(e);
        }
      };
      
      return (
        <div 
          className="flex items-center gap-1.5 text-left w-full justify-start"
          onClick={handleClick}
        >
          <span className={canSort ? "cursor-pointer select-none" : ""}>Description</span>
          {canSort && (
            <ArrowUpDown
              className={`h-3 w-3 transition-transform duration-150 flex-shrink-0 cursor-pointer ${
                isSorted === "asc"
                  ? "transform rotate-180 text-primary"
                  : isSorted === "desc"
                  ? "text-primary"
                  : "text-muted-foreground/50"
              }`}
            />
          )}
        </div>
      );
    },
    cell: ({ row }: { row: { original: HolidayRow } }) => (
      <span className="text-sm">{row.original.description}</span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Description" },
  } as ColumnDef<HolidayRow>,
];

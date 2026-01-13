/**
 * Referral Source table column configurations
 * 
 * Defines the column structure for the referral source listing table,
 * including custom header with sortable functionality
 */

import React from "react";
import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { ReferralSourceRow } from "./referralSource.api";

/**
 * Column definitions for referral source table
 * Includes custom header with left-aligned title and sort arrow
 */
export const referralSourceColumns: ColumnDef<ReferralSourceRow>[] = [
  {
    accessorKey: "name",
    header: ({ column }: HeaderContext<ReferralSourceRow, unknown>) => {
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
          <span className={canSort ? "cursor-pointer select-none" : ""}>Name</span>
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
    cell: ({ row }: { row: { original: ReferralSourceRow } }) => (
      <span className="text-sm">{row.original.name}</span>
    ),
    enableSorting: true,
    meta: { printable: true, printableName: "Name" },
  } as ColumnDef<ReferralSourceRow>,
];

import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

interface TablePaginationProps<TData> {
  table: Table<TData>;
  showAll: boolean;
  enablePagination: boolean;
}

export function TablePagination<TData>({
  table,
  showAll,
  enablePagination,
}: TablePaginationProps<TData>) {
  if (!enablePagination) return null;

  return (
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
  );
}

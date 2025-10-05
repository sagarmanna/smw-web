import * as React from "react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

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

  const totalRows = table.getFilteredRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t bg-muted/30 print:hidden">
      {/* Records Info */}
      <div className="text-muted-foreground text-sm">
        {totalRows} row{totalRows !== 1 ? 's' : ''}
        {!showAll && totalPages > 1 && (
          <span className="ml-1">
            (Page <span className="font-medium text-foreground">{currentPage}</span> of{" "}
            <span className="font-medium text-foreground">{totalPages}</span>)
          </span>
        )}
      </div>
      
      {/* Pagination Controls */}
      {!showAll && totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="h-8 w-8 p-0"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Page Info */}
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </span>
          </div>
          
          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(totalPages - 1)}
            disabled={!table.getCanNextPage()}
            className="h-8 w-8 p-0"
            title="Last page"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

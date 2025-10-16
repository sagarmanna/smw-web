import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface ServerSidePaginationProps {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  enablePagination?: boolean;
}

export function ServerSidePagination({
  pagination,
  onPageChange,
  enablePagination = true,
}: ServerSidePaginationProps) {
  if (!enablePagination) return null;

  const startRecord = pagination.limit === -1 ? 1 : ((pagination.page - 1) * pagination.limit) + 1;
  const endRecord = pagination.limit === -1 ? pagination.total : Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-t bg-muted/30 print:hidden">
      {/* Records Info */}
      <div className="text-muted-foreground text-sm">
        Showing <span className="font-medium text-foreground">{startRecord}</span> to{" "}
        <span className="font-medium text-foreground">{endRecord}</span> of{" "}
        <span className="font-medium text-foreground">{pagination.total}</span> records
      </div>
      
      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center gap-1">
          {/* First Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={pagination.page === 1}
            className="h-8 w-8 p-0"
            title="First page"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          {/* Previous Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="h-8 w-8 p-0"
            title="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Page Info */}
          <div className="flex items-center gap-2 px-3">
            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium">{pagination.page}</span> of{" "}
              <span className="font-medium">{pagination.totalPages}</span>
            </span>
          </div>
          
          {/* Next Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="h-8 w-8 p-0"
            title="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {/* Last Page */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.totalPages)}
            disabled={pagination.page === pagination.totalPages}
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

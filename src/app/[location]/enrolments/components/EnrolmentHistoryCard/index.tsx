"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EnrolmentHistory } from "../../types";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { processHistoryMessage, createHistoryLinkClickHandler } from "../../utils/historyUtils";

interface EnrolmentHistoryCardProps {
  history: EnrolmentHistory[];
  isLoading?: boolean;
  pagination?: { page: number; limit: number; total: number; totalPages: number } | null;
  historyLoading?: boolean;
  historyError?: string | null;
  onPageChange?: (page: number) => void;
}

export const EnrolmentHistoryCard = React.memo(function EnrolmentHistoryCard({
  history,
  isLoading = false,
  pagination,
  historyLoading = false,
  historyError,
  onPageChange,
}: EnrolmentHistoryCardProps) {
  // Use page from API response for display (synced with actual data)
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10; // Use limit from API response

  const handlePreviousPage = React.useCallback(() => {
    if (currentPage > 1 && !historyLoading && onPageChange) {
      const newPage = currentPage - 1;
      onPageChange(newPage);
    }
  }, [currentPage, historyLoading, onPageChange]);

  const handleNextPage = React.useCallback(() => {
    if (currentPage < totalPages && !historyLoading && onPageChange) {
      const newPage = currentPage + 1;
      onPageChange(newPage);
    }
  }, [currentPage, totalPages, historyLoading, onPageChange]);

  const router = useRouter();

  // Memoize link click handler to avoid recreating on every render
  const handleLinkClick = React.useMemo(
    () => createHistoryLinkClickHandler(router),
    [router]
  );

  const columns = React.useMemo<ColumnDef<EnrolmentHistory>[]>(() => [
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const item = row.original as EnrolmentHistory;
        const processedHtml = processHistoryMessage(item.createdOn, item.message);

        return (
          <div 
            className="text-sm" 
            dangerouslySetInnerHTML={{ __html: processedHtml }}
            onClick={handleLinkClick}
            role="region"
            aria-label={`History entry from ${item.createdOn || 'unknown date'}`}
            aria-live="polite"
            tabIndex={0}
            onKeyDown={(e) => {
              // Allow keyboard navigation for links
              if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target as HTMLElement;
                const anchor = target.closest("a") as HTMLAnchorElement | null;
                if (anchor) {
                  e.preventDefault();
                  anchor.click();
                }
              }
            }}
          />
        );
      },
    },
  ], [handleLinkClick]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold" id="enrolment-history-title">
          History
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {historyError ? (
          <div 
            className="text-center py-8 text-red-500"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
          >
            <p className="font-medium" aria-label="Error message">Error loading data</p>
            <p className="text-sm" aria-label="Error details">{historyError}</p>
          </div>
        ) : (
          <>
            <div role="region" aria-labelledby="enrolment-history-title" aria-live="polite">
              <CustomTable
                data={history}
                columns={columns}
                size="compact"
                variant="striped"
                enableSorting={true}
                enableExport={false}
                enablePrint={false}
                enableSearch={false}
                enableFilter={false}
                className="border-0 w-full"
                isLoading={isLoading || historyLoading}
                customLoadingState={
                  <div role="status" aria-label="Loading history data">
                    <LoadingAnimation 
                      size="md" 
                      text="Loading history..." 
                      className="py-8"
                    />
                  </div>
                }
                customEmptyState={
                  !isLoading && !historyLoading && history.length === 0 ? (
                    <div 
                      className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8"
                      role="status"
                      aria-label="No history entries found"
                    >
                      <div className="text-4xl" aria-hidden="true">📋</div>
                      <span className="text-sm font-medium">No history found</span>
                    </div>
                  ) : undefined
                }
              />
            </div>
            
            {/* Server-side Pagination Controls */}
            {totalRows > 0 && (
              <nav 
                className="flex items-center justify-between mt-4"
                aria-label="History pagination"
                role="navigation"
              >
                <div 
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Showing{" "}
                  <span aria-label={`Entry ${((currentPage - 1) * rowsPerPage) + 1}`}>
                    {((currentPage - 1) * rowsPerPage) + 1}
                  </span>{" "}
                  to{" "}
                  <span aria-label={`Entry ${Math.min(currentPage * rowsPerPage, totalRows)}`}>
                    {Math.min(currentPage * rowsPerPage, totalRows)}
                  </span>{" "}
                  of{" "}
                  <span aria-label={`Total ${totalRows} entries`}>
                    {totalRows}
                  </span>{" "}
                  entries
                </div>
                <div className="flex items-center gap-2" role="group" aria-label="Pagination controls">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || historyLoading}
                    aria-label={`Go to previous page, page ${currentPage - 1}`}
                    aria-disabled={currentPage === 1 || historyLoading}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Previous page</span>
                  </Button>
                  <span 
                    className="text-sm text-muted-foreground"
                    aria-label={`Current page ${currentPage} of ${totalPages}`}
                  >
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || historyLoading}
                    aria-label={`Go to next page, page ${currentPage + 1}`}
                    aria-disabled={currentPage >= totalPages || historyLoading}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Next page</span>
                  </Button>
                </div>
              </nav>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});


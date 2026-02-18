"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { processHistoryMessage, createInvoiceHistoryLinkClickHandler } from "@/app/[location]/invoices/utils/historyUtils";
import type { InvoiceHistoryEntry } from "../../types";

interface InvoiceHistoryCardProps {
  history?: InvoiceHistoryEntry[];
  isLoading?: boolean;
  pagination?: { page: number; limit: number; total: number; totalPages: number } | null;
  historyLoading?: boolean;
  historyError?: string | null;
  onPageChange?: (page: number) => void;
  location: string;
}

export const InvoiceHistoryCard = React.memo(function InvoiceHistoryCard({
  history = [],
  isLoading = false,
  pagination,
  historyLoading = false,
  historyError,
  onPageChange,
  location,
}: InvoiceHistoryCardProps) {
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 20;

  const handlePreviousPage = React.useCallback(() => {
    if (currentPage > 1 && !historyLoading && onPageChange) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, historyLoading, onPageChange]);

  const handleNextPage = React.useCallback(() => {
    if (currentPage < totalPages && !historyLoading && onPageChange) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, historyLoading, onPageChange]);

  const router = useRouter();

  const handleLinkClick = React.useMemo(
    () => createInvoiceHistoryLinkClickHandler(router, location),
    [router, location]
  );

  const columns = React.useMemo<ColumnDef<InvoiceHistoryEntry>[]>(() => [
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const item = row.original;
        const processedHtml = processHistoryMessage(item.createdOn, item.message);
        return (
          <div
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: processedHtml }}
            onClick={handleLinkClick}
            role="region"
            aria-label={`History entry from ${item.createdOn || "unknown date"}`}
          />
        );
      },
    },
  ], [handleLinkClick]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">History</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {historyError ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{historyError}</p>
          </div>
        ) : (
          <>
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
                <LoadingAnimation
                  size="md"
                  text="Loading history..."
                  className="py-8"
                />
              }
              customEmptyState={
                !isLoading && !historyLoading && history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No history found</span>
                  </div>
                ) : undefined
              }
            />

            {totalRows > 0 && (
              <nav className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to{" "}
                  {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || historyLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages || historyLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
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

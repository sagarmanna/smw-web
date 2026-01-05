"use client";

import { useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import type { HistoryTabProps, HistoryData } from "./types";

// Re-export types for convenience
export type { HistoryData, HistoryTabConfig, HistoryTabProps } from "./types";
export { createHistoryTabConfig } from "./createHistoryTabConfig";

/**
 * HistoryTab - Pure UI component for displaying history data
 * 
 * This component is UI-only and receives all data/logic via dependency injection
 * through the config prop. This follows the Dependency Inversion Principle (SOLID).
 * 
 * @template TData - History data type extending HistoryData
 */
export function HistoryTab<TData extends HistoryData = HistoryData>({
  location,
  entityId,
  config,
}: HistoryTabProps<TData>) {
  const dispatch = useAppDispatch();
  
  // Read data from Redux state using injected selectors
  // All hooks must be called unconditionally
  const data = useAppSelector(config.selectors.selectData);
  const isLoading = useAppSelector(config.selectors.selectLoading);
  const error = useAppSelector(config.selectors.selectError);
  const storedEntityId = useAppSelector(config.selectors.selectEntityId);
  const pagination = useAppSelector(
    config.selectors.selectPagination || (() => null)
  );
  
  // Pagination values
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10;
  
  // Fetch data when entityId changes
  useEffect(() => {
    // Only fetch if we don't have data for this entity yet
    if (storedEntityId !== entityId) {
      const fetchParams = {
        location,
        [config.entityIdParamName]: entityId,
      };
      dispatch(config.fetchAction(fetchParams));
    }
  }, [location, entityId, dispatch, storedEntityId, config]);

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isLoading && pagination) {
      const newPage = currentPage - 1;
      const fetchParams = {
        location,
        [config.entityIdParamName]: entityId,
        page: newPage,
      };
      dispatch(config.fetchAction(fetchParams));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !isLoading && pagination) {
      const newPage = currentPage + 1;
      const fetchParams = {
        location,
        [config.entityIdParamName]: entityId,
        page: newPage,
      };
      dispatch(config.fetchAction(fetchParams));
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">History</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {error ? (
          <div className="text-center py-8 text-red-500">
            <p className="font-medium">Error loading data</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            <CustomTable
              data={data as TData[]}
              columns={config.columns}
              size="compact"
              variant="striped"
              enableSorting={true}
              enableExport={false}
              enablePrint={false}
              enableSearch={false}
              enableFilter={false}
              className="border-0 w-full"
              isLoading={isLoading}
              customLoadingState={
                <LoadingAnimation 
                  size="md" 
                  text="Loading history..." 
                  className="py-8"
                />
              }
              customEmptyState={
                !isLoading && data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No history found</span>
                  </div>
                ) : undefined
              }
            />
            
            {/* Server-side Pagination Controls */}
            {pagination && totalRows > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1 || isLoading}
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
                    disabled={currentPage >= totalPages || isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}


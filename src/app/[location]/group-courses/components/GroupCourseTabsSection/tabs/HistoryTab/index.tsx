"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { historyColumns, HistoryData } from "../../../../[id]/groupCourseTabConfigs";
import { fetchGroupCourseHistory } from "../../../../[id]/groupCourseTabs.slice";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface HistoryTabProps {
  location: string;
  courseId: number;
}

export function HistoryTab({ location, courseId }: HistoryTabProps) {
  const dispatch = useAppDispatch();
  const data = useAppSelector((state) => state.groupCourseTabs.historyData);
  const pagination = useAppSelector((state) => state.groupCourseTabs.historyPagination);
  const isLoading = useAppSelector((state) => state.groupCourseTabs.historyLoading);
  const error = useAppSelector((state) => state.groupCourseTabs.historyError);

  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || data.length;
  const rowsPerPage = pagination?.limit || data.length || 10;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">History</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CustomTable
          data={data as HistoryData[]}
          columns={historyColumns}
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
            !isLoading ? (
              error ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">⚠️</div>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                  <div className="text-4xl">📋</div>
                  <span className="text-sm font-medium">No history found</span>
                </div>
              ) : undefined
            ) : undefined
          }
        />

        {!error && totalRows > 0 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  if (currentPage > 1 && !isLoading) {
                    dispatch(fetchGroupCourseHistory({ location, courseId, page: currentPage - 1 }));
                  }
                }}
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
                onClick={() => {
                  if (currentPage < totalPages && !isLoading) {
                    dispatch(fetchGroupCourseHistory({ location, courseId, page: currentPage + 1 }));
                  }
                }}
                disabled={currentPage >= totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


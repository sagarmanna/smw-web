"use client";

import { useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getAbsentLessonColumns, AbsentLessonData } from "../../../../[id]/studentTabConfigs";
import { fetchAbsentLessonsData } from "../../../../[id]/studentTabs.slice";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface AbsentLessonsTabProps {
  location: string;
  studentId: string;
}

export function AbsentLessonsTab({ location, studentId }: AbsentLessonsTabProps) {
  const dispatch = useAppDispatch();
  
  // Read data from Redux state (no API call here - handled by parent)
  const data = useAppSelector((state) => state.studentTabs.absentLessonData);
  const pagination = useAppSelector((state) => state.studentTabs.absentLessonPagination);
  const isLoading = useAppSelector((state) => state.studentTabs.absentLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.absentLessonError);
  
  // Get columns with location parameter
  const columns = useMemo(() => getAbsentLessonColumns(location), [location]);
  
  // Use page from API response for display (synced with actual data)
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10; // Use limit from API response

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isLoading) {
      const newPage = currentPage - 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchAbsentLessonsData({ location, studentId, page: newPage }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !isLoading) {
      const newPage = currentPage + 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchAbsentLessonsData({ location, studentId, page: newPage }));
    }
  };

  const handleRowClick = useCallback(
    (row: AbsentLessonData) => {
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      // Use the lesson ID to redirect to the lesson view page
      if (row.id) {
        const url = `${legacyBase}/${location}/lesson/view?id=${row.id}`;
        window.location.href = url;
      }
    },
    [location]
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Absent Lessons</CardTitle>
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
              data={data as AbsentLessonData[]}
              columns={columns}
              size="compact"
              variant="striped"
              enableSorting={true}
              enableExport={false}
              enablePrint={false}
              enableSearch={false}
              enableFilter={false}
              className="border-0 w-full"
              isLoading={isLoading}
              onRowClick={handleRowClick}
              rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              customLoadingState={
                <LoadingAnimation 
                  size="md" 
                  text="Loading absent lessons..." 
                  className="py-8"
                />
              }
              customEmptyState={
                !isLoading && data.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No absent lessons found</span>
                  </div>
                ) : undefined
              }
            />
            
            {/* Server-side Pagination Controls */}
            {totalRows > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, totalRows)} of {totalRows} lessons
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

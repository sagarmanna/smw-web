"use client";

import { useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { groupLessonColumns, GroupLessonData } from "../../../../[id]/studentTabConfigs";
import { ColumnDef } from "@tanstack/react-table";
import { fetchGroupLessonsData } from "../../../../[id]/studentTabs.slice";
import { GroupLessonGroup } from "../../../../[id]/students-details-tabs.api";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface GroupLessonsTabProps {
  location: string;
  studentId: string;
}

interface GroupedGroupLessonData extends GroupLessonData {
  id: number;
  url: string;
  isFirstInGroup?: boolean;
  groupRowSpan?: number;
}

// Flatten grouped API data for table display (use ALL data as-is from API)
const flattenGroupedData = (groups: GroupLessonGroup[]): GroupedGroupLessonData[] => {
  if (!groups?.length) return [];

  const rows: GroupedGroupLessonData[] = [];
  
  groups.forEach((group) => {
    const lessons = group.lessons || [];
    lessons.forEach((lesson, index) => {
      rows.push({
        id: lesson.id, 
        dueDate: group.dueDate,
        programName: lesson.programName, 
        date: lesson.date, 
        duration: lesson.duration, 
        status: lesson.status, 
        price: lesson.price, 
        owing: lesson.owing, 
        online: lesson.isOnline, 
        url: lesson.url, 
        isFirstInGroup: index === 0, 
        groupRowSpan: lessons.length,
      });
    });
  });

  return rows;
};

export function GroupLessonsTab({ location, studentId }: GroupLessonsTabProps) {
  const dispatch = useAppDispatch();
  
  // Read data from Redux state (no API call here - handled by parent)
  const data = useAppSelector((state) => state.studentTabs.groupLessonData);
  const pagination = useAppSelector((state) => state.studentTabs.groupLessonPagination);
  const isLoading = useAppSelector((state) => state.studentTabs.groupLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.groupLessonError);
  
  // Flatten grouped data from API for table display
  const flattenedData = useMemo(() => flattenGroupedData(data), [data]);
  
  // Use page from API response for display (synced with actual data)
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10; // Use limit from API response

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isLoading) {
      const newPage = currentPage - 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchGroupLessonsData({ location, studentId, page: newPage }));
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && !isLoading) {
      const newPage = currentPage + 1;
      // Fetch data for the new page (only page parameter, no limit)
      dispatch(fetchGroupLessonsData({ location, studentId, page: newPage }));
    }
  };

  const handleRowClick = useCallback(
    (row: GroupedGroupLessonData) => {
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      // Use the lesson ID to redirect to the lesson view page
      if (row.id) {
        const url = `${legacyBase}/${location}/lesson/view?id=${row.id}`;
        window.location.href = url;
      }
    },
    [location]
  );

  // Create custom columns with grouped due date
  const columnsWithGrouping = useMemo(() => {
    return groupLessonColumns.map((column, index) => {
      // Type-safe way to get accessorKey
      const columnDef = column as ColumnDef<GroupLessonData>;
      const columnId = 'accessorKey' in columnDef && typeof columnDef.accessorKey === 'string' 
        ? columnDef.accessorKey 
        : 'id' in columnDef && typeof columnDef.id === 'string'
        ? columnDef.id
        : `col-${index}`;
      
      // Customize Due Date column - show due date on every row (no empty grouped rows)
      if (columnId === "dueDate") {
        return {
          ...column,
          cell: ({ row }) => {
            const original = row.original as GroupedGroupLessonData;
            return (
              <div className="font-medium text-foreground">
                {original.dueDate}
              </div>
            );
          },
        } as ColumnDef<GroupedGroupLessonData>;
      }
      
      return column as ColumnDef<GroupedGroupLessonData>;
    });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Group Lessons</CardTitle>
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
              data={flattenedData as GroupedGroupLessonData[]}
              columns={columnsWithGrouping}
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
                  text="Loading group lessons..." 
                  className="py-8"
                />
              }
              customEmptyState={
                !isLoading && flattenedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No group lessons found</span>
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

"use client";

import { useState, useMemo, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { groupLessonColumns, GroupLessonData } from "../../../../[id]/studentTabConfigs";
import { ColumnDef } from "@tanstack/react-table";

interface GroupLessonsTabProps {
  location: string;
  studentId: string;
}

interface GroupedGroupLessonData extends GroupLessonData {
  isFirstInGroup?: boolean;
  groupRowSpan?: number;
}

// Group lessons by due date
const buildGroupedData = (data: GroupLessonData[]): GroupedGroupLessonData[] => {
  if (!data?.length) return [];

  // Group by due date
  const grouped: Record<string, GroupLessonData[]> = {};
  data.forEach((item) => {
    const dueDate = item.dueDate || "";
    if (!grouped[dueDate]) {
      grouped[dueDate] = [];
    }
    grouped[dueDate].push(item);
  });

  // Flatten grouped data with grouping info
  const rows: GroupedGroupLessonData[] = [];
  Object.keys(grouped).forEach((dueDate) => {
    const lessons = grouped[dueDate];
    lessons.forEach((lesson, index) => {
      rows.push({
        ...lesson,
        isFirstInGroup: index === 0,
        groupRowSpan: lessons.length,
      });
    });
  });

  return rows;
};

export function GroupLessonsTab({ location, studentId }: GroupLessonsTabProps) {
  // Props are kept for future use (e.g., API calls, filtering)
  void location;
  void studentId;
  const data = useAppSelector((state) => state.studentTabs.groupLessonData);
  const isLoading = useAppSelector((state) => state.studentTabs.groupLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.groupLessonError);
  
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  // Group data by due date
  const groupedData = useMemo(() => buildGroupedData(data), [data]);
  
  // Calculate pagination on grouped data
  const totalRows = groupedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = groupedData.slice(startIndex, endIndex);
  const hasMore = endIndex < totalRows;

  const handleAdd = useCallback(() => {
    // TODO: Implement add functionality
    console.log('Add group lesson');
  }, []);

  const handleShowMore = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

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
      
      // Customize Due Date column to show grouped dates
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
              data={paginatedData as GroupedGroupLessonData[]}
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
              customEmptyState={
                !isLoading && paginatedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No group lessons found</span>
                  </div>
                ) : undefined
              }
            />
            
            {/* Pagination Controls */}
            {totalRows > 0 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                {hasMore && (
                  <Button
                    variant="link"
                    onClick={handleShowMore}
                    className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                  >
                    Show More
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
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


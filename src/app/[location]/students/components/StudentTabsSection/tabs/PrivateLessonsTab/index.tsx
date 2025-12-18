"use client";

import { useState, useMemo, useCallback } from "react";
import { useAppSelector } from "@/redux/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { privateLessonColumns, PrivateLessonData } from "../../../../[id]/studentTabConfigs";
import { ColumnDef } from "@tanstack/react-table";
import { AddLessonModal, type LessonFormData } from "./AddLessonModal";
import { PrivateLessonGroup } from "../../../../[id]/students-details-tabs.api";

interface PrivateLessonsTabProps {
  location: string;
  studentId: string;
}

interface GroupedPrivateLessonData extends PrivateLessonData {
  isFirstInGroup?: boolean;
  groupRowSpan?: number;
}

// Flatten grouped API data for table display (use data as-is from API)
const flattenGroupedData = (data: PrivateLessonGroup[]): GroupedPrivateLessonData[] => {
  if (!data?.length) return [];

  const rows: GroupedPrivateLessonData[] = [];
  data.forEach((group) => {
    group.lessons.forEach((lesson, index) => {
      rows.push({
        dueDate: group.dueDate,
        programName: lesson.programName,
        date: lesson.date,
        duration: lesson.duration,
        status: lesson.status,
        price: parseFloat(lesson.price.replace(/[$,]/g, '')) || 0, // Parse price string to number for display
        owing: parseFloat(lesson.owing.replace(/[$,]/g, '')) || 0, // Parse owing string to number for display
        online: lesson.isOnline,
        id: lesson.id,
        url: lesson.url,
        isFirstInGroup: index === 0,
        groupRowSpan: group.lessons.length,
      });
    });
  });

  return rows;
};

export function PrivateLessonsTab({ location, studentId }: PrivateLessonsTabProps) {
  const data = useAppSelector((state) => state.studentTabs.privateLessonData);
  const isLoading = useAppSelector((state) => state.studentTabs.privateLessonLoading);
  const error = useAppSelector((state) => state.studentTabs.privateLessonError);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const rowsPerPage = 10;
  
  // Flatten grouped data from API for table display 
  const groupedData = useMemo(() => flattenGroupedData(data), [data]);
  
  // Calculate pagination on grouped data
  const totalRows = groupedData.length;
  const totalPages = Math.ceil(totalRows / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = groupedData.slice(startIndex, endIndex);

  const handleAdd = useCallback(() => {
    setIsAddModalOpen(true);
  }, []);

  const handleSaveLesson = useCallback((formData: LessonFormData) => {
    // TODO: Implement save functionality - call API to create lesson
    console.log('Save lesson:', formData);
  }, []);

  // Get student name from Redux store for redirect URL
  const studentInfo = useAppSelector((state) => state.student.studentInfo);
  const studentName = studentInfo?.profile 
    ? `${studentInfo.profile.firstName} ${studentInfo.profile.lastName}`.trim()
    : '';

  const handleShowMore = () => {
    // Redirect to legacy URL with dynamic student ID and name
    
    const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
    const encodedStudentName = encodeURIComponent(studentName || '');
    const url = `${legacyBase}/${location}/lesson/index?LessonSearch[studentId]=${studentId}&LessonSearch[student]=${encodedStudentName}&LessonSearch[type]=1&LessonSearch[isSeeMore]=1`;
    window.location.href = url;
  };

  const handleRowClick = useCallback(
    (row: GroupedPrivateLessonData) => {
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      // Extract lesson ID from url field (e.g., "lesson/4302884" -> "4302884") or use id directly
      if (row.id) {
        const url = `${legacyBase}/${location}/lesson/view?id=${row.id}`;
        window.location.href = url;
      }
    },
    [location]
  );

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
    return privateLessonColumns.map((column, index) => {
      // Type-safe way to get accessorKey
      const columnDef = column as ColumnDef<PrivateLessonData>;
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
            const original = row.original as GroupedPrivateLessonData;
            return (
              <div className="font-medium text-foreground">
                {original.dueDate}
              </div>
            );
          },
        } as ColumnDef<GroupedPrivateLessonData>;
      }
      
      return column as ColumnDef<GroupedPrivateLessonData>;
    });
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Private Lessons</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
        </Button>
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
              data={paginatedData as GroupedPrivateLessonData[]}
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
              customEmptyState={
                !isLoading && paginatedData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                    <div className="text-4xl">📋</div>
                    <span className="text-sm font-medium">No private lessons found</span>
                  </div>
                ) : undefined
              }
            />
            
            {/* Pagination Controls */}
            {totalRows > 0 && (
              <div className="flex items-center justify-end gap-2 mt-4">
                <Button
                  variant="link"
                  onClick={handleShowMore}
                  className="text-blue-600 hover:text-blue-800 p-0 h-auto"
                >
                  Show More
                </Button>
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
      
      {/* Add Lesson Modal */}
      <AddLessonModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        location={location}
        studentId={studentId}
        onSave={handleSaveLesson}
      />
    </Card>
  );
}


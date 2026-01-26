"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EnrolmentLesson } from "../../types";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { groupLessonsByDueDate, GroupedEnrolmentLesson } from "./utils";

interface EnrolmentLessonsCardProps {
  lessons: EnrolmentLesson[];
  isLoading?: boolean;
  isGroupEnrolment?: boolean;
  pagination?: { page: number; limit: number; total: number; totalPages: number } | null;
  lessonsLoading?: boolean;
  lessonsError?: string | null;
  onPageChange?: (page: number, limit?: number) => void;
  // Props for "Show More" link (private enrolments only)
  studentId?: number;
  studentName?: string;
  programId?: number;
  location?: string;
  autoRenewal?: string; // "Enabled" | "Disabled" - only show "Show More" if enabled
}

export const EnrolmentLessonsCard = React.memo(function EnrolmentLessonsCard({
  lessons,
  isLoading = false,
  isGroupEnrolment = false,
  pagination,
  lessonsLoading = false,
  lessonsError,
  onPageChange,
  studentId,
  studentName,
  programId,
  location,
  autoRenewal,
}: EnrolmentLessonsCardProps) {
  // Use page from API response for display (synced with actual data) - only for group enrolments
  const currentPage = pagination?.page || 1;
  const totalPages = pagination?.totalPages || 1;
  const totalRows = pagination?.total || 0;
  const rowsPerPage = pagination?.limit || 10; // Use limit from API response

  const handlePreviousPage = React.useCallback(() => {
    if (currentPage > 1 && !lessonsLoading && onPageChange) {
      const newPage = currentPage - 1;
      onPageChange(newPage, rowsPerPage);
    }
  }, [currentPage, lessonsLoading, onPageChange, rowsPerPage]);

  const handleNextPage = React.useCallback(() => {
    if (currentPage < totalPages && !lessonsLoading && onPageChange) {
      const newPage = currentPage + 1;
      onPageChange(newPage, rowsPerPage);
    }
  }, [currentPage, totalPages, lessonsLoading, onPageChange, rowsPerPage]);

  // Handle "Show More" click for private enrolments
  const handleShowMore = React.useCallback(() => {
    if (!location || !studentId || !programId) return;
    
    const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
    const encodedStudentName = encodeURIComponent(studentName || '');
    const url = `${legacyBase}/${location}/lesson/index?LessonSearch[studentId]=${studentId}&LessonSearch[programId]=${programId}&LessonSearch[type]=1&LessonSearch[student]=${encodedStudentName}&LessonSearch[isSeeMore]=1`;
    window.location.href = url;
  }, [location, studentId, programId, studentName]);

  // Transform lessons data to include grouping metadata for visual rowspan-like behavior
  const groupedLessons = React.useMemo(() => {
    return groupLessonsByDueDate(lessons);
  }, [lessons]);

  // Handle row click to redirect to legacy lesson view
  const handleRowClick = React.useCallback(
    (row: GroupedEnrolmentLesson) => {
      // Access id property - GroupedEnrolmentLesson extends EnrolmentLesson which has optional id
      const lessonId = (row as unknown as EnrolmentLesson).id;
      if (!location || !lessonId) return;
      
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      const url = `${legacyBase}/${location}/lesson/view?id=${lessonId}`;
      window.location.href = url;
    },
    [location]
  );

  // Row className function to apply visual grouping styles using Tailwind
  // Keeps row borders for all columns except due date, allows hover on other columns
  const getRowClassName = React.useCallback((row: GroupedEnrolmentLesson) => {
    const baseClass = "cursor-pointer";
    // Check if this is NOT the last row in the group
    const isLastInGroup = row.groupIndex === row.groupRowSpan - 1;
    // Use Tailwind classes for borders
    const borderClass = isLastInGroup 
      ? "border-b border-border/50" 
      : "border-b-0 [&>td:not(:first-child)]:border-b [&>td:not(:first-child)]:border-border/50";
    // Hover effect on other columns (not first) - use arbitrary variants
    const hoverClass = "hover:[&>td:not(:first-child)]:!bg-primary/10 hover:[&>td:first-child]:!bg-transparent hover:[&>td:first-child>*]:!bg-transparent";
    return `${baseClass} ${borderClass} ${hoverClass}`;
  }, []);

  const columns = React.useMemo<ColumnDef<GroupedEnrolmentLesson>[]>(() => [
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ row, getValue }) => {
        const groupedLesson = row.original;
        // Only show due date on the first row of each group
        if (groupedLesson.isFirstInGroup) {
          // Use getValue() to access the dueDate property - this works because accessorKey is "dueDate"
          const dueDate = getValue() as string;
          const isLastInGroup = groupedLesson.groupIndex === groupedLesson.groupRowSpan - 1;
          // Add class to control border visibility - only show border on last row of group
          return (
            <div className="font-medium text-foreground pointer-events-none">
              {dueDate || "-"}
            </div>
          );
        }
        // Empty cell for subsequent rows in the group (creates rowspan-like visual effect)
        return <span className="invisible pointer-events-none" aria-hidden="true">-</span>;
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return <span className="truncate block max-w-[220px]" title={date}>{date || "-"}</span>;
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ getValue }) => {
        const duration = getValue() as string;
        return <span>{duration || "-"}</span>;
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return <span>{status || "-"}</span>;
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ getValue }) => {
        const price = getValue() as string;
        return <span>{price || "-"}</span>;
      },
    },
    {
      accessorKey: "owing",
      header: "Owing",
      cell: ({ getValue }) => {
        const owing = getValue() as string;
        return <span>{owing || "-"}</span>;
      },
    },
    {
      accessorKey: "online",
      header: "Online",
      cell: ({ getValue }) => {
        const online = getValue() as boolean;
        return <span>{online ? "Yes" : "No"}</span>;
      },
    },
  ], []);

  return (
    <SectionCard
      title="Lessons"
      isLoading={isLoading}
      className="w-full"
    >
      {lessonsError ? (
        <div 
          className="text-center py-8 text-red-500"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
        >
          <p className="font-medium" aria-label="Error message">Error loading data</p>
          <p className="text-sm" aria-label="Error details">{lessonsError}</p>
        </div>
      ) : (
        <>
          <div className="enrolment-lessons-table">
          <CustomTable
            data={groupedLessons}
            columns={columns}
            size="compact"
            variant="default"
            enableSorting={false}
            enableSearch={false}
            enableFilter={false}
            enableRowsPerPage={false}
            enablePrint={false}
            isLoading={isLoading || lessonsLoading}
            onRowClick={handleRowClick}
            rowClassName={getRowClassName}
            customLoadingState={
              <div role="status" aria-label="Loading lessons data">
                <LoadingAnimation 
                  size="md" 
                  text="Loading lessons..." 
                  className="py-8"
                />
              </div>
            }
            customEmptyState={
              !isLoading && !lessonsLoading && groupedLessons.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8"
                  role="status"
                  aria-label="No lessons found"
                >
                  <div className="text-4xl" aria-hidden="true">📋</div>
                  <span className="text-sm font-medium">No lessons found</span>
                </div>
              ) : undefined
            }
          />
          </div>
          
          {/* Show More Button - ONLY for private enrolments with auto renewal enabled */}
          {!isGroupEnrolment && 
           groupedLessons.length > 0 && 
           studentId && 
           programId && 
           location && 
           autoRenewal?.toLowerCase() === "enabled" && (
            <div className="flex items-center justify-end mt-4">
              <Button
                variant="link"
                onClick={handleShowMore}
                className="text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                Show More
              </Button>
            </div>
          )}

          {/* Server-side Pagination Controls - ONLY for group enrolments */}
          {isGroupEnrolment && totalRows > 0 && (
            <nav 
              className="flex items-center justify-between mt-4"
              aria-label="Lessons pagination"
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
                  disabled={currentPage === 1 || lessonsLoading}
                  aria-label={`Go to previous page, page ${currentPage - 1}`}
                  aria-disabled={currentPage === 1 || lessonsLoading}
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
                  disabled={currentPage >= totalPages || lessonsLoading}
                  aria-label={`Go to next page, page ${currentPage + 1}`}
                  aria-disabled={currentPage >= totalPages || lessonsLoading}
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Next page</span>
                </Button>
              </div>
            </nav>
          )}
        </>
      )}
    </SectionCard>
  );
});


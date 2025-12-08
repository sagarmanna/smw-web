"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { TabContent } from "@/components/TabContent";
import { unscheduledLessonColumns, type UnscheduledLessonData } from "../../../../teacherTabConfigs";
import { getTeacherUnscheduledLessons } from "../../../../[id]/teachers-details-tabs.api";
import { transformUnscheduledLessonData } from "../../../../utils/tabTransformers";
import { useServerPagination } from "@/hooks/useServerPagination";
import { CalendarIcon } from "lucide-react";
import { EditScheduleModal } from "./EditScheduleModal";

interface UnscheduledLessonTabProps {
  location: string;
  teacherId: number;
}

export function UnscheduledLessonTab({ location, teacherId }: UnscheduledLessonTabProps) {
  const [data, setData] = React.useState<UnscheduledLessonData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState<boolean>(false);
  const [selectedLesson, setSelectedLesson] = useState<UnscheduledLessonData | null>(null);

  const {
    pagination,
    showPagination,
    createPageChangeHandlers,
    convertLimitForApi,
    updatePaginationFromApiResponse,
    resetPaginationTotals,
  } = useServerPagination({ initialLimit: 10, minTotalForPagination: 10 });

  // Fetch unscheduled lessons data with pagination
  const fetchUnscheduledLessons = React.useCallback(
    async (page: number, limit: number) => {
      setLoading(true);
      setError(null);
      try {
        const apiLimit = convertLimitForApi(limit);
        const result = await getTeacherUnscheduledLessons(location, teacherId, page, apiLimit);
        if (result) {
          const transformedData = transformUnscheduledLessonData(result.unscheduledLessons);
          setData(transformedData);
          updatePaginationFromApiResponse(page, limit, result.pagination);
        } else {
          setData([]);
          resetPaginationTotals(page, limit);
        }
      } catch (err) {
        console.error("Error fetching unscheduled lessons:", err);
        setError("Failed to load unscheduled lessons data");
        setData([]);
        resetPaginationTotals(page, limit);
      } finally {
        setLoading(false);
      }
    },
    [location, teacherId, convertLimitForApi, updatePaginationFromApiResponse, resetPaginationTotals]
  );

  // Lazy load: Only fetch when Unscheduled Lesson tab is clicked/rendered
  // This component only mounts when the tab is active, so this effect runs on tab click
  // Also handles pagination changes
  React.useEffect(() => {
    fetchUnscheduledLessons(pagination.page, pagination.limit);
  }, [fetchUnscheduledLessons, pagination.page, pagination.limit]);

  // Refetch data when showAll checkbox changes - reset to page 1
  React.useEffect(() => {
    fetchUnscheduledLessons(1, pagination.limit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAll]);

  const handleCalendarClick = useCallback(
    (lesson: UnscheduledLessonData) => {
      setSelectedLesson(lesson);
      setScheduleModalOpen(true);
    },
    []
  );

  // Shared pagination handlers wired to the fetch function
  const { handlePageChange, handleRowsPerPageChange } = React.useMemo(
    () => createPageChangeHandlers(fetchUnscheduledLessons),
    [createPageChangeHandlers, fetchUnscheduledLessons]
  );

  // Handle modal success
  const handleEditScheduleSuccess = React.useCallback(() => {
    // Refetch data after successful edit
    fetchUnscheduledLessons(pagination.page, pagination.limit);
    setScheduleModalOpen(false);
    setSelectedLesson(null);
  }, [fetchUnscheduledLessons, pagination.page, pagination.limit]);

  // Create columns with clickable calendar icon
  const columnsWithCalendar = React.useMemo(() => {
    return unscheduledLessonColumns.map((column) => {
      if (column.id === "calendar") {
        return {
          ...column,
          cell: (info: { row: { original: UnscheduledLessonData } }) => (
            <div className="flex justify-center">
              <button
                type="button"
                
                className="hover:opacity-70 transition-opacity cursor-pointer pointer-events-auto"
                aria-label="Edit schedule"
              >
                <CalendarIcon onClick={(e) => {
                  handleCalendarClick(info.row.original);
                }} className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          ),
        };
      }
      return column;
    });
  }, [handleCalendarClick]);

  return (
    <>
      <TabContent
        title="Unscheduled Lesson"
        data={data}
        columns={columnsWithCalendar}
        hasAddButton={false}
        hasTable={true}
        emptyState="No unscheduled lessons found."
        showAllCheckbox={true}
        showAllChecked={showAll}
        onShowAllChange={setShowAll}
        loading={loading}
        error={error}
        enablePagination={showPagination}
        onRowClick={handleCalendarClick}
        serverSidePagination={showPagination ? pagination : undefined}
        onPageChange={showPagination ? handlePageChange : undefined}
        onRowsPerPageChange={showPagination ? handleRowsPerPageChange : undefined}
        rowsPerPage={pagination.limit}
        rowsPerPageOptions={[10, 20, 50, 100]}
      />

      <EditScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        location={location}
        teacherId={teacherId}
        selectedLesson={selectedLesson}
        onSuccess={handleEditScheduleSuccess}
      />
    </>
  );
}


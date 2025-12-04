"use client";

import * as React from "react";
import { useState } from "react";
import { TabContent } from "@/components/TabContent";
import { unscheduledLessonColumns } from "../../../../teacherTabConfigs";
import { getTeacherUnscheduledLessons } from "../../../../[id]/teachers-details-tabs.api";
import { transformUnscheduledLessonData } from "../../../../utils/tabTransformers";
import type { UnscheduledLessonData } from "../../../../teacherTabConfigs";

interface UnscheduledLessonTabProps {
  location: string;
  teacherId: number;
}

export function UnscheduledLessonTab({ location, teacherId }: UnscheduledLessonTabProps) {
  const [data, setData] = React.useState<UnscheduledLessonData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [pagination, setPagination] = React.useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Fetch unscheduled lessons data with pagination
  const fetchUnscheduledLessons = React.useCallback(
    async (page: number, limit: number) => {
      setLoading(true);
      setError(null);
      try {
        const result = await getTeacherUnscheduledLessons(location, teacherId, page, limit);
        if (result) {
          const transformedData = transformUnscheduledLessonData(result.unscheduledLessons);
          setData(transformedData);
          setPagination(result.pagination);
        } else {
          setData([]);
          setPagination((prev) => ({
            ...prev,
            total: 0,
            totalPages: 0,
          }));
        }
      } catch (err) {
        console.error("Error fetching unscheduled lessons:", err);
        setError("Failed to load unscheduled lessons data");
        setData([]);
        setPagination((prev) => ({
          ...prev,
          total: 0,
          totalPages: 0,
        }));
      } finally {
        setLoading(false);
      }
    },
    [location, teacherId]
  );

  // Lazy load: Only fetch when Unscheduled Lesson tab is clicked/rendered
  // This component only mounts when the tab is active, so this effect runs on tab click
  React.useEffect(() => {
    fetchUnscheduledLessons(1, 10);
  }, [fetchUnscheduledLessons]);

  // Handle page change
  const handlePageChange = React.useCallback(
    (page: number) => {
      fetchUnscheduledLessons(page, pagination.limit);
    },
    [fetchUnscheduledLessons, pagination.limit]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = React.useCallback(
    (rowsPerPage: number) => {
      fetchUnscheduledLessons(1, rowsPerPage);
    },
    [fetchUnscheduledLessons]
  );

  // Only show pagination if total > 10
  const showPagination = pagination.total > 10;

  return (
    <TabContent
      title="Unscheduled Lesson"
      data={data}
      columns={unscheduledLessonColumns}
      hasAddButton={false}
      hasTable={true}
      emptyState="No unscheduled lessons found."
      showAllCheckbox={true}
      showAllChecked={showAll}
      onShowAllChange={setShowAll}
      loading={loading}
      error={error}
      enablePagination={showPagination}
      serverSidePagination={showPagination ? pagination : undefined}
      onPageChange={showPagination ? handlePageChange : undefined}
      onRowsPerPageChange={showPagination ? handleRowsPerPageChange : undefined}
      rowsPerPage={pagination.limit}
      rowsPerPageOptions={[10, 20, 50, 100]}
    />
  );
}


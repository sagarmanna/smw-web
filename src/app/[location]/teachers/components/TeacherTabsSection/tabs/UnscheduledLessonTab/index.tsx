"use client";

import * as React from "react";
import { useState } from "react";
import { TabContent } from "@/components/TabContent";
import { unscheduledLessonColumns } from "../../../../teacherTabConfigs";
import { getTeacherUnscheduledLessons } from "../../../../[id]/teachers-details-tabs.api";
import { transformUnscheduledLessonData } from "../../../../utils/tabTransformers";
import type { UnscheduledLessonData } from "../../../../teacherTabConfigs";
import { useServerPagination } from "@/hooks/useServerPagination";

interface UnscheduledLessonTabProps {
  location: string;
  teacherId: number;
}

export function UnscheduledLessonTab({ location, teacherId }: UnscheduledLessonTabProps) {
  const [data, setData] = React.useState<UnscheduledLessonData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const showAllRef = React.useRef(showAll);

  // Keep ref in sync with state
  React.useEffect(() => {
    showAllRef.current = showAll;
  }, [showAll]);

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
        const result = await getTeacherUnscheduledLessons(location, teacherId, page, apiLimit, showAllRef.current);
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

  // Shared pagination handlers wired to the fetch function
  const { handlePageChange, handleRowsPerPageChange } = React.useMemo(
    () => createPageChangeHandlers(fetchUnscheduledLessons),
    [createPageChangeHandlers, fetchUnscheduledLessons]
  );

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


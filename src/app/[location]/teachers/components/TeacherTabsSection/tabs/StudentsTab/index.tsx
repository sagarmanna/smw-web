"use client";

import * as React from "react";
import { TabContent } from "@/components/TabContent";
import { teacherStudentColumns } from "../../../../teacherTabConfigs";
import { getTeacherStudents } from "../../../../[id]/teachers-details-tabs.api";
import type { TeacherStudentData } from "../../../../teacherTabConfigs";
import { useServerPagination } from "@/hooks/useServerPagination";

interface StudentsTabProps {
  location: string;
  teacherId: number;
}

export function StudentsTab({ location, teacherId }: StudentsTabProps) {
  const [studentData, setStudentData] = React.useState<TeacherStudentData[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const {
    pagination,
    showPagination,
    createPageChangeHandlers,
    convertLimitForApi,
    updatePaginationFromApiResponse,
    resetPaginationTotals,
  } = useServerPagination({ initialLimit: 10, minTotalForPagination: 10 });

  // Fetch students data with pagination
  const fetchStudents = React.useCallback(
      async (page: number, limit: number) => {
      setLoading(true);
      setError(null);
      try {
        const apiLimit = convertLimitForApi(limit);
        const result = await getTeacherStudents(location, teacherId, page, apiLimit);
        if (result) {
      // Transform API data: id (number) -> id (string), fullName -> studentName
          const transformedData: TeacherStudentData[] = result.students.map((item) => ({
        id: item.id.toString(),
        studentName: item.fullName,
      }));
          setStudentData(transformedData);
          updatePaginationFromApiResponse(page, limit, result.pagination);
        } else {
          setStudentData([]);
          resetPaginationTotals(page, limit);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students data");
        setStudentData([]);
        resetPaginationTotals(page, limit);
      } finally {
        setLoading(false);
      }
    },
    [location, teacherId, convertLimitForApi, updatePaginationFromApiResponse, resetPaginationTotals]
  );

  // Lazy load: Only fetch when Students tab is clicked/rendered
  // This component only mounts when the tab is active, so this effect runs on tab click
  React.useEffect(() => {
    fetchStudents(1, 10);
  }, [fetchStudents]);

  // Shared pagination handlers wired to the fetch function
  const { handlePageChange, handleRowsPerPageChange } = React.useMemo(
    () => createPageChangeHandlers(fetchStudents),
    [createPageChangeHandlers, fetchStudents]
  );

  // Handle row click - navigate to legacy student detail page
  const handleRowClick = React.useCallback(
    (row: TeacherStudentData) => {
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      const url = `${legacyBase}/${location}/student/view?id=${row.id}`;
      window.location.href = url;
    },
    [location]
  );

  return (
    <TabContent
      title="Students"
      data={studentData}
      columns={teacherStudentColumns}
      hasAddButton={false}
      hasTable={true}
      emptyState="No students found."
      loading={loading}
      error={error}
      enablePagination={showPagination}
      serverSidePagination={showPagination ? pagination : undefined}
      onPageChange={showPagination ? handlePageChange : undefined}
      onRowsPerPageChange={showPagination ? handleRowsPerPageChange : undefined}
      rowsPerPage={pagination.limit}
      rowsPerPageOptions={[10, 20, 50, 100]}
      onRowClick={handleRowClick}
      rowClassName="cursor-pointer"
    />
  );
}

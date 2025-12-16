"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { GroupCourseRow } from "./groupCourses.api";
import { groupCourseColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useGroupCourseListing } from "./hooks/useGroupCourseListing";
import { formatLocationName } from "@/utils/textUtils";

interface GroupCoursesClientProps {
  location: string;
}

export function GroupCoursesListingClient({ location }: GroupCoursesClientProps) {
  const router = useRouter();
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = React.useState(false);

  const columns = React.useMemo<ColumnDef<GroupCourseRow>[]>(() => groupCourseColumns, []);

  const {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    sorting,
    setSorting,
    page,
    setPage,
    pageSize,
    setPageSize,
    columnFilters,
    activeFilter,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleServerSideFilterChange,
  } = useGroupCourseListing(location);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<GroupCourseRow>({
    reportTitle: `Group Courses list for ${formatLocationName(location)}`,
    columns,
    data: rows,
    location: location, // Pass location for PDF header
  });

  const { handlePrint } = usePrintReport<GroupCourseRow>();

  if (error) {
    return (
      <ReportPageLayout
        title="Group Courses"
        subtitle="Browse all group courses, search and sort"
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
      >
        <div />
      </ReportPageLayout>
    );
  }

  return (
    <ReportPageLayout
      title="Group Courses"
      subtitle="Browse all group courses, search and sort"
      isLoading={isLoading}
      error={null}
      onRetry={fetchData}
      actions={
        <Button 
          onClick={() => setIsAddCourseModalOpen(true)} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group Course
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}

        // Visual configuration
        size="compact"
        variant="default"
        stickyHeader={true}

        // Features
        enableSearch={false}
        searchPlaceholder="Search group courses..."
        getSearchValue={(r) => `${r.course} ${r.teacher} ${r.program || ''}`}
        enableFilter={true}
        enableRowsPerPage={true}
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: `Group Courses list for ${formatLocationName(location)}`,
          columns,
          data: rows,
        })}
        enableColumnFilters={false}

        // Sorting and pagination (server-side)
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => {
          setSorting(s);
          setPage(1);
        }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        serverSideFilterOptions={[
          { key: "active", label: "Active" },
          { key: "inactive", label: "Inactive" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleServerSideFilterChange}
        defaultFilterLabel="All Group Courses"
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        enableExport={true}
        onExport={{
          html: exportToHtml,
          csv: exportToCsv,
          text: exportToText,
          excel: exportToExcel,
          pdf: exportToPdf,
          json: exportToJson,
        }}
        onRowsPerPageChange={(newSize) => { setPageSize(newSize); setPage(1); }}
        onRowClick={(row: GroupCourseRow) => {
          // Navigate to course detail page when implemented
          // router.push(`/${location}/group-courses/${row.id}`);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      />
      
      {/* Add Course Modal - to be implemented */}
      {isAddCourseModalOpen && (
        <div>
          {/* Modal implementation will go here */}
        </div>
      )}
    </ReportPageLayout>
  );
}


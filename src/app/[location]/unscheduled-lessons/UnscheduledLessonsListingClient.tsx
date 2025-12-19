"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { UnscheduledLessonRow } from "./unscheduledLessonsListing.api";
import { unscheduledLessonColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useUnscheduledLessonsListing } from "./hooks/useUnscheduledLessonsListing";
import { formatLocationName } from "@/utils/textUtils";

interface UnscheduledLessonsListingClientProps {
  location: string;
}

export function UnscheduledLessonsListingClient({ location }: UnscheduledLessonsListingClientProps) {

  const {
    rows,
    total,
    totalPages,
    isLoading,
    error,
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
  } = useUnscheduledLessonsListing(location);

  // Create export-specific columns
  const exportColumns = React.useMemo((): ColumnDef<UnscheduledLessonRow>[] => {
    return [
      {
        accessorKey: "student",
        header: "Student",
        meta: { printable: true, printableName: "Student" },
      },
      {
        accessorKey: "program",
        header: "Program",
        meta: { printable: true, printableName: "Program" },
      },
      {
        accessorKey: "teacher",
        header: "Teacher",
        meta: { printable: true, printableName: "Teacher" },
      },
      {
        accessorKey: "duration",
        header: "Duration",
        meta: { printable: true, printableName: "Duration" },
      },
      {
        accessorKey: "date",
        header: "Date",
        meta: { printable: true, printableName: "Date" },
      },
      {
        accessorKey: "expiryDate",
        header: "Expiry Date",
        meta: { printable: true, printableName: "Expiry Date" },
      },
    ];
  }, []);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<UnscheduledLessonRow>({
    reportTitle: `Unscheduled Lessons list for ${formatLocationName(location)}`,
    columns: exportColumns,
    data: rows,
    location: location, // Pass location for PDF header
  });

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 mt-2 md:mt-8 lg:mt-2">
          <ReportPageLayout
            title="Unscheduled Lessons"
            subtitle="Browse all unscheduled lessons and search"
            isLoading={isLoading}
            error={error}
            onRetry={fetchData}
          >
            <div />
          </ReportPageLayout>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Content Area */}
      <div className="flex-1 mt-2 md:mt-8 lg:mt-2">
        <ReportPageLayout
          title="Unscheduled Lessons"
          subtitle="Browse all unscheduled lessons and search"
          isLoading={isLoading}
          error={null}
          onRetry={fetchData}
        >
          <CustomTable
            data={rows}
            columns={unscheduledLessonColumns}
            isLoading={isLoading}

            // Visual configuration
            size="compact"
            variant="default"
            stickyHeader={true}

            // Features
            enableSearch={false}
            enableFilter={true}
            serverSideFilterOptions={[
              { key: "active", label: "Active" },
              { key: "inactive", label: "Inactive" },
            ]}
            activeServerSideFilter={activeFilter}
            onServerSideFilterChange={handleServerSideFilterChange}
            defaultFilterLabel="All Unscheduled Lessons"
            enablePrint={false}
            enableRowsPerPage={true}
            enableColumnFilters={true}
            onColumnFilterChange={handleColumnFilterChange}
            onColumnFilterEnter={handleColumnFilterEnter}
            columnFilters={columnFilters}
            columnFilterPlaceholders={{
              student: "Enter student name",
              program: "Enter program name",
              teacher: "Enter teacher name",
            }}

            // Pagination (server-side)
            serverSidePagination={{ page, limit: pageSize, total, totalPages }}
            onServerSidePageChange={(newPage) => setPage(newPage)}
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
          />
        </ReportPageLayout>
      </div>
    </div>
  );
}


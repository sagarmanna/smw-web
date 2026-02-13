"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { PrivateLessonRow } from "./privateLessonsListing.api";
import { privateLessonColumns, exportColumns, createCheckboxColumn } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrivateLessonsListing } from "./hooks/usePrivateLessonsListing";
import { usePrivateLessonsSelection } from "./hooks/usePrivateLessonsSelection";
import { usePrivateLessonsModals } from "./hooks/usePrivateLessonsModals";
import { usePrivateLessonsHandlers } from "./hooks/usePrivateLessonsHandlers";
import { formatLocationName } from "@/utils/textUtils";
import { PrivateLessonsToolbar } from "./components/PrivateLessonsToolbar";
import { PrivateLessonsModals } from "./components/PrivateLessonsModals";

interface PrivateLessonsListingClientProps {
  location: string;
}

export function PrivateLessonsListingClient({ location }: PrivateLessonsListingClientProps) {
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
  } = usePrivateLessonsListing(location);

  const selection = usePrivateLessonsSelection({ rows });
  const modalState = usePrivateLessonsModals();
  const handlers = usePrivateLessonsHandlers({
    location,
    selectedLessons: selection.selectedLessons,
    hasSelectedLessons: selection.hasSelectedLessons,
    clearSelection: selection.clearSelection,
    modalState,
  });

  // Add checkbox column to columns
  const columns = React.useMemo<ColumnDef<PrivateLessonRow>[]>(() => {
    const checkboxColumn = createCheckboxColumn(
      rows,
      selection.selectedRows,
      selection.setSelectedRows,
      selection.clearSelection
    );

    return [checkboxColumn, ...privateLessonColumns] as ColumnDef<PrivateLessonRow>[];
  }, [rows, selection.selectedRows, selection.setSelectedRows, selection.clearSelection]);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<PrivateLessonRow>({
    reportTitle: `Private Lessons list for ${formatLocationName(location)}`,
    columns: exportColumns,
    data: rows,
    location: location,
  });

  return (
    <>
      <ReportPageLayout
        title="Private Lessons"
        subtitle="Browse all private lessons, search and sort"
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
      >
        <CustomTable
          data={rows}
          columns={columns}
          isLoading={isLoading}
          size="compact"
          variant="default"
          stickyHeader={true}
          enableSearch={false}
          searchPlaceholder="Search private lessons..."
          getSearchValue={(r) => `${r.student} ${r.program} ${r.teacher}`}
          enableFilter={true}
          enablePrint={false}
          enableExport={true}
          enableRowsPerPage={true}
          customHeaderComponent={
            <PrivateLessonsToolbar
              hasSelection={selection.hasSelectedLessons}
              onSubstituteTeacherClick={handlers.handleSubstituteTeacherClick}
              onEditDiscountClick={handlers.handleEditDiscountClick}
              onEditDurationClick={handlers.handleEditDurationClick}
              onDeleteClick={handlers.handleDeleteClick}
              onEditClassroomClick={handlers.handleEditClassroomClick}
              onEditOnlineTypeClick={handlers.handleEditOnlineTypeClick}
              onEmailSelectedClick={handlers.handleEmailSelectedClick}
              onUnscheduleClick={handlers.handleUnscheduleClick}
              onBulkRescheduleClick={handlers.handleBulkRescheduleClick}
              onGenerateInvoiceClick={handlers.handleGenerateInvoiceClick}
            />
          }
          onExport={{
            csv: exportToCsv,
            excel: exportToExcel,
            pdf: exportToPdf,
            html: exportToHtml,
            text: exportToText,
            json: exportToJson,
          }}
          serverSideFilterOptions={[
            { key: "show past lessons", label: "Show Past Lessons" },
          ]}
          activeServerSideFilter={activeFilter}
          onServerSideFilterChange={handleServerSideFilterChange}
          defaultFilterLabel="All Private Lessons"
          enableColumnFilters={true}
          onColumnFilterChange={handleColumnFilterChange}
          onColumnFilterEnter={handleColumnFilterEnter}
          columnFilters={columnFilters}
          columnFilterPlaceholders={{
            date: "Select date range",
            student: "Enter student name",
            program: "Enter program name",
            teacher: "Enter teacher name",
            online: "Select online status",
            status: "Select status",
            payment: "Select payment status",
          }}
          manualSorting={true}
          sorting={sorting}
          onSortingChange={(s) => {
            setSorting(s);
          }}
          serverSidePagination={{ page, limit: pageSize, total, totalPages }}
          onServerSidePageChange={(newPage) => setPage(newPage)}
          hideRecordCount={true}
          showRecordCountInToolbar={true}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50, 100, 200]}
          onRowsPerPageChange={(newSize) => { setPageSize(newSize); }}
          onRowClick={handlers.handleRowClick}
          rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        />
      </ReportPageLayout>

      <PrivateLessonsModals
        location={location}
        selectedLessons={selection.selectedLessons}
        previousDiscountData={selection.previousDiscountData}
        modalState={modalState}
        saveHandlers={handlers}
        isDeleteInProgress={handlers.isDeleteInProgress}
      />
    </>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { StudentRow } from "./students.api";
import { studentColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useStudentListing } from "./hooks/useStudentListing";

interface StudentsListingClientProps {
  location: string;
}

export function StudentsListingClient({ location }: StudentsListingClientProps) {
  const router = useRouter();

  const columns = React.useMemo<ColumnDef<StudentRow>[]>(() => studentColumns, []);

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
  } = useStudentListing(location);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<StudentRow>({
    reportTitle: "Students List",
    columns,
    data: rows,
    location: location,
  });

  const { handlePrint } = usePrintReport<StudentRow>();

  if (error) {
    return (
      <ReportPageLayout
        title="Students"
        subtitle="Browse all students, search and sort"
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
      title="Students"
      subtitle="Browse all students, search and sort"
      isLoading={isLoading}
      error={null}
      onRetry={fetchData}
      actions={
        <Button 
          onClick={() => {
            // TODO: Add student modal
            console.log("Add student clicked");
          }} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Student
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
        searchPlaceholder="Search students..."
        getSearchValue={(r) => `${r.firstName} ${r.lastName} ${r.customer} ${r.phoneNumber}`}
        enableFilter={true}
        enableRowsPerPage={true}
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Students Report',
          columns,
          data: rows,
          location,
        })}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          firstName: "Enter first name",
          lastName: "Enter last name",
          customer: "Enter customer name",
          phoneNumber: "Enter phone number",
        }}

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
        defaultFilterLabel="All Students"
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
        onRowClick={(row: StudentRow) => {
          router.push(`/${location}/students/${row.userId}`);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      />
    </ReportPageLayout>
  );
}

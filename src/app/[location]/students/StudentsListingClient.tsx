"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { StudentRow } from "./studentsListing.api";
import { studentColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { useStudentListing } from "./hooks/useStudentListing";
import { formatLocationName } from "@/utils/textUtils";
import {
  calculateMaxEmailCount,
  createEmailColumns,
  transformRowWithEmails,
  type ExportRowWithEmails,
} from "./utils/emailExportUtils";

interface StudentsListingClientProps {
  location: string;
}

// Type for export data with dynamic email columns
interface ExportStudentRow extends Omit<StudentRow, 'allEmails'>, ExportRowWithEmails {}

export function StudentsListingClient({ location }: StudentsListingClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

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
    resetColumnFilters,
  } = useStudentListing(location);

  // Handle resetSearch parameter from URL (similar to schedule page's resetDate)
  React.useEffect(() => {
    const resetSearch = searchParams.get('resetSearch');
    
    if (resetSearch === 'true') {
      // Reset column filters to empty object (clears all search inputs)
      resetColumnFilters();
      
      // Clean up URL parameter after processing
      router.replace(`/${location}/students`);
    }
  }, [searchParams, router, location, resetColumnFilters]);

  // Create export-specific columns with separate email columns
  const exportColumns = React.useMemo((): ColumnDef<ExportStudentRow>[] => {
    const baseColumns: ColumnDef<ExportStudentRow>[] = [
      {
        accessorKey: "firstName",
        header: "First Name",
        meta: { printable: true, printableName: "First Name" },
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        meta: { printable: true, printableName: "Last Name" },
      },
      {
        accessorKey: "customerName",
        header: "Customer",
        meta: { printable: true, printableName: "Customer" },
      },
      {
        accessorKey: "phoneNumber",
        header: "Phone",
        meta: { printable: true, printableName: "Phone" },
      },
    ];

    // Calculate max email count and create email columns
    const maxEmailCount = calculateMaxEmailCount(rows);
    const emailColumns = createEmailColumns<ExportStudentRow>(maxEmailCount);

    return [...baseColumns, ...emailColumns];
  }, [rows]);

  // Transform data for export with separate email columns
  const exportData = React.useMemo((): ExportStudentRow[] => {
    return rows.map((row) => {
      const baseRow = {
        id: row.id,
        isActive: row.isActive,
        firstName: row.firstName,
        lastName: row.lastName,
        customerName: row.customerName,
        phoneNumber: row.phoneNumber,
        email: row.email,
      };

      return transformRowWithEmails<StudentRow, ExportStudentRow>(row, baseRow);
    });
  }, [rows]);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<ExportStudentRow>({
    reportTitle: `Student list for ${formatLocationName(location)}`,
    columns: exportColumns,
    data: exportData,
    location: location, // Pass location for PDF header
  });

  const { handlePrint } = usePrintReport<ExportStudentRow>();

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
        getSearchValue={(r) => `${r.firstName} ${r.lastName} ${r.customerName} ${r.phoneNumber}`}
        enableFilter={true}
        enableRowsPerPage={true}
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: `Student's list for ${formatLocationName(location)}`,
          columns: exportColumns,
          data: exportData,
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
          router.push(`/${location}/students/${row.id}`);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      />
    </ReportPageLayout>
  );
}

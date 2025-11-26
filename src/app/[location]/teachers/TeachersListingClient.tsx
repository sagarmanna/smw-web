"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { TeacherRow } from "./teachers.api";
import { teacherColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { usePrintReport } from "@/hooks/usePrintReport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTeacherModal } from "./components/modals/AddTeacherModal";
import { useTeacherListing } from "./hooks/useTeacherListing";

interface TeachersClientProps {
  location: string;
}

export function TeachersListingClient({ location }: TeachersClientProps) {
  const router = useRouter();
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = React.useState(false);

  const columns = React.useMemo<ColumnDef<TeacherRow>[]>(() => teacherColumns, []);

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
  } = useTeacherListing(location);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<TeacherRow>({
    reportTitle: "Teachers List",
    columns,
    data: rows,
    location: location, // Pass location for PDF header
  });

  const { handlePrint } = usePrintReport<TeacherRow>();

    // Show full-page loading animation while fetching data
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[600px]">
          <LoadingAnimation 
            size="xl" 
            text="Loading teachers data..." 
            className="text-center"
          />
        </div>  
      );
    }

  if (error) {
    return (
      <ReportPageLayout
        title="Teachers"
        subtitle="Browse all teachers, search and sort"
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
      title="Teachers"
      subtitle="Browse all teachers, search and sort"
      isLoading={isLoading}
      error={null}
      onRetry={fetchData}
      actions={
        <Button 
          onClick={() => setIsAddTeacherModalOpen(true)} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}

        // Visual configuration
        size="compact"
        variant="default"
        stickyHeader={true}

        // Features
        enableSearch={false}
        searchPlaceholder="Search teachers..."
        getSearchValue={(r) => `${r.firstName} ${r.lastName} ${r.email} ${r.phoneNumber}`}
        enableFilter={true}
        enableRowsPerPage={true}
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: 'Teachers Report',
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
          email: "Enter email address",
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
          { key: "inactive", label: "Show Inactive Teachers" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleServerSideFilterChange}
        defaultFilterLabel="All Teachers"
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
        onRowClick={(row) => {
          router.push(`/${location}/teachers/${row.userId}`);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      />
      
      <AddTeacherModal
        isOpen={isAddTeacherModalOpen}
        onClose={() => setIsAddTeacherModalOpen(false)}
        onSuccess={() => {
          // Refresh the data after successful teacher creation
          fetchData();
        }}
      />
    </ReportPageLayout>
  );
}

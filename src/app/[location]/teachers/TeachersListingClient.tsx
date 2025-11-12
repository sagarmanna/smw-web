"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { TeacherRow, mockTeachersData } from "./teachers.api";
import { teacherColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { usePrintReport } from "@/hooks/usePrintReport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddTeacherModal } from "./components/AddTeacherModal";

interface TeachersClientProps {
  location: string;
}

export function TeachersListingClient({ location }: TeachersClientProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState<TeacherRow[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [totalPages, setTotalPages] = React.useState<number>(0);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(20);
  // Column filter state for individual column filters
  const [columnFilters, setColumnFilters] = React.useState<Record<string, unknown>>({});
  // Modal state
  const [isAddTeacherModalOpen, setIsAddTeacherModalOpen] = React.useState(false);
  // Server-side style filter state
  const [activeFilter, setActiveFilter] = React.useState<string | undefined>(undefined);
  // Using client-side search via CustomTable; no separate server search state for now

  const columns = React.useMemo<ColumnDef<TeacherRow>[]>(() => teacherColumns, []);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Since API is not ready, use mock data with client-side filtering and sorting
      let filteredData = [...mockTeachersData];
      
      // Apply server-side like filters
      if (activeFilter === "inactive") {
        filteredData = filteredData.filter((teacher) => teacher.status === "inactive");
      }

      // Apply column filters
      if (columnFilters.firstName) {
        filteredData = filteredData.filter(teacher => 
          teacher.firstName.toLowerCase().includes((columnFilters.firstName as string).toLowerCase())
        );
      }
      if (columnFilters.lastName) {
        filteredData = filteredData.filter(teacher => 
          teacher.lastName.toLowerCase().includes((columnFilters.lastName as string).toLowerCase())
        );
      }
      if (columnFilters.email) {
        filteredData = filteredData.filter(teacher => 
          teacher.email.toLowerCase().includes((columnFilters.email as string).toLowerCase())
        );
      }
      if (columnFilters.phone) {
        filteredData = filteredData.filter(teacher => 
          teacher.phone.toLowerCase().includes((columnFilters.phone as string).toLowerCase())
        );
      }
      
      // Apply sorting
      const sortBy = sorting[0]?.id as 'firstName' | 'lastName' | 'email' | 'phone' | undefined;
      const sortDir = sorting[0]?.desc ? "desc" : "asc";
      
      if (sortBy) {
        filteredData.sort((a, b) => {
          const aValue = a[sortBy] || '';
          const bValue = b[sortBy] || '';
          const comparison = aValue.localeCompare(bValue);
          return sortDir === 'desc' ? -comparison : comparison;
        });
      }
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      setRows(paginatedData);
      setTotal(filteredData.length);
      setTotalPages(Math.ceil(filteredData.length / pageSize));
      
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load teachers");
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, sorting, columnFilters, activeFilter]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle column filter changes
  const handleColumnFilterChange = React.useCallback(async (columnKey: string, filterValue: unknown) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: filterValue
    }));
    setPage(1); // Reset to first page when filtering
  }, []);

  // Handle Enter key press in text filters to trigger refresh
  const handleColumnFilterEnter = React.useCallback(async () => {
    // Trigger refresh when Enter is pressed in text inputs
    setPage(1);
    fetchData();
  }, [fetchData]);

  const handleServerSideFilterChange = React.useCallback((filterKey: string | undefined) => {
    setActiveFilter(filterKey);
    setPage(1);
  }, []);

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
        getSearchValue={(r) => `${r.firstName} ${r.lastName} ${r.email} ${r.phone}`}
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
          phone: "Enter phone number",
        }}

        // Sorting and pagination (server-side)
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => { setSorting(s); setPage(1); }}
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
          router.push(`/${location}/teachers/${row.id}`);
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

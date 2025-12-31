"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { AdministratorRow } from "./administrators.api";
import { administratorColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useAdministratorListing } from "./hooks/useAdministratorListing";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatLocationName } from "@/utils/textUtils";
import { AddAdministratorModal } from "./components/modals/AddAdministratorModal";

interface AdministratorsListingClientProps {
  location: string;
}

export function AdministratorsListingClient({ location }: AdministratorsListingClientProps) {
  const router = useRouter();
  const [isAddAdministratorModalOpen, setIsAddAdministratorModalOpen] = React.useState(false);
  const columns = React.useMemo<ColumnDef<AdministratorRow>[]>(() => administratorColumns, []);

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
    sorting,
    setSorting,
    columnFilters,
    activeFilter,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleServerSideFilterChange,
  } = useAdministratorListing(location);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<AdministratorRow>({
    reportTitle: `Administrators list for ${formatLocationName(location)}`,
    columns,
    data: rows,
    location: location,
  });

  const { handlePrint } = usePrintReport<AdministratorRow>();

  return (
    <ReportPageLayout
      title="Administrators"
      subtitle="Manage system administrators"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button 
          onClick={() => setIsAddAdministratorModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Administrator
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        size="compact"
        variant="default"
        stickyHeader={true}
        enableSearch={false}
        enableFilter={true}
        enablePrint={true}
        onPrint={() => handlePrint({
          reportTitle: `Administrators list for ${formatLocationName(location)}`,
          columns,
          data: rows,
        })}
        enableRowsPerPage={true}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          firstName: "Enter first name",
          lastName: "Enter last name",
          email: "Enter email address",
        }}
        sorting={sorting}
        onSortingChange={setSorting}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        serverSideFilterOptions={[
          { key: "active", label: "Active" },
          { key: "inactive", label: "Inactive" },
        ]}
        activeServerSideFilter={activeFilter}
        onServerSideFilterChange={handleServerSideFilterChange}
        defaultFilterLabel="All Administrators"
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
        onRowsPerPageChange={(newSize) => { 
          setPageSize(newSize); 
          setPage(1); 
        }}
        onRowClick={(row: AdministratorRow) => {
          router.push(`/${location}/administrators/${row.id}`);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      />
      
      <AddAdministratorModal
        isOpen={isAddAdministratorModalOpen}
        onClose={() => setIsAddAdministratorModalOpen(false)}
        onSuccess={() => {
          // Refresh the data after successful administrator creation
          fetchData();
        }}
        location={location}
      />
    </ReportPageLayout>
  );
}


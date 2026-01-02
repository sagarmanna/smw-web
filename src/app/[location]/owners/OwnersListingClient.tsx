"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { formatLocationName } from "@/utils/textUtils";

import { OwnerRow } from "./owners.api";
import { ownerColumns } from "./tableConfigs";
import { useOwnerListing } from "./hooks/useOwnerListing";
import { AddOwnerModal } from "./components/modals/AddOwnerModal";

interface OwnersListingClientProps {
  location: string;
}

export function OwnersListingClient({ location }: OwnersListingClientProps) {
  const [isAddOwnerModalOpen, setIsAddOwnerModalOpen] = React.useState(false);
  const columns = React.useMemo<ColumnDef<OwnerRow>[]>(() => ownerColumns, []);

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
  } = useOwnerListing(location);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<OwnerRow>({
    reportTitle: `Owners list for ${formatLocationName(location)}`,
    columns,
    data: rows,
    location: location,
  });

  const { handlePrint } = usePrintReport<OwnerRow>();

  return (
    <ReportPageLayout
      title="Owners"
      subtitle="Manage owners"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={() => setIsAddOwnerModalOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Owner
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
        onPrint={() =>
          handlePrint({
            reportTitle: `Owners list for ${formatLocationName(location)}`,
            columns,
            data: rows,
          })
        }
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
        defaultFilterLabel="All Owners"
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
      />

      <AddOwnerModal
        isOpen={isAddOwnerModalOpen}
        onClose={() => setIsAddOwnerModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
      />
    </ReportPageLayout>
  );
}


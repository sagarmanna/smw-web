"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { StaffMemberRow } from "./staffMembers.api";
import { staffMemberColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useStaffMemberListing } from "./hooks/useStaffMemberListing";
import { useExportableData } from "@/hooks/useExportableData";
import { usePrintReport } from "@/hooks/usePrintReport";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatLocationName } from "@/utils/textUtils";
import { AddStaffMemberModal } from "./components/modals/AddStaffMemberModal";

interface StaffMembersListingClientProps {
  location: string;
}

export function StaffMembersListingClient({ location }: StaffMembersListingClientProps) {
  const [isAddStaffMemberModalOpen, setIsAddStaffMemberModalOpen] = React.useState(false);
  const columns = React.useMemo<ColumnDef<StaffMemberRow>[]>(() => staffMemberColumns, []);

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
  } = useStaffMemberListing(location);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<StaffMemberRow>({
    reportTitle: `Staff Members list for ${formatLocationName(location)}`,
    columns,
    data: rows,
    location: location,
  });

  const { handlePrint } = usePrintReport<StaffMemberRow>();

  return (
    <ReportPageLayout
      title="Staff Members"
      subtitle="Manage staff members"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button 
          onClick={() => setIsAddStaffMemberModalOpen(true)}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Staff Member
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
          reportTitle: `Staff Members list for ${formatLocationName(location)}`,
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
        defaultFilterLabel="All Staff Members"
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
      
      <AddStaffMemberModal
        isOpen={isAddStaffMemberModalOpen}
        onClose={() => setIsAddStaffMemberModalOpen(false)}
        onSuccess={() => {
          // Refresh the data after successful staff member creation
          fetchData();
        }}
        location={location}
      />
    </ReportPageLayout>
  );
}


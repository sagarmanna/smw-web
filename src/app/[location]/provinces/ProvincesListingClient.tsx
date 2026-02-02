"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";

import { ProvinceRow } from "./provinces.api";
import { provinceColumns } from "./tableConfigs";
import { useProvinceListing } from "./hooks/useProvinceListing";
import { AddProvinceModal } from "./components/modals/AddProvinceModal";

interface ProvincesListingClientProps {
  location: string;
}

export function ProvincesListingClient({ location }: ProvincesListingClientProps) {
  const [isAddProvinceModalOpen, setIsAddProvinceModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedProvince, setSelectedProvince] = React.useState<ProvinceRow | null>(null);
  const columns = React.useMemo<ColumnDef<ProvinceRow>[]>(() => provinceColumns, []);

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
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
  } = useProvinceListing(location);

  const openAddModal = () => {
    setSelectedProvince(null);
    setModalMode("add");
    setIsAddProvinceModalOpen(true);
  };

  const openEditModal = (province: ProvinceRow) => {
    setSelectedProvince(province);
    setModalMode("edit");
    setIsAddProvinceModalOpen(true);
  };

  return (
    <ReportPageLayout
      title="Provinces"
      subtitle="Manage provinces"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Province
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
        enablePrint={false}
        enableRowsPerPage={true}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          name: "Enter province name",
        }}
        manualSorting={true}
        sorting={sorting}
        onSortingChange={(s) => {
          setSorting(s);
          setPage(1);
        }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        enableExport={false}
        onRowsPerPageChange={(newSize) => {
          setPageSize(newSize);
          // Explicitly reset page to 1 to ensure effect triggers
          setPage(1);
        }}
        onRowClick={(row) => openEditModal(row)}
      />

      <AddProvinceModal
        isOpen={isAddProvinceModalOpen}
        onClose={() => setIsAddProvinceModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
        mode={modalMode}
        initialData={selectedProvince}
      />
    </ReportPageLayout>
  );
}



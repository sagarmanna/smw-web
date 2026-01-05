"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";

import { CityRow } from "./cities.api";
import { cityColumns } from "./tableConfigs";
import { useCityListing } from "./hooks/useCityListing";
import { AddCityModal } from "./components/modals/AddCityModal";

interface CitiesListingClientProps {
  location: string;
}

export function CitiesListingClient({ location }: CitiesListingClientProps) {
  const [isAddCityModalOpen, setIsAddCityModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedCity, setSelectedCity] = React.useState<CityRow | null>(null);
  const columns = React.useMemo<ColumnDef<CityRow>[]>(() => cityColumns, []);

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
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
  } = useCityListing(location);

  const openAddModal = () => {
    setSelectedCity(null);
    setModalMode("add");
    setIsAddCityModalOpen(true);
  };

  const openEditModal = (city: CityRow) => {
    setSelectedCity(city);
    setModalMode("edit");
    setIsAddCityModalOpen(true);
  };

  return (
    <ReportPageLayout
      title="Cities"
      subtitle="Manage cities"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add City
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
          name: "Enter city name",
          province: "Enter province",
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

      <AddCityModal
        isOpen={isAddCityModalOpen}
        onClose={() => setIsAddCityModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
        mode={modalMode}
        initialData={selectedCity}
      />
    </ReportPageLayout>
  );
}


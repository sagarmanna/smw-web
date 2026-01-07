"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";

import { CountryRow } from "./countries.api";
import { countryColumns } from "./tableConfigs";
import { useCountryListing } from "./hooks/useCountryListing";
import { AddCountryModal } from "./components/modals/AddCountryModal";

interface CountriesListingClientProps {
  location: string;
}

export function CountriesListingClient({ location }: CountriesListingClientProps) {
  const [isAddCountryModalOpen, setIsAddCountryModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedCountry, setSelectedCountry] = React.useState<CountryRow | null>(null);
  const columns = React.useMemo<ColumnDef<CountryRow>[]>(() => countryColumns, []);

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
  } = useCountryListing(location);

  const openAddModal = () => {
    setSelectedCountry(null);
    setModalMode("add");
    setIsAddCountryModalOpen(true);
  };

  const openEditModal = (country: CountryRow) => {
    setSelectedCountry(country);
    setModalMode("edit");
    setIsAddCountryModalOpen(true);
  };

  return (
    <ReportPageLayout
      title="Countries"
      subtitle="Manage countries"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Country
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
          name: "Enter country name",
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

      <AddCountryModal
        isOpen={isAddCountryModalOpen}
        onClose={() => setIsAddCountryModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
        mode={modalMode}
        initialData={selectedCountry}
      />
    </ReportPageLayout>
  );
}



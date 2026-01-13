"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";

import { LocationRow } from "./locations.api";
import { locationColumns } from "./tableConfigs";
import { useLocationListing } from "./hooks/useLocationListing";
import { AddLocationModal } from "./components/modals/AddLocationModal";

interface LocationsListingClientProps {
  location: string;
}

export function LocationsListingClient({ location }: LocationsListingClientProps) {
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedLocation, setSelectedLocation] = React.useState<LocationRow | null>(null);
  const columns = React.useMemo<ColumnDef<LocationRow>[]>(() => locationColumns, []);

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
    fetchData,
  } = useLocationListing(location);

  const openAddModal = () => {
    setSelectedLocation(null);
    setModalMode("add");
    setIsAddLocationModalOpen(true);
  };

  const openEditModal = (row: LocationRow) => {
    setSelectedLocation(row);
    setModalMode("edit");
    setIsAddLocationModalOpen(true);
  };

  return (
    <ReportPageLayout
      title="Locations"
      subtitle="Manage locations"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Location
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
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={true}
        // Sorting and pagination (server-side)
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
          setPage(1);
        }}
        onRowClick={(row) => openEditModal(row)}
      />

      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
        mode={modalMode}
        initialData={selectedLocation}
      />
    </ReportPageLayout>
  );
}



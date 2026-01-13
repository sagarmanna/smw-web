"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = React.useState(false);
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
    setIsAddLocationModalOpen(true);
  };

  const openDetailPage = (row: LocationRow) => {
    const slugOrId = row.slug?.trim() ? row.slug.trim() : String(row.id);
    // API not ready: store row data for the detail page (keep URL clean).
    try {
      const key = `smw.locationDetail:${location}:${slugOrId}`;
      sessionStorage.setItem(
        key,
        JSON.stringify({
          name: row.name,
          address: row.address,
          email: row.email,
        })
      );
    } catch {
      // ignore (storage may be unavailable)
    }
    router.push(`/${location}/locations/${encodeURIComponent(slugOrId)}`);
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
        onRowClick={openDetailPage}
      />

      <AddLocationModal
        isOpen={isAddLocationModalOpen}
        onClose={() => setIsAddLocationModalOpen(false)}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
      />
    </ReportPageLayout>
  );
}



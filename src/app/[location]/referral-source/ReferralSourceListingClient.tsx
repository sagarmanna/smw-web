"use client";

import * as React from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";
import { LoadingAnimation } from "@/components/LoadingAnimation";

import { ReferralSourceRow } from "./referralSource.api";
import { referralSourceColumns } from "./tableConfigs";
import { useReferralSourceListing } from "./hooks/useReferralSourceListing";
import { ReferralSourceModal } from "./components/modals/ReferralSourceModal";

interface ReferralSourceListingClientProps {
  location: string;
}

/**
 * Client component for referral source listing page
 * 
 * Features:
 * - Displays referral sources in a sortable table
 * - Supports add/edit/delete operations via modal
 * - Manages loading and error states
 * - Integrates with Redux for state management
 * 
 * @param location - Current location context
 */
export function ReferralSourceListingClient({ location }: ReferralSourceListingClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedReferralSource, setSelectedReferralSource] = React.useState<ReferralSourceRow | null>(null);
  const columns = React.useMemo<ColumnDef<ReferralSourceRow>[]>(() => referralSourceColumns, []);

  const {
    rows,
    isLoading,
    error,
    sortBy,
    sortDir,
    fetchData,
    handleSortingChange,
    handleErrorClear,
  } = useReferralSourceListing(location);

  /**
   * Convert Redux sorting state to TanStack Table SortingState format
   */
  const sorting: SortingState = React.useMemo(() => {
    if (!sortBy) return [];
    return [{ id: sortBy, desc: sortDir === "desc" }];
  }, [sortBy, sortDir]);

  /**
   * Handler for table sorting changes
   * Converts TanStack Table sorting format to Redux state format
   */
  const handleTableSortingChange = React.useCallback(
    (newSorting: SortingState) => {
      const sortBy = newSorting[0]?.id as string | undefined;
      const sortDir = newSorting[0]?.desc ? "desc" : "asc";
      handleSortingChange({ sortBy, sortDir });
    },
    [handleSortingChange]
  );

  /**
   * Opens the add referral source modal
   */
  const openAddModal = React.useCallback(() => {
    setSelectedReferralSource(null);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  /**
   * Opens the edit referral source modal with selected data
   */
  const openEditModal = React.useCallback((referralSource: ReferralSourceRow) => {
    setSelectedReferralSource(referralSource);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  return (
    <ReportPageLayout
      title="Referral Source"
      subtitle="Manage referral sources"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Referral Source
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        customLoadingState={
          <div className="flex items-center justify-center py-8">
            <LoadingAnimation size="md" text="Loading referral sources..." />
          </div>
        }
        size="compact"
        variant="default"
        stickyHeader={true}
        headerClassName="[&_th]:text-left [&_th>div]:justify-start [&_th>div>svg]:hidden"
        enableSearch={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={false}
        enableColumnFilters={false}
        enableSorting={true}
        serverSidePagination={undefined}
        hideRecordCount={true}
        showRecordCountInToolbar={false}
        enableExport={false}
        sorting={sorting}
        onSortingChange={handleTableSortingChange}
        manualSorting={true}
        onRowClick={(row) => openEditModal(row)}
      />

      <ReferralSourceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReferralSource(null);
        }}
        onSuccess={() => {
          // No need to refetch - Redux state is already updated by the thunks
        }}
        location={location}
        mode={modalMode}
        initialData={selectedReferralSource}
      />
    </ReportPageLayout>
  );
}

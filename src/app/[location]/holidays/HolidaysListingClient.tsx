"use client";

import * as React from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";
import { LoadingAnimation } from "@/components/LoadingAnimation";

import { HolidayRow } from "./holidays.api";
import { holidaysColumns } from "./tableConfigs";
import { useHolidaysListing } from "./hooks/useHolidaysListing";
import { HolidayModal } from "./components/modals/HolidayModal";

interface HolidaysListingClientProps {
  location: string;
}

/**
 * Client component for holidays listing page
 * 
 * Features:
 * - Displays holidays in a sortable, paginated table
 * - Supports add/edit/delete operations via modal
 * - Manages loading and error states
 * - Integrates with Redux for state management
 * - Server-side pagination and sorting
 * 
 * @param location - Current location context
 */
export function HolidaysListingClient({ location }: HolidaysListingClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedHoliday, setSelectedHoliday] = React.useState<HolidayRow | null>(null);
  const columns = React.useMemo<ColumnDef<HolidayRow>[]>(() => holidaysColumns, []);

  const {
    rows,
    isLoading,
    error,
    page,
    pageSize,
    total,
    totalPages,
    sortBy,
    sortDir,
    fetchData,
    handleSortingChange,
    handlePageChange,
    handlePageSizeChange,
  } = useHolidaysListing(location);

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
   * Opens the add holiday modal
   */
  const openAddModal = React.useCallback(() => {
    setSelectedHoliday(null);
    setModalMode("add");
    setIsModalOpen(true);
  }, []);

  /**
   * Opens the edit holiday modal with selected data
   */
  const openEditModal = React.useCallback((holiday: HolidayRow) => {
    setSelectedHoliday(holiday);
    setModalMode("edit");
    setIsModalOpen(true);
  }, []);

  return (
    <ReportPageLayout
      title="Holidays"
      subtitle="Manage holidays"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Holiday
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        customLoadingState={
          <div className="flex items-center justify-center py-8">
            <LoadingAnimation size="md" text="Loading holidays..." />
          </div>
        }
        size="compact"
        variant="default"
        stickyHeader={true}
        headerClassName="[&_th]:text-left [&_th>div]:justify-start [&_th>div>svg]:hidden"
        enableSearch={false}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={true}
        enableColumnFilters={false}
        enableSorting={true}
        serverSidePagination={{
          page,
          limit: pageSize,
          total,
          totalPages,
        }}
        onServerSidePageChange={handlePageChange}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        onRowsPerPageChange={handlePageSizeChange}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        enableExport={false}
        sorting={sorting}
        onSortingChange={handleTableSortingChange}
        manualSorting={true}
        onRowClick={(row) => openEditModal(row)}
      />

      <HolidayModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedHoliday(null);
        }}
        onSuccess={() => {
          // No need to refetch - Redux state is already updated by the thunks
        }}
        location={location}
        mode={modalMode}
        initialData={selectedHoliday}
      />
    </ReportPageLayout>
  );
}

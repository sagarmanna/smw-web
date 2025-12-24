"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import type { ReleaseNoteRow } from "./types";
import { getReleaseNoteColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useReleaseNotesListing } from "./hooks/useReleaseNotesListing";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddReleaseNoteModal } from "./components/modals/AddReleaseNoteModal";
import { ViewReleaseNoteModal } from "./components/modals/ViewReleaseNoteModal";
import { EditReleaseNoteModal } from "./components/modals/EditReleaseNoteModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { deleteReleaseNote as deleteReleaseNoteAction } from "./releaseNotesListing.slice";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface ReleaseNotesListingClientProps {
  location: string;
}

export function ReleaseNotesListingClient({ location }: ReleaseNotesListingClientProps) {
  const dispatch = useAppDispatch();
  const { userInfo } = useAppSelector((state) => state.user);
  const isAdmin = userInfo?.role === 'administrator';
  
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [viewModalState, setViewModalState] = React.useState<{
    isOpen: boolean;
    id: number | string | null;
  }>({ isOpen: false, id: null });
  const [editModalState, setEditModalState] = React.useState<{
    isOpen: boolean;
    id: number | string | null;
  }>({ isOpen: false, id: null });
  const [deleteModalState, setDeleteModalState] = React.useState<{
    isOpen: boolean;
    id: number | null;
  }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = React.useState(false);

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
  } = useReleaseNotesListing(location);

  const handleViewClick = React.useCallback((id: number | string) => {
    setViewModalState({ isOpen: true, id });
  }, []);

  const handleEditClick = React.useCallback((id: number | string) => {
    setEditModalState({ isOpen: true, id });
  }, []);

  const handleDeleteClick = React.useCallback((id: number | string) => {
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
    if (!isNaN(numericId)) {
      setDeleteModalState({ isOpen: true, id: numericId });
    }
  }, []);

  const handleConfirmDelete = React.useCallback(async () => {
    if (!deleteModalState.id) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteReleaseNoteAction({ location, id: deleteModalState.id })).unwrap();
      toast.success("Release note deleted successfully");
      setDeleteModalState({ isOpen: false, id: null });
      // Refetch to get updated sorted list from server
      fetchData();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete release note";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, location, deleteModalState.id, fetchData]);

  const columns = React.useMemo<ColumnDef<ReleaseNoteRow>[]>(
    () => getReleaseNoteColumns(location, page, pageSize, handleViewClick, handleEditClick, handleDeleteClick, isAdmin),
    [location, page, pageSize, handleViewClick, handleEditClick, handleDeleteClick, isAdmin]
  );

  // Show full-page loading animation while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading release notes data..." 
          className="text-center"
        />
      </div>  
    );
  }

  if (error) {
    return (
      <ReportPageLayout
        title="Release Notes"
        subtitle="Browse all release notes, search and sort"
        isLoading={isLoading}
        error={error}
        onRetry={fetchData}
      >
        <div />
      </ReportPageLayout>
    );
  }

  return (
    <ReportPageLayout
      title="Release Notes"
      subtitle="Browse all release notes, search and sort"
      isLoading={isLoading}
      error={null}
      onRetry={fetchData}
      actions={
        isAdmin ? (
          <Button 
            onClick={() => setIsAddModalOpen(true)} 
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        ) : undefined
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}

        // Visual configuration
        size="normal"
        variant="default"
        stickyHeader={true}

        // Features
        enableSearch={false}
        searchPlaceholder="Search release notes..."
        getSearchValue={(r) => `${r.subject} ${r.summary} ${r.notes} ${r.userPublicIdentity}`}
        enableFilter={false}
        enableRowsPerPage={false}
        enablePrint={false}
        enableColumnFilters={false}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}

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
        enableExport={false}
      />
      
      <AddReleaseNoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          // Refetch to get updated sorted list from server
          fetchData();
        }}
        location={location}
      />

      <ViewReleaseNoteModal
        isOpen={viewModalState.isOpen}
        onClose={() => setViewModalState({ isOpen: false, id: null })}
        location={location}
        releaseNoteId={viewModalState.id}
      />

      <EditReleaseNoteModal
        isOpen={editModalState.isOpen}
        onClose={() => setEditModalState({ isOpen: false, id: null })}
        onSuccess={() => {
          // Refetch to get updated sorted list from server
          fetchData();
        }}
        location={location}
        releaseNoteId={editModalState.id}
      />

      <DeleteConfirmationModal
        open={deleteModalState.isOpen}
        onOpenChange={(open) => setDeleteModalState({ isOpen: open, id: open ? deleteModalState.id : null })}
        title="Delete Release Note"
        description="Are you sure you want to delete this release note? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </ReportPageLayout>
  );
}


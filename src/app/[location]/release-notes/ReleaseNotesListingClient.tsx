"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import type { ReleaseNoteRow } from "./types";
import { getReleaseNoteColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useReleaseNotesListing } from "./hooks/useReleaseNotesListing";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddReleaseNoteModal } from "./components/modals/AddReleaseNoteModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { useAppDispatch } from "@/redux/hooks";
import { deleteReleaseNote as deleteReleaseNoteAction } from "./releaseNotesListing.slice";
import { toast } from "sonner";

interface ReleaseNotesListingClientProps {
  location: string;
}

export function ReleaseNotesListingClient({ location }: ReleaseNotesListingClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete release note";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, location, deleteModalState.id]);

  const columns = React.useMemo<ColumnDef<ReleaseNoteRow>[]>(
    () => getReleaseNoteColumns(location, page, pageSize, handleDeleteClick),
    [location, page, pageSize, handleDeleteClick]
  );

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
        <Button 
          onClick={() => setIsAddModalOpen(true)} 
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
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
          // No need to refetch - Redux state is automatically updated after API call
          // The addReleaseNote thunk calls POST API first, then updates Redux state
        }}
        location={location}
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


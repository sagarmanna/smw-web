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

interface ReleaseNotesListingClientProps {
  location: string;
}

export function ReleaseNotesListingClient({ location }: ReleaseNotesListingClientProps) {
  const router = useRouter();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);

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

  const columns = React.useMemo<ColumnDef<ReleaseNoteRow>[]>(
    () => getReleaseNoteColumns(location, page, pageSize),
    [location, page, pageSize]
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
          // No need to fetch - Redux state is automatically updated after API call
        }}
        location={location}
      />
    </ReportPageLayout>
  );
}


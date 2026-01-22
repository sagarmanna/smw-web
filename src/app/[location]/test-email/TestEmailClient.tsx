"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useTestEmailListing } from "./hooks/useTestEmailListing";
import type { TestEmailRow } from "./types";
import { EditTestEmailModal } from "./components/modals/EditTestEmailModal";
import { getTestEmailColumns } from "./tableConfigs";

interface TestEmailClientProps {
  location: string;
}

export function TestEmailClient({ location }: TestEmailClientProps) {
  const { rows, isLoading, error, fetchData } = useTestEmailListing(location);
  const columns = React.useMemo<ColumnDef<TestEmailRow>[]>(() => getTestEmailColumns(), []);

  const [editModal, setEditModal] = React.useState<{ isOpen: boolean; id: number | null }>({
    isOpen: false,
    id: null,
  });

  // Full-page loading for initial fetch
  if (isLoading && rows.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading test email..." className="text-center" />
      </div>
    );
  }

  if (error && rows.length === 0) {
    return (
      <ReportPageLayout
        title="Test Email"
        subtitle="Manage the email address used for test emails"
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
      title="Test Email"
      subtitle="Manage the email address used for test emails"
      isLoading={isLoading}
      error={null}
      onRetry={fetchData}
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}

        // Visual configuration
        size="normal"
        variant="default"
        stickyHeader={false}

        // Features (keep UI minimal like the screenshots)
        enableSearch={false}
        enableFilter={false}
        enableRowsPerPage={false}
        enableExport={false}
        enablePrint={false}
        enableSorting={false}
        enableColumnFilters={false}

        // Open modal on row click
        onRowClick={(row: TestEmailRow) => setEditModal({ isOpen: true, id: row.id })}
        // CustomTable already applies hover + transition when onRowClick is set
        rowClassName="cursor-pointer"

        // Match empty state text (avoid default emoji)
        customEmptyState={
          <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <span className="text-sm font-medium">No records found</span>
          </div>
        }
      />

      <EditTestEmailModal
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, id: null })}
        location={location}
        rowId={editModal.id}
      />
    </ReportPageLayout>
  );
}


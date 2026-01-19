"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import type { EmailTemplateRow } from "./types";
import { getEmailTemplateColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { EditEmailTemplateModal } from "./components/modals/EditEmailTemplateModal";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { useEmailTemplateListing } from "./hooks/useEmailTemplateListing";

interface EmailTemplateListingClientProps {
  location: string;
}

export function EmailTemplateListingClient({ location }: EmailTemplateListingClientProps) {
  const [editModalState, setEditModalState] = React.useState<{
    isOpen: boolean;
    id: number | string | null;
  }>({ isOpen: false, id: null });

  const {
    rows,
    total,
    totalPages,
    isLoading,
    error,
    page,
    setPage,
    pageSize,
    fetchData,
  } = useEmailTemplateListing(location);

  const handleEditClick = React.useCallback((id: number | string) => {
    setEditModalState({ isOpen: true, id });
  }, []);

  const columns = React.useMemo<ColumnDef<EmailTemplateRow>[]>(
    () => getEmailTemplateColumns(),
    []
  );

  // Show full-page loading animation while fetching data
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation 
          size="xl" 
          text="Loading email templates..." 
          className="text-center"
        />
      </div>  
    );
  }

  if (error && rows.length === 0) {
    return (
      <ReportPageLayout
        title="Email Templates"
        subtitle="Manage email templates for different types"
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
      title="Email Templates"
      subtitle="Manage email templates for different types"
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
        stickyHeader={true}

        // Features
        enableSearch={false}
        enableFilter={false}
        enableRowsPerPage={false}
        enablePrint={false}
        enableColumnFilters={false}

        // Pagination (server-side)
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={setPage}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        enableExport={false}

        // Row click to open edit modal
        onRowClick={(row: EmailTemplateRow) => {
          handleEditClick(row.id);
        }}
        rowClassName="cursor-pointer hover:bg-primary/10 transition-colors"
      />
      
      <EditEmailTemplateModal
        isOpen={editModalState.isOpen}
        onClose={() => setEditModalState({ isOpen: false, id: null })}
        onSuccess={() => {
          // No refetch needed - Redux state is updated after API call
        }}
        location={location}
        emailTemplateId={editModalState.id}
      />
    </ReportPageLayout>
  );
}

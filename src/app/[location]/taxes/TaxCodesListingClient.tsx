"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";

import { TaxCodeRow } from "./taxes.api";
import { taxCodeColumns } from "./tableConfigs";
import { useTaxCodesListing } from "./hooks/useTaxCodesListing";
import { AddTaxCodeModal } from "./components/modals/AddTaxCodeModal";

interface TaxCodesListingClientProps {
  location: string;
}

export function TaxCodesListingClient({ location }: TaxCodesListingClientProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedRow, setSelectedRow] = React.useState<TaxCodeRow | null>(null);

  const columns = React.useMemo<ColumnDef<TaxCodeRow>[]>(() => taxCodeColumns, []);

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
  } = useTaxCodesListing(location);

  const openAddModal = () => {
    setSelectedRow(null);
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (row: TaxCodeRow) => {
    setSelectedRow(row);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  return (
    <ReportPageLayout
      title="Tax Codes"
      subtitle="Manage tax codes"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button onClick={openAddModal} className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Tax Code
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
        enableColumnFilters={false}
        // Server-side sorting
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

      <AddTaxCodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => fetchData()}
        location={location}
        mode={modalMode}
        initialData={selectedRow}
      />
    </ReportPageLayout>
  );
}



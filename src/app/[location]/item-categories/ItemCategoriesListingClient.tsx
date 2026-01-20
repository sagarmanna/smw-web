"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { CustomTable } from "@/components/CustomTable";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";

import { itemCategoryColumns } from "./tableConfigs";
import { useItemCategoriesListing } from "./hooks/useItemCategoriesListing";
import { ItemCategoryCrudModal } from "./components/modals/ItemCategoryCrudModal";
import { ItemCategoryRow } from "./itemCategories.api";

interface ItemCategoriesListingClientProps {
  location: string;
}

export function ItemCategoriesListingClient({ location }: ItemCategoriesListingClientProps) {
  const columns = itemCategoryColumns;
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalMode, setModalMode] = React.useState<"add" | "edit">("add");
  const [selectedRow, setSelectedRow] = React.useState<ItemCategoryRow | null>(null);

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
  } = useItemCategoriesListing(location);

  return (
    <ReportPageLayout
      title="Item Categories"
      subtitle="Browse and manage item categories"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={
        <Button
          size="default"
          aria-label="Add item category"
          onClick={() => {
            setModalMode("add");
            setSelectedRow(null);
            setIsModalOpen(true);
          }}
          className="bg-primary hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Add Item Category
        </Button>
      }
    >
      <CustomTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        onRowClick={(row) => {
          setModalMode("edit");
          setSelectedRow(row);
          setIsModalOpen(true);
        }}
        size="compact"
        variant="default"
        stickyHeader={true}
        enableSearch={false}
        enableFilter={false}
        enablePrint={false}
        enableColumnFilters={false}
        enableRowsPerPage={true}
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
      />

      <ItemCategoryCrudModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRow(null);
          setModalMode("add");
        }}
        onSuccess={() => {
          fetchData();
        }}
        location={location}
        mode={modalMode}
        initialData={selectedRow}
      />
    </ReportPageLayout>
  );
}



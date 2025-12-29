"use client";

import * as React from "react";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { ItemRow } from "./itemsListing.api";
import { itemColumns } from "./tableConfigs";
import { ReportPageLayout } from "@/components/ReportPageLayout";
import { useExportableData } from "@/hooks/useExportableData";
import { useItemListing } from "./hooks/useItemListing";
import { formatLocationName } from "@/utils/textUtils";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import { Checkbox } from "@/components/ui/checkbox";
import { AddItemModal } from "./components/AddItemModal";
import { useAppDispatch } from "@/redux/hooks";
import { addItem, updateItem } from "./itemsListing.slice";

interface ItemsListingClientProps {
  location: string;
}

export function ItemsListingClient({ location }: ItemsListingClientProps) {
  const dispatch = useAppDispatch();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ItemRow | null>(null);

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
    showAll,
    fetchData,
    handleColumnFilterChange,
    handleColumnFilterEnter,
    handleShowAllChange,
  } = useItemListing(location);

  const exportColumns = React.useMemo((): ColumnDef<ItemRow>[] => {
    return [
      { accessorKey: "code", header: "Code", meta: { printable: true, printableName: "Code" } },
      { accessorKey: "itemCategory", header: "Item Category", meta: { printable: true, printableName: "Item Category" } },
      { accessorKey: "description", header: "Description", meta: { printable: true, printableName: "Description" } },
      { accessorKey: "price", header: "Price", cell: ({ getValue }) => formatCurrency(getValue() as number), meta: { printable: true, printableName: "Price" } },
      { accessorKey: "royaltyFree", header: "Royalty Free", meta: { printable: true, printableName: "Royalty Free" } },
      { accessorKey: "tax", header: "Tax", meta: { printable: true, printableName: "Tax" } },
      { accessorKey: "status", header: "Status", meta: { printable: true, printableName: "Status" } },
    ];
  }, []);

  const { exportToCsv, exportToPdf, exportToHtml, exportToJson, exportToText, exportToExcel } = useExportableData<ItemRow>({
    reportTitle: `Items list for ${formatLocationName(location)}`,
    columns: exportColumns,
    data: rows,
    location: location,
  });

  const addItemButton = React.useMemo(() => (
    <Button
      onClick={() => {
        setEditingItem(null);
        setIsAddItemModalOpen(true);
      }}
      className="bg-primary hover:bg-primary/90"
    >
      <Plus className="h-4 w-4 mr-2" />
      Add Item
    </Button>
  ), []);

  const showAllCheckbox = React.useMemo(() => (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="show-all-items"
        checked={showAll}
        onCheckedChange={(checked: boolean) => handleShowAllChange(checked)}
      />
      <label
        htmlFor="show-all-items"
        className="text-sm font-medium leading-none cursor-pointer"
      >
        Show All
      </label>
    </div>
  ), [showAll, handleShowAllChange]);

  return (
    <ReportPageLayout
      title="Items"
      subtitle="Browse all items, search and sort"
      isLoading={isLoading}
      error={error}
      onRetry={fetchData}
      actions={addItemButton}
    >
      <CustomTable
        data={rows}
        columns={itemColumns}
        isLoading={isLoading}
        size="compact"
        variant="default"
        stickyHeader={true}
        enableSearch={false}
        searchPlaceholder="Search items..."
        getSearchValue={(r) => `${r.code} ${r.itemCategory} ${r.description}`}
        enableFilter={false}
        enablePrint={false}
        enableRowsPerPage={true}
        enableColumnFilters={true}
        onColumnFilterChange={handleColumnFilterChange}
        onColumnFilterEnter={handleColumnFilterEnter}
        columnFilters={columnFilters}
        columnFilterPlaceholders={{
          code: "Enter code",
          itemCategory: "Enter item category",
          description: "Enter description",
        }}
        sorting={sorting}
        onSortingChange={(s) => {
          setSorting(s);
        }}
        serverSidePagination={{ page, limit: pageSize, total, totalPages }}
        onServerSidePageChange={(newPage) => setPage(newPage)}
        hideRecordCount={true}
        showRecordCountInToolbar={true}
        rowsPerPage={pageSize}
        rowsPerPageOptions={[10, 20, 50, 100]}
        enableExport={true}
        onExport={{
          html: exportToHtml,
          csv: exportToCsv,
          text: exportToText,
          excel: exportToExcel,
          pdf: exportToPdf,
          json: exportToJson,
        }}
        onRowsPerPageChange={(newSize) => { setPageSize(newSize); setPage(1); }}
        customHeaderComponent={showAllCheckbox}
        onRowClick={(row: ItemRow) => {
          setEditingItem(row);
          setIsAddItemModalOpen(true);
        }}
        rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      />
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => {
          setIsAddItemModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={(itemData, itemId) => {
          if (itemData) {
            if (itemId) {
              // Update existing item
              dispatch(updateItem(itemData as ItemRow));
            } else {
              // Add new item
              dispatch(addItem(itemData as ItemRow));
            }
          }
          fetchData();
          setIsAddItemModalOpen(false);
          setEditingItem(null);
        }}
        location={location}
        initialData={editingItem}
        mode={editingItem ? "edit" : "add"}
      />
    </ReportPageLayout>
  );
}


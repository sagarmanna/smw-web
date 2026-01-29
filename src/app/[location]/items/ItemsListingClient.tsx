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

// Item codes that cannot be edited (legacy: "Lesson and opening balance items cannot be modified from Backend")
const NON_EDITABLE_ITEM_CODES = ["LESSON", "OPENING BALANCE"] as const;

function isItemNonEditable(row: ItemRow): boolean {
  const code = row.code?.trim().toUpperCase();
  return !!code && NON_EDITABLE_ITEM_CODES.includes(code as (typeof NON_EDITABLE_ITEM_CODES)[number]);
}

interface ItemsListingClientProps {
  location: string;
}

const NON_EDITABLE_BANNER_DURATION_MS = 10_000;

export function ItemsListingClient({ location }: ItemsListingClientProps) {
  const dispatch = useAppDispatch();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ItemRow | null>(null);
  const [showNonEditableBanner, setShowNonEditableBanner] = React.useState(false);
  const nonEditableBannerTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (nonEditableBannerTimeoutRef.current) clearTimeout(nonEditableBannerTimeoutRef.current);
    };
  }, []);

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
    refetch,
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

  const handleRowClick = React.useCallback((row: ItemRow) => {
    if (isItemNonEditable(row)) {
      if (nonEditableBannerTimeoutRef.current) clearTimeout(nonEditableBannerTimeoutRef.current);
      setShowNonEditableBanner(true);
      nonEditableBannerTimeoutRef.current = setTimeout(() => {
        setShowNonEditableBanner(false);
        nonEditableBannerTimeoutRef.current = null;
      }, NON_EDITABLE_BANNER_DURATION_MS);
      return;
    }
    setEditingItem(row);
    setIsAddItemModalOpen(true);
  }, []);

  return (
    <ReportPageLayout
      title="Items"
      subtitle="Browse all items, search and sort"
      isLoading={isLoading}
      error={error}
      onRetry={refetch}
      actions={addItemButton}
    >
      {showNonEditableBanner && (
        <div
          role="alert"
          className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200"
        >
          Lesson and opening balance items cannot be modified from Backend.
        </div>
      )}
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
        manualSorting={true}
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
        onRowClick={handleRowClick}
        rowClassName={(row: ItemRow) =>
          isItemNonEditable(row)
            ? "cursor-not-allowed bg-muted/30 dark:bg-muted/20"
            : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        }
      />
      <AddItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => {
          setIsAddItemModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={(itemData) => {
          if (itemData) {
            const fullItem = itemData as ItemRow;
            const itemExists = rows.some((row) => row.id === fullItem.id);
            if (itemExists) {
              dispatch(updateItem(fullItem));
            } else {
              dispatch(addItem(fullItem));
            }
          }
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


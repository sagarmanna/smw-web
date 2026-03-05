"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { getItemsList, type ItemRow } from "../../../../items/itemsListing.api";
import { formatCurrency } from "@/utils/formatCurrency";

type SortableField = "code" | "description";
type SortOrder = "asc" | "desc";

interface AddLineItemsModalProps {
  open: boolean;
  onClose: () => void;
  location: string;
  onSelectItem: (item: ItemRow) => void;
}

export function AddLineItemsModal({
  open,
  onClose,
  location,
  onSelectItem,
}: AddLineItemsModalProps) {
  const [items, setItems] = React.useState<ItemRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [codeFilter, setCodeFilter] = React.useState("");
  const [descriptionFilter, setDescriptionFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "code", desc: false }]);

  const columns = React.useMemo<ColumnDef<ItemRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: () => <span>Code</span>,
        cell: ({ row }) => <span>{row.original.code}</span>,
        enableSorting: true,
        filter: { type: "string" },
      } as ColumnDef<ItemRow> & { filter: { type: "string" } },
      {
        accessorKey: "description",
        header: () => <span>Description</span>,
        cell: ({ row }) => <span>{row.original.description}</span>,
        enableSorting: true,
        filter: { type: "string" },
      } as ColumnDef<ItemRow> & { filter: { type: "string" } },
      {
        accessorKey: "price",
        header: () => <span>Price</span>,
        cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.price || 0)}</div>,
        enableSorting: false,
      },
    ],
    []
  );

  const fetchItems = React.useCallback(async (
    currentCodeFilter: string,
    currentDescriptionFilter: string,
    currentSortBy: SortableField,
    currentSortOrder: SortOrder
  ) => {
    setIsLoading(true);
    const response = await getItemsList(location, {
      page: 1,
      limit: 9999,
      showAll: 1,
      sortBy: currentSortBy,
      sortOrder: currentSortOrder,
      code: currentCodeFilter.trim() || undefined,
      description: currentDescriptionFilter.trim() || undefined,
    });

    if (response.success) {
      setItems(response.data.body || []);
    } else {
      setItems([]);
    }

    setIsLoading(false);
  }, [location]);

  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      if (cancelled) return;
      const currentSort = sorting[0];
      const sortField: SortableField =
        currentSort?.id === "description" ? "description" : "code";
      const sortDirection: SortOrder = currentSort?.desc ? "desc" : "asc";

      await fetchItems(codeFilter, descriptionFilter, sortField, sortDirection);
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [
    open,
    fetchItems,
    codeFilter,
    descriptionFilter,
    sorting,
  ]);

  const handleColumnFilterChange = React.useCallback((columnKey: string, filterValue: unknown) => {
    const normalizedValue = typeof filterValue === "string" ? filterValue : "";

    if (columnKey === "code") {
      setCodeFilter(normalizedValue);
      return;
    }

    if (columnKey === "description") {
      setDescriptionFilter(normalizedValue);
    }
  }, []);

  const columnFilters = React.useMemo(
    () => ({
      code: codeFilter,
      description: descriptionFilter,
    }),
    [codeFilter, descriptionFilter]
  );

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Add Line Items</DialogTitle>
        </DialogHeader>

        <CustomTable
          data={items}
          columns={columns}
          isLoading={isLoading}
          size="compact"
          variant="default"
          stickyHeader={true}
          maxHeight="70vh"
          enableSearch={false}
          enableFilter={false}
          enablePrint={false}
          enableExport={false}
          enableRowsPerPage={false}
          enableColumnFilters={true}
          enableSorting={true}
          manualSorting={true}
          sorting={sorting}
          onSortingChange={setSorting}
          onColumnFilterChange={handleColumnFilterChange}
          columnFilters={columnFilters}
          columnFilterPlaceholders={{
            code: "Enter code",
            description: "Enter description",
          }}
          customEmptyState={<div className="py-6 text-center text-muted-foreground">No items found</div>}
          onRowClick={(item) => {
            onSelectItem(item);
            onClose();
          }}
          rowClassName="cursor-pointer hover:bg-muted/40"
        />

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

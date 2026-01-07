"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, ChevronDown } from "lucide-react";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/utils/formatCurrency";
import { InvoiceItem } from "../../mockData/invoiceDetailMockData";
import { InvoiceDiscountModal, DiscountData } from "../modals/InvoiceDiscountModal";
import { EditLineItemModal } from "../modals/EditLineItemModal";
import { toast } from "sonner";

interface InvoiceItemsCardProps {
  items: InvoiceItem[];
  isLoading?: boolean;
  onSaveDiscount?: (selectedItemIds: string[], discountData: DiscountData) => void;
  onSaveItem?: (item: InvoiceItem) => void;
  onDeleteItem?: (itemId: string) => void;
}

export const InvoiceItemsCard = React.memo(function InvoiceItemsCard({
  items,
  isLoading = false,
  onSaveDiscount,
  onSaveItem,
  onDeleteItem,
}: InvoiceItemsCardProps) {
  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [isDiscountModalOpen, setIsDiscountModalOpen] = React.useState(false);
  const [isEditLineItemModalOpen, setIsEditLineItemModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InvoiceItem | null>(null);

  const handleSelectAll = React.useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedItems(new Set(items.map((item) => item.id)));
      } else {
        setSelectedItems(new Set());
      }
    },
    [items]
  );

  const handleSelectItem = React.useCallback((itemId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  }, []);

  const handleOpenDiscountModal = React.useCallback(() => {
    if (selectedItems.size === 0) {
      toast.error("Please select at least one item to edit discount!");
      return;
    }
    setIsDiscountModalOpen(true);
  }, [selectedItems]);

  const handleRowClick = React.useCallback(
    (item: InvoiceItem) => {
      setSelectedItem(item);
      setIsEditLineItemModalOpen(true);
    },
    []
  );

  const handleSaveItem = React.useCallback(
    (updatedItem: InvoiceItem) => {
      if (onSaveItem) {
        onSaveItem(updatedItem);
      }
      setIsEditLineItemModalOpen(false);
      setSelectedItem(null);
    },
    [onSaveItem]
  );

  const handleDeleteItem = React.useCallback(
    (itemId: string) => {
      if (onDeleteItem) {
        onDeleteItem(itemId);
      }
      setIsEditLineItemModalOpen(false);
      setSelectedItem(null);
    },
    [onDeleteItem]
  );

  // Controls whether we show the compact (Description / Qty / Price) view or the full detail view
  const [isExpanded, setIsExpanded] = React.useState(false);

  const baseSelectColumn: ColumnDef<InvoiceItem> = React.useMemo(
    () => ({
      id: "select",
      header: () => {
        const allSelected = items.length > 0 && items.every((item) => selectedItems.has(item.id));
        const someSelected = items.some((item) => selectedItems.has(item.id));

        return (
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="cursor-default flex items-center justify-center w-full"
          >
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              aria-label="Select all"
              className={
                someSelected && !allSelected ? "data-[state=indeterminate]:bg-primary" : ""
              }
            />
          </div>
        );
      },
      cell: ({ row }) => (
        <div 
          onClick={(e) => e.stopPropagation()} 
          onMouseDown={(e) => e.stopPropagation()}
          className="cursor-default flex items-center justify-center w-full"
        >
          <Checkbox
            checked={selectedItems.has(row.original.id)}
            onCheckedChange={(checked) =>
              handleSelectItem(row.original.id, checked as boolean)
            }
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      enableSorting: false,
      size: 50,
    }),
    [handleSelectAll, handleSelectItem, items, selectedItems]
  );

  const columns = React.useMemo<ColumnDef<InvoiceItem>[]>(() => {
    const descriptionColumn: ColumnDef<InvoiceItem> = {
      accessorKey: "description",
      header: "Description",
      cell: ({ getValue }) => {
        const value = getValue() as string;
        return <span>{value}</span>;
      },
    };

    const qtyColumn: ColumnDef<InvoiceItem> = {
      accessorKey: "qty",
      header: "Qty",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return value.toFixed(1);
      },
    };

    const priceColumn: ColumnDef<InvoiceItem> = {
      accessorKey: "price",
      header: "Price",
      cell: ({ getValue }) => formatCurrency(getValue() as number),
    };

    if (!isExpanded) {
      // Compact view: Checkbox + Description + Qty + Price
      return [baseSelectColumn, descriptionColumn, qtyColumn, priceColumn];
    }

    // Expanded view: show all columns like the reference UI
    return [
      baseSelectColumn,
      {
        accessorKey: "royalty",
        header: "Royalty",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return <span>{value || "No"}</span>;
        },
      },
      {
        accessorKey: "free",
        header: "Free",
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return <span>{value || ""}</span>;
        },
      },
      descriptionColumn,
      qtyColumn,
      {
        accessorKey: "discount",
        header: "Discount",
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return value !== undefined ? formatCurrency(value) : "$0.00";
        },
      },
      {
        accessorKey: "taxStatus",
        header: "Tax Status",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return <span>{value || "No Tax"}</span>;
        },
      },
      {
        accessorKey: "tax",
        header: "Tax",
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return formatCurrency(value || 0);
        },
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return value !== undefined ? formatCurrency(value) : "$0.00";
        },
      },
      {
        accessorKey: "cost",
        header: "Cost",
        cell: ({ getValue }) => {
          const value = getValue() as number | undefined;
          return value !== undefined ? formatCurrency(value) : "$0.00";
        },
      },
      priceColumn,
    ];
  }, [baseSelectColumn, isExpanded]);

  return (
    <SectionCard
      title="Items"
      isLoading={isLoading}
      className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
      headerActions={
        <div className="flex flex-col items-center gap-1 mt-1">
          {/* Down arrow for dropdown menu - on top */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem disabled>Add Item...</DropdownMenuItem>
              <DropdownMenuItem disabled>Edit Tax...</DropdownMenuItem>
              <DropdownMenuItem onClick={handleOpenDiscountModal}>
                Edit Discount...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Collapse/expand arrow - below */}
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-label={isExpanded ? "Hide item details" : "Show item details"}
            className="h-8 w-8 flex items-center justify-center rounded-md border border-transparent hover:bg-primary/10 transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-[hsl(var(--primary))]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[hsl(var(--primary))]" />
            )}
          </button>
        </div>
      }
    >
      <div className="px-4 pb-2">
        <CustomTable
          data={items}
          columns={columns}
          isLoading={isLoading}
          size="compact"
          variant="default"
          enableSearch={false}
          enableFilter={false}
          enablePrint={false}
          enableExport={false}
          enableSorting={isExpanded}
          hideRecordCount={true}
          stickyHeader={isExpanded}
          maxHeight={isExpanded ? "400px" : undefined}
          onRowClick={handleRowClick}
          rowClassName="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        />
      </div>
      <InvoiceDiscountModal
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onSave={
          onSaveDiscount
            ? (discountData) => {
                onSaveDiscount(Array.from(selectedItems), discountData);
              }
            : undefined
        }
      />
      <EditLineItemModal
        open={isEditLineItemModalOpen}
        onClose={() => {
          setIsEditLineItemModalOpen(false);
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={onSaveItem ? handleSaveItem : undefined}
        onDelete={onDeleteItem ? handleDeleteItem : undefined}
      />
    </SectionCard>
  );
});


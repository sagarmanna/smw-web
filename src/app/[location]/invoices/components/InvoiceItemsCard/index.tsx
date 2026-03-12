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
import type { InvoiceItem } from "../../types";
import { InvoiceDiscountModal, DiscountData } from "../modals/InvoiceDiscountModal";
import { EditLineItemModal } from "../modals/EditLineItemModal";
import { AddLineItemsModal } from "../modals/AddLineItemsModal";
import { EditItemTaxModal, ItemTaxStatus } from "../modals/EditItemTaxModal";
import type { InvoiceItemsTaxEditConfigData } from "../../[id]/invoices-details.api";
import type { ItemRow } from "../../../items/itemsListing.api";
import { toast } from "sonner";
import { TOAST_MESSAGES } from "../../utils/constants";

interface InvoiceItemsCardProps {
  location: string;
  items: InvoiceItem[];
  isLoading?: boolean;
  isVoided?: boolean;
  isReturned?: boolean;
  lockItemAndTaxActions?: boolean;
  hasNoCustomer?: boolean;
  onSaveDiscount?: (selectedItemIds: string[], discountData: DiscountData) => Promise<boolean>;
  onSaveItem?: (item: InvoiceItem) => void;
  onSaveItemTax?: (selectedItemIds: string[], taxStatus: string) => Promise<{ success: boolean; taxRate: number }>;
  onLoadItemTaxOptions?: (selectedItemIds: string[]) => Promise<InvoiceItemsTaxEditConfigData | null>;
  onDeleteItem?: (itemId: string) => void;
}

export const InvoiceItemsCard = React.memo(function InvoiceItemsCard({
  location,
  items,
  isLoading = false,
  isVoided = false,
  isReturned = false,
  lockItemAndTaxActions = false,
  hasNoCustomer = false,
  onSaveDiscount,
  onSaveItem,
  onSaveItemTax,
  onLoadItemTaxOptions,
  onDeleteItem,
}: InvoiceItemsCardProps) {
  const isItemAndTaxActionsLocked = isVoided || isReturned || lockItemAndTaxActions;

  const [selectedItems, setSelectedItems] = React.useState<Set<string>>(new Set());
  const [isDiscountModalOpen, setIsDiscountModalOpen] = React.useState(false);
  const [isEditTaxModalOpen, setIsEditTaxModalOpen] = React.useState(false);
  const [isEditLineItemModalOpen, setIsEditLineItemModalOpen] = React.useState(false);
  const [isAddLineItemsModalOpen, setIsAddLineItemsModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<InvoiceItem | null>(null);
  const [taxRateOverrides, setTaxRateOverrides] = React.useState<Record<string, number>>({});
  const [modalTaxStatusOptions, setModalTaxStatusOptions] = React.useState<string[]>([]);
  const [modalInitialTaxStatus, setModalInitialTaxStatus] = React.useState<string>("Default");

  const fallbackTaxStatusOptions = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      const status = (item.taxStatus || "").trim();
      if (status) {
        set.add(status);
      }
    });

    return Array.from(set);
  }, [items]);

  const taxRateByStatus = React.useMemo(() => {
    const derived: Record<string, number> = {};

    items.forEach((item) => {
      const status = (item.taxStatus || "").trim();
      if (!status) return;

      const price = Number(item.price || 0);
      const tax = Number(item.tax || 0);

      if (price > 0) {
        derived[status] = Number(((tax / price) * 100).toFixed(2));
      }
    });

    return {
      ...derived,
      ...taxRateOverrides,
    };
  }, [items, taxRateOverrides]);

  const selectedTaxStatus = React.useMemo(() => {
    for (const item of items) {
      if (!selectedItems.has(item.id)) continue;
      const status = (item.taxStatus || "").trim();
      if (status) return status;
    }
    return "Default";
  }, [items, selectedItems]);

  const effectiveModalTaxStatusOptions = React.useMemo(() => {
    const options = modalTaxStatusOptions.filter((option) => option.trim().length > 0);
    if (!options.includes(modalInitialTaxStatus)) {
      return [modalInitialTaxStatus, ...options];
    }
    return options;
  }, [modalInitialTaxStatus, modalTaxStatusOptions]);

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
    if (isVoided) return;
    if (selectedItems.size === 0) {
      toast.error(TOAST_MESSAGES.ERROR.ITEM_SELECTION_REQUIRED);
      return;
    }
    setIsDiscountModalOpen(true);
  }, [selectedItems, isVoided]);

  const handleOpenAddItemModal = React.useCallback(() => {
    if (isItemAndTaxActionsLocked) return;
    setIsAddLineItemsModalOpen(true);
  }, [isItemAndTaxActionsLocked]);

  const handleOpenEditTaxModal = React.useCallback(async () => {
    if (isItemAndTaxActionsLocked) return;
    if (selectedItems.size === 0) {
      toast.error(TOAST_MESSAGES.ERROR.ITEM_TAX_SELECTION_REQUIRED);
      return;
    }

    const selectedIds = Array.from(selectedItems);
    setModalInitialTaxStatus(selectedTaxStatus);
    setModalTaxStatusOptions(fallbackTaxStatusOptions);

    if (onLoadItemTaxOptions) {
      const taxConfig = await onLoadItemTaxOptions(selectedIds);
      if (taxConfig) {
        setModalInitialTaxStatus(taxConfig.currentTaxStatus || selectedTaxStatus);

        if (taxConfig.currentTaxStatus) {
          setTaxRateOverrides((prev) => ({
            ...prev,
            [taxConfig.currentTaxStatus]: Number(taxConfig.currentTaxRate || 0),
          }));
        }

        if (taxConfig.availableTaxStatuses.length > 0) {
          setModalTaxStatusOptions(taxConfig.availableTaxStatuses.map((status) => status.name));
          setTaxRateOverrides((prev) => {
            const next = { ...prev };
            taxConfig.availableTaxStatuses.forEach((status) => {
              next[status.name] = Number(status.rate || 0);
            });
            return next;
          });
        }
      }
    }

    setIsEditTaxModalOpen(true);
  }, [
    fallbackTaxStatusOptions,
    isItemAndTaxActionsLocked,
    onLoadItemTaxOptions,
    selectedItems,
    selectedTaxStatus,
  ]);

  const handleSaveItemTax = React.useCallback(
    async (taxStatus: ItemTaxStatus) => {
      if (!onSaveItemTax) return false;

      const selectedIds = Array.from(selectedItems);
      const result = await onSaveItemTax(selectedIds, taxStatus);

      if (result.success) {
        setTaxRateOverrides((prev) => ({
          ...prev,
          [taxStatus]: result.taxRate,
        }));
        setIsExpanded(true);
        return true;
      }

      return false;
    },
    [onSaveItemTax, selectedItems]
  );

  const handleRowClick = React.useCallback(
    (item: InvoiceItem) => {
      if (isVoided) return;
      setSelectedItem(item);
      setIsEditLineItemModalOpen(true);
    },
    [isVoided]
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

  const handleAddItemFromList = React.useCallback(
    (item: ItemRow) => {
      if (!onSaveItem) return;

      const now = Date.now();
      const generatedId = `${item.id}-${now}`;
      const price = Number(item.price || 0);

      const newItem: InvoiceItem = {
        id: generatedId,
        code: item.code,
        description: item.description,
        qty: 1,
        price,
        unitPrice: price,
        cost: 0,
        discount: 0,
        tax: 0,
        taxStatus: item.tax || "No Tax",
        royalty: item.royaltyFree || "No",
      };

      onSaveItem(newItem);
    },
    [onSaveItem]
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
        header: "Royalty Free",
        enableSorting: true,
        cell: ({ getValue }) => {
          const value = getValue() as string | undefined;
          return <span>{value || "No"}</span>;
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
              {items.length === 0 ? (
                <DropdownMenuItem onClick={handleOpenAddItemModal} disabled={isItemAndTaxActionsLocked}>
                  Add Item...
                </DropdownMenuItem>
              ) : (
                <>
                  <DropdownMenuItem onClick={handleOpenAddItemModal} disabled={isItemAndTaxActionsLocked}>
                    Add Item...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleOpenEditTaxModal} disabled={isItemAndTaxActionsLocked}>
                    Edit Tax...
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleOpenDiscountModal}
                    disabled={isVoided}
                  >
                    Edit Discount...
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Collapse/expand arrow - below */}
          {(!hasNoCustomer || items.length > 0) && (
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
          )}
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
          onRowClick={isVoided ? undefined : handleRowClick}
          rowClassName={isVoided ? "" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"}
        />
      </div>
      <InvoiceDiscountModal
        location={location}
        selectedItemIds={Array.from(selectedItems)}
        open={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        onSave={
          onSaveDiscount
            ? (discountData) => {
                return onSaveDiscount(Array.from(selectedItems), discountData);
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
      <AddLineItemsModal
        open={isAddLineItemsModalOpen}
        onClose={() => setIsAddLineItemsModalOpen(false)}
        location={location}
        onSelectItem={handleAddItemFromList}
      />
      <EditItemTaxModal
        open={isEditTaxModalOpen}
        onClose={() => setIsEditTaxModalOpen(false)}
        onSave={onSaveItemTax ? handleSaveItemTax : undefined}
        initialTaxStatus={modalInitialTaxStatus}
        taxStatusOptions={effectiveModalTaxStatusOptions}
        taxRateByStatus={taxRateByStatus}
      />
    </SectionCard>
  );
});


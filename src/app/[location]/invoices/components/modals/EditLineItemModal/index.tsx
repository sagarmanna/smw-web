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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import type { InvoiceItem } from "../../../types";

interface EditLineItemModalProps {
  open: boolean;
  onClose: () => void;
  item: InvoiceItem | null;
  onSave?: (updatedItem: InvoiceItem) => void;
  onDelete?: (itemId: string) => void;
}

export function EditLineItemModal({
  open,
  onClose,
  item,
  onSave,
  onDelete,
}: EditLineItemModalProps) {
  const [code, setCode] = React.useState<string>("");
  const [description, setDescription] = React.useState<string>("");
  const [price, setPrice] = React.useState<string>("");
  const [cost, setCost] = React.useState<string>("");
  const [quantity, setQuantity] = React.useState<string>("");
  const [royaltyFree, setRoyaltyFree] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Initialize form when modal opens or item changes
  React.useEffect(() => {
    if (open && item) {
      setCode(item.code || "LESSON");
      setDescription(item.description || "");
      setPrice((item.unitPrice || item.price / (item.qty || 1)).toString());
      setCost((item.cost || 0).toString());
      setQuantity((item.qty || 0).toString());
      setRoyaltyFree(item.royalty === "Yes");
      setIsSaving(false);
    }
  }, [open, item]);

  const handleSave = React.useCallback(async () => {
    if (!item || !onSave) return;

    setIsSaving(true);
    try {
      const updatedItem: InvoiceItem = {
        ...item,
        description,
        qty: parseFloat(quantity) || 0,
        unitPrice: parseFloat(price) || 0,
        cost: parseFloat(cost) || 0,
        price: (parseFloat(price) || 0) * (parseFloat(quantity) || 0),
        royalty: royaltyFree ? "Yes" : "No",
        // Preserve code if it exists in the item
        ...(item.code !== undefined && { code: code }),
      };

      await onSave(updatedItem);
      onClose();
    } catch {
      // Error handling is done in the parent handler
      setIsSaving(false);
    }
  }, [item, description, quantity, price, cost, royaltyFree, onSave, onClose, code]);

  const handleDeleteClick = React.useCallback(() => {
    if (!item || !onDelete) return;
    setShowDeleteConfirm(true);
  }, [item, onDelete]);

  const handleDeleteConfirm = React.useCallback(() => {
    if (!item || !onDelete) return;

    setIsDeleting(true);
    try {
      onDelete(item.id);
      setShowDeleteConfirm(false);
      onClose();
    } catch {
      // Error handling is done in the parent handler
      setIsDeleting(false);
    }
  }, [item, onDelete, onClose]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle id="edit-line-item-modal-title">Edit Line Item</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          aria-labelledby="edit-line-item-modal-title"
          className="space-y-4"
        >
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="LESSON"
              disabled
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Price, Cost, Quantity */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>

          {/* Royalty Free */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="royalty-free"
              checked={royaltyFree}
              onCheckedChange={(checked) => setRoyaltyFree(checked as boolean)}
            />
            <Label
              htmlFor="royalty-free"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Royalty Free
            </Label>
          </div>

          <DialogFooter className="w-full">
            <div className="w-full flex items-center justify-between">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteClick}
                disabled={!onDelete || isSaving}
              >
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          if (isDeleting) return;
          setShowDeleteConfirm(open);
        }}
        title="Are you sure you want to delete this line item?"
        description="This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </Dialog>
  );
}


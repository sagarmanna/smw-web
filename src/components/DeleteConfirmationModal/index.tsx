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

interface DeleteConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string | React.ReactNode;
  itemLabel?: string;
  onConfirm: () => void;
  isDeleting?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}

export function DeleteConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  itemLabel,
  onConfirm,
  isDeleting = false,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: DeleteConfirmationModalProps) {
  const handleConfirm = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const defaultTitle = title || "Are you sure you want to delete this item?";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">{defaultTitle}</DialogTitle>
        </DialogHeader>
        {(description || itemLabel) && (
          <div className="py-2">
            {description ? (
              <div className="text-sm text-muted-foreground">{description}</div>
            ) : itemLabel ? (
              <p className="text-sm text-muted-foreground">{itemLabel}</p>
            ) : null}
          </div>
        )}
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel} disabled={isDeleting}>
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Deleting..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


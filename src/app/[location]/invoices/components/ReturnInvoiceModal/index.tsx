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

interface ReturnInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isReturning?: boolean;
}

export function ReturnInvoiceModal({
  open,
  onOpenChange,
  onConfirm,
  isReturning = false,
}: ReturnInvoiceModalProps) {
  const handleConfirm = React.useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base">
            Are you sure you want to return this invoice?
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel} disabled={isReturning}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={isReturning}
            className="bg-primary hover:bg-primary/90"
          >
            {isReturning ? "Returning..." : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


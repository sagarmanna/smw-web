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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface VoidInvoiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isVoiding?: boolean;
}

export function VoidInvoiceModal({
  open,
  onOpenChange,
  onConfirm,
  isVoiding = false,
}: VoidInvoiceModalProps) {
  const [isVoidChecked, setIsVoidChecked] = React.useState(false);

  // Reset checkbox when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setIsVoidChecked(false);
    }
  }, [open]);

  const handleConfirm = React.useCallback(() => {
    if (!isVoidChecked) return;
    onConfirm();
  }, [isVoidChecked, onConfirm]);

  const handleCancel = React.useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base" id="void-invoice-title">
            Do you want to void invoice?
          </DialogTitle>
        </DialogHeader>
        <div className="py-4" role="region" aria-labelledby="void-invoice-title">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="void-invoice"
              checked={isVoidChecked}
              onCheckedChange={(checked) => setIsVoidChecked(checked === true)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              aria-describedby="void-invoice-description"
            />
            <Label
              htmlFor="void-invoice"
              id="void-invoice-description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Void Invoice
            </Label>
          </div>
        </div>
        <DialogFooter className="flex items-center justify-end gap-2">
          <Button variant="secondary" onClick={handleCancel} disabled={isVoiding}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={!isVoidChecked || isVoiding}
            className="bg-primary hover:bg-primary/90"
          >
            {isVoiding ? "Voiding..." : "OK"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


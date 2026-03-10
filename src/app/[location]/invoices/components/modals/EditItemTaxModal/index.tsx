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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ItemTaxStatus = string;

interface EditItemTaxModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (taxStatus: ItemTaxStatus) => Promise<boolean | void> | boolean | void;
  initialTaxStatus?: ItemTaxStatus;
  taxStatusOptions?: ItemTaxStatus[];
  taxRateByStatus?: Record<string, number>;
}

export function EditItemTaxModal({
  open,
  onClose,
  onSave,
  initialTaxStatus = "Default",
  taxStatusOptions = [],
  taxRateByStatus = {},
}: EditItemTaxModalProps) {
  const [taxStatus, setTaxStatus] = React.useState<ItemTaxStatus>(initialTaxStatus);

  React.useEffect(() => {
    if (open) {
      setTaxStatus(initialTaxStatus);
    }
  }, [open, initialTaxStatus]);

  const handleSave = React.useCallback(async () => {
    const result = await onSave?.(taxStatus);
    if (result === false) {
      return;
    }
    onClose();
  }, [onSave, onClose, taxStatus]);

  const displayTaxRate = Number.isFinite(taxRateByStatus[taxStatus])
    ? taxRateByStatus[taxStatus]
    : 0;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Tax</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="item-tax-status" className="text-base font-semibold">Tax Status</Label>
            <Select value={taxStatus} onValueChange={(value) => setTaxStatus(value as ItemTaxStatus)}>
              <SelectTrigger id="item-tax-status" className="w-[220px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taxStatusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-base font-semibold">Tax Rate</Label>
            <span className="text-2xl font-semibold">{displayTaxRate} %</span>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

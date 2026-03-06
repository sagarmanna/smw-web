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

export type ItemTaxStatus = "No Tax" | "GST Only";

interface EditItemTaxModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (taxStatus: ItemTaxStatus) => void;
  initialTaxStatus?: ItemTaxStatus;
}

const TAX_RATE_MAP: Record<ItemTaxStatus, number> = {
  "No Tax": 0,
  "GST Only": 5,
};

export function EditItemTaxModal({
  open,
  onClose,
  onSave,
  initialTaxStatus = "GST Only",
}: EditItemTaxModalProps) {
  const [taxStatus, setTaxStatus] = React.useState<ItemTaxStatus>(initialTaxStatus);

  React.useEffect(() => {
    if (open) {
      setTaxStatus(initialTaxStatus);
    }
  }, [open, initialTaxStatus]);

  const handleSave = React.useCallback(() => {
    onSave?.(taxStatus);
    onClose();
  }, [onSave, onClose, taxStatus]);

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
                <SelectItem value="No Tax">No Tax</SelectItem>
                <SelectItem value="GST Only">GST Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label className="text-base font-semibold">Tax Rate</Label>
            <span className="text-2xl font-semibold">{TAX_RATE_MAP[taxStatus]} %</span>
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

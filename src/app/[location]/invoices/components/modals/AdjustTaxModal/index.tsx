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
import { formatCurrency } from "@/utils/formatCurrency";

export interface TaxAdjustmentData {
  adjustment: number;
}

interface AdjustTaxModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (adjustmentData: TaxAdjustmentData) => void;
  currentTax: number;
}

export function AdjustTaxModal({
  open,
  onClose,
  onSave,
  currentTax,
}: AdjustTaxModalProps) {
  const [adjustment, setAdjustment] = React.useState<string>("");

  // Reset adjustment to zero when modal opens (user starts fresh adjustment)
  React.useEffect(() => {
    if (open) {
      setAdjustment("0.00");
    }
  }, [open]);

  const adjustmentValue = parseFloat(adjustment) || 0;
  const adjustedTax = currentTax + adjustmentValue;

  const handleCancel = () => {
    setAdjustment("");
    onClose();
  };

  const handleSave = () => {
    if (!onSave) {
      handleCancel();
      return;
    }

    const adjustmentData: TaxAdjustmentData = {
      adjustment: adjustmentValue,
    };

    onSave(adjustmentData);
    handleCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle id="adjust-tax-title">Adjust Tax</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4" role="region" aria-labelledby="adjust-tax-title">
          <div className="space-y-2">
            <Label htmlFor="tax-calculated">Tax Calculated</Label>
            <Input
              id="tax-calculated"
              value={formatCurrency(currentTax)}
              disabled
              className="bg-muted"
              aria-describedby="tax-calculated-description"
            />
            <p id="tax-calculated-description" className="sr-only">
              The current tax amount on the invoice
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjustment">Adjustment</Label>
            <div className="flex items-center gap-2">
              <div
                className="flex h-10 items-center rounded-md border border-input bg-muted px-3 text-sm text-foreground"
                aria-hidden="true"
              >
                +/- $
              </div>
              <Input
                id="adjustment"
                type="number"
                step="0.01"
                value={adjustment}
                onChange={(e) => setAdjustment(e.target.value)}
                placeholder="0.00"
                className="flex-1"
                aria-describedby="adjustment-description"
              />
            </div>
            <p id="adjustment-description" className="sr-only">
              Enter a positive or negative tax adjustment amount.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="adjusted-tax">Adjusted Tax</Label>
            <Input
              id="adjusted-tax"
              value={formatCurrency(adjustedTax)}
              disabled
              className="bg-muted"
              aria-describedby="adjusted-tax-description"
            />
            <p id="adjusted-tax-description" className="sr-only">
              The final tax amount after adjustment
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
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


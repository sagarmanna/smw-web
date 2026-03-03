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
  taxCalculated: number;
  currentTax: number;
}

export function AdjustTaxModal({
  open,
  onClose,
  onSave,
  taxCalculated,
  currentTax,
}: AdjustTaxModalProps) {
  const [adjustment, setAdjustment] = React.useState<string>("");
  const [isPositive, setIsPositive] = React.useState<boolean>(true);

  // Reset adjustment to zero when modal opens (user starts fresh adjustment)
  React.useEffect(() => {
    if (open) {
      setAdjustment("0.00");
      setIsPositive(true);
    }
  }, [open]);

  const handleToggleSign = () => {
    setIsPositive((prev) => !prev);
  };

  const adjustmentValue = parseFloat(adjustment) || 0;
  const adjustedTax = currentTax + (isPositive ? adjustmentValue : -adjustmentValue);

  const handleCancel = () => {
    setAdjustment("");
    setIsPositive(true);
    onClose();
  };

  const handleSave = () => {
    if (!onSave) {
      handleCancel();
      return;
    }

    const adjustmentData: TaxAdjustmentData = {
      adjustment: isPositive ? adjustmentValue : -adjustmentValue,
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
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleToggleSign}
                className="px-3"
                aria-label={isPositive ? "Make adjustment negative" : "Make adjustment positive"}
                aria-pressed={isPositive}
              >
                {isPositive ? "+" : "-"} $
              </Button>
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
              Enter the tax adjustment amount. Use the +/- button to toggle between positive and negative adjustment.
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


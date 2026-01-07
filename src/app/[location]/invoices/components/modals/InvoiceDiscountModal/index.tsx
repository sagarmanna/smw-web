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
import { SegmentedControl } from "@/components/ui/segmented-control";

export interface DiscountData {
  paymentFrequencyDiscountPercent: number;
  customerDiscountPercent: number;
  multipleEnrollmentDiscountAmount: number;
  lineItemDiscountType: "fixed" | "percentage";
  lineItemDiscountValue: number;
}

interface InvoiceDiscountModalProps {
  open: boolean;
  onClose: () => void;
  onSave?: (discountData: DiscountData) => void;
}

export function InvoiceDiscountModal({ open, onClose, onSave }: InvoiceDiscountModalProps) {
  const [paymentFrequencyDiscountPercent, setPaymentFrequencyDiscountPercent] =
    React.useState<string>("");
  const [customerDiscountPercent, setCustomerDiscountPercent] =
    React.useState<string>("");
  const [multipleEnrollmentDiscountAmount, setMultipleEnrollmentDiscountAmount] =
    React.useState<string>("");
  const [lineItemDiscountType, setLineItemDiscountType] =
    React.useState<"fixed" | "percentage">("fixed");
  const [lineItemDiscountValue, setLineItemDiscountValue] =
    React.useState<string>("");

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setPaymentFrequencyDiscountPercent("");
      setCustomerDiscountPercent("");
      setMultipleEnrollmentDiscountAmount("");
      setLineItemDiscountType("fixed");
      setLineItemDiscountValue("");
    }
  }, [open]);

  const hasAnyValue =
    !!paymentFrequencyDiscountPercent ||
    !!customerDiscountPercent ||
    !!multipleEnrollmentDiscountAmount ||
    !!lineItemDiscountValue;

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
    if (!onSave) {
      onClose();
      return;
    }

    const discountData: DiscountData = {
      paymentFrequencyDiscountPercent: parseFloat(paymentFrequencyDiscountPercent) || 0,
      customerDiscountPercent: parseFloat(customerDiscountPercent) || 0,
      multipleEnrollmentDiscountAmount: parseFloat(multipleEnrollmentDiscountAmount) || 0,
      lineItemDiscountType,
      lineItemDiscountValue: parseFloat(lineItemDiscountValue) || 0,
    };

    onSave(discountData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Discounts</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Frequency Discount */}
          <div className="flex items-center justify-between gap-4">
            <Label className="font-semibold">Payment Frequency Discount</Label>
            <div className="flex items-center gap-2 w-64">
              <Input
                type="number"
                value={paymentFrequencyDiscountPercent}
                onChange={(e) => setPaymentFrequencyDiscountPercent(e.target.value)}
                placeholder="0"
                className="text-right"
                min="0"
                max="100"
                step="0.01"
              />
              <span className="w-6 text-sm text-muted-foreground text-center">%</span>
            </div>
          </div>

          {/* Customer Discount */}
          <div className="flex items-center justify-between gap-4">
            <Label className="font-semibold">Customer Discount</Label>
            <div className="flex items-center gap-2 w-64">
              <Input
                type="number"
                value={customerDiscountPercent}
                onChange={(e) => setCustomerDiscountPercent(e.target.value)}
                placeholder="0"
                className="text-right"
                min="0"
                max="100"
                step="0.01"
              />
              <span className="w-6 text-sm text-muted-foreground text-center">%</span>
            </div>
          </div>

          {/* Multiple Enrollment Discount */}
          <div className="flex items-center justify-between gap-4">
            <Label className="font-semibold">Multiple Enrollment Discount</Label>
            <div className="flex items-center gap-2 w-64">
              <span className="w-4 text-sm text-muted-foreground text-center">$</span>
              <Input
                type="number"
                value={multipleEnrollmentDiscountAmount}
                onChange={(e) =>
                  setMultipleEnrollmentDiscountAmount(e.target.value)
                }
                placeholder="0"
                className="text-right"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Line Item Discount */}
          <div className="flex items-center justify-between gap-4">
            <Label className="font-semibold">Line Item Discount</Label>
            <div className="flex items-center gap-3 w-72 justify-end">
              <SegmentedControl
                options={[
                  { value: "fixed" as const, label: "$" },
                  { value: "percentage" as const, label: "%" },
                ]}
                value={lineItemDiscountType}
                onValueChange={(value) => setLineItemDiscountType(value)}
                variant="default"
              />

              <div className="flex items-center gap-2 w-40">
                <span className="w-4 text-sm text-muted-foreground text-center">
                  {lineItemDiscountType === "fixed" ? "$" : "%"}
                </span>
                <Input
                  type="number"
                  value={lineItemDiscountValue}
                  onChange={(e) => setLineItemDiscountValue(e.target.value)}
                  placeholder="0"
                  className="text-right"
                  min="0"
                  max={lineItemDiscountType === "percentage" ? 100 : undefined}
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasAnyValue}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
import {
  extractInvoiceLineItemsDiscountValues,
  getInvoiceLineItemsDiscount,
} from "../../../[id]/invoices-details.api";

function formatNumericInputValue(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return "";
  }

  return String(parsed);
}

export interface DiscountData {
  paymentFrequencyDiscountPercent: number;
  customerDiscountPercent: number;
  multipleEnrollmentDiscountAmount: number;
  lineItemDiscountType: "fixed" | "percentage";
  lineItemDiscountValue: number;
}

interface InvoiceDiscountModalProps {
  location: string;
  selectedItemIds: string[];
  open: boolean;
  onClose: () => void;
  onSave?: (discountData: DiscountData) => Promise<boolean>;
}

export function InvoiceDiscountModal({
  location,
  selectedItemIds,
  open,
  onClose,
  onSave,
}: InvoiceDiscountModalProps) {
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
  const [isLessonItem, setIsLessonItem] = React.useState(false);
  const [isLoadingDiscount, setIsLoadingDiscount] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset form and fetch current discount values when modal opens.
  React.useEffect(() => {
    if (!open) {
      setPaymentFrequencyDiscountPercent("");
      setCustomerDiscountPercent("");
      setMultipleEnrollmentDiscountAmount("");
      setLineItemDiscountType("fixed");
      setLineItemDiscountValue("");
      setIsLessonItem(false);
      return;
    }

    const lineItemIds = selectedItemIds
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    if (lineItemIds.length === 0) {
      return;
    }

    let isCancelled = false;
    setIsLoadingDiscount(true);

    getInvoiceLineItemsDiscount(location, lineItemIds)
      .then((response) => {
        if (isCancelled) {
          return;
        }

        const body = extractInvoiceLineItemsDiscountValues(response);
        if (!body) {
          return;
        }

        setIsLessonItem(body.isLessonItem === true);
        setPaymentFrequencyDiscountPercent(formatNumericInputValue(body.paymentFrequencyDiscount));
        setCustomerDiscountPercent(formatNumericInputValue(body.customerDiscount));
        setMultipleEnrollmentDiscountAmount(formatNumericInputValue(body.multiEnrolmentDiscount));
        setLineItemDiscountValue(formatNumericInputValue(body.lineItemDiscount));
        setLineItemDiscountType(body.lineItemDiscountValueType === 1 ? "percentage" : "fixed");
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingDiscount(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [open, location, selectedItemIds]);

  const hasAnyValue =
    !!paymentFrequencyDiscountPercent ||
    !!customerDiscountPercent ||
    !!multipleEnrollmentDiscountAmount ||
    !!lineItemDiscountValue;

  const handleCancel = () => {
    onClose();
  };

  const handleSave = async () => {
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

    setIsSaving(true);
    try {
      const success = await onSave(discountData);
      if (success) {
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Discounts</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isLoadingDiscount && (
            <p className="text-sm text-muted-foreground">Loading discount values...</p>
          )}
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

          {/* Lesson-only discount fields */}
          {isLessonItem && (
            <>
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
            </>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasAnyValue || isSaving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


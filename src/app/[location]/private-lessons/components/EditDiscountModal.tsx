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
import type { PrivateLessonRow } from "../privateLessonsListing.api";
import { calculateDiscountPreview } from "../utils/discountCalculations";
import type { LessonDiscountData } from "../privateLessonsListing.slice";

// Re-export for convenience
export type PrivateLessonsDiscountFormData = LessonDiscountData;

interface EditDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLessons: PrivateLessonRow[];
  onSave: (data: PrivateLessonsDiscountFormData, lessonIds: number[]) => void;
  initialDiscountData?: PrivateLessonsDiscountFormData;
}

export function EditDiscountModal({
  open,
  onOpenChange,
  selectedLessons,
  onSave,
  initialDiscountData,
}: EditDiscountModalProps) {
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

  // Load initial discount data when modal opens
  React.useEffect(() => {
    if (open && initialDiscountData) {
      // Restore previous discount data
      setPaymentFrequencyDiscountPercent(initialDiscountData.paymentFrequencyDiscountPercent || "");
      setCustomerDiscountPercent(initialDiscountData.customerDiscountPercent || "");
      setMultipleEnrollmentDiscountAmount(initialDiscountData.multipleEnrollmentDiscountAmount || "");
      setLineItemDiscountType(initialDiscountData.lineItemDiscountType || "fixed");
      setLineItemDiscountValue(initialDiscountData.lineItemDiscountValue || "");
    } else if (!open) {
      // Reset form when modal closes
      setPaymentFrequencyDiscountPercent("");
      setCustomerDiscountPercent("");
      setMultipleEnrollmentDiscountAmount("");
      setLineItemDiscountType("fixed");
      setLineItemDiscountValue("");
    }
  }, [open, initialDiscountData]);

  // Prepare discount data object for calculations
  const discountData = React.useMemo<PrivateLessonsDiscountFormData>(
    () => ({
      paymentFrequencyDiscountPercent,
      customerDiscountPercent,
      multipleEnrollmentDiscountAmount,
      lineItemDiscountType,
      lineItemDiscountValue,
    }),
    [
      paymentFrequencyDiscountPercent,
      customerDiscountPercent,
      multipleEnrollmentDiscountAmount,
      lineItemDiscountType,
      lineItemDiscountValue,
    ]
  );

  // Calculate total discount amount and new price for preview
  const discountPreview = React.useMemo(() => {
    if (selectedLessons.length === 0) return null;

    // Use the first lesson's price as reference
    const firstLessonPrice = selectedLessons[0]?.price || "0";
    const preview = calculateDiscountPreview(firstLessonPrice, discountData);

    return {
      ...preview,
      affectedLessons: selectedLessons.length,
    };
  }, [selectedLessons, discountData]);

  const handleSave = () => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);

    onSave(
      {
        paymentFrequencyDiscountPercent,
        customerDiscountPercent,
        multipleEnrollmentDiscountAmount,
        lineItemDiscountType,
        lineItemDiscountValue,
      },
      lessonIds
    );

    onOpenChange(false);
  };

  const hasAnyValue =
    !!paymentFrequencyDiscountPercent ||
    !!customerDiscountPercent ||
    !!multipleEnrollmentDiscountAmount ||
    !!lineItemDiscountValue;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Payment Frequency Discount */}
          <div className="flex items-center justify-between gap-4">
            <Label className="font-semibold">
              Payment Frequency Discount
            </Label>
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
              <span className="w-6 text-sm text-muted-foreground text-center">
                %
              </span>
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
              <span className="w-6 text-sm text-muted-foreground text-center">
                %
              </span>
            </div>
          </div>

          {/* Multiple Enrollment Discount */}
          <div className="flex items-center justify-between gap-4">
            <Label className="font-semibold">
              Multiple Enrollment Discount
            </Label>
            <div className="flex items-center gap-2 w-64">
              <span className="w-4 text-sm text-muted-foreground text-center">
                $
              </span>
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

          {/* Discount Preview */}
          {hasAnyValue && discountPreview && (
            <div className="mt-6 p-4 bg-muted rounded-lg border">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Original Price:</span>
                  <span className="text-sm">${discountPreview.originalPrice}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Discount Amount:</span>
                  <span className="text-sm text-green-600 dark:text-green-400">
                    -${discountPreview.discountAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-base font-semibold">New Price:</span>
                  <span className="text-base font-semibold">
                    ${discountPreview.newPrice}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground pt-1">
                  Applied to {discountPreview.affectedLessons} lesson
                  {discountPreview.affectedLessons !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
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



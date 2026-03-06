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
import type { LessonDiscountData } from "../privateLessonsListing.slice";
import { getDiscountValues } from "../actionApi/discount.api";

// Re-export for convenience
export type PrivateLessonsDiscountFormData = LessonDiscountData;

interface EditDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  selectedLessons: PrivateLessonRow[];
  onSave: (
    data: PrivateLessonsDiscountFormData,
    lessonIds: number[]
  ) => Promise<boolean>;
  initialDiscountData?: PrivateLessonsDiscountFormData;
}

export function EditDiscountModal({
  open,
  onOpenChange,
  location,
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
  const [isLoadingDiscount, setIsLoadingDiscount] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch discount values from API when modal opens with selected lessons
  React.useEffect(() => {
    if (!open) {
      setPaymentFrequencyDiscountPercent("");
      setCustomerDiscountPercent("");
      setMultipleEnrollmentDiscountAmount("");
      setLineItemDiscountType("fixed");
      setLineItemDiscountValue("");
      return;
    }

    if (selectedLessons.length === 0) return;

    let isCancelled = false;
    setIsLoadingDiscount(true);

    const lessonIds = selectedLessons.map((l) => l.id);
    getDiscountValues(location, lessonIds)
      .then((res) => {
        if (isCancelled || !res?.data?.body) return;
        const b = res.data.body;
        setPaymentFrequencyDiscountPercent(
          b.paymentFrequencyDiscount != null ? String(b.paymentFrequencyDiscount) : ""
        );
        setCustomerDiscountPercent(
          b.customerDiscount != null ? String(b.customerDiscount) : ""
        );
        setMultipleEnrollmentDiscountAmount(
          b.multiEnrolmentDiscount != null ? String(b.multiEnrolmentDiscount) : ""
        );
        setLineItemDiscountValue(
          b.lineItemDiscount != null ? String(b.lineItemDiscount) : ""
        );
        setLineItemDiscountType(
          b.lineItemDiscountValueType === 1 ? "percentage" : "fixed"
        );
      })
      .catch(() => {
        if (!isCancelled && initialDiscountData) {
          setPaymentFrequencyDiscountPercent(
            initialDiscountData.paymentFrequencyDiscountPercent || ""
          );
          setCustomerDiscountPercent(initialDiscountData.customerDiscountPercent || "");
          setMultipleEnrollmentDiscountAmount(
            initialDiscountData.multipleEnrollmentDiscountAmount || ""
          );
          setLineItemDiscountType(initialDiscountData.lineItemDiscountType || "fixed");
          setLineItemDiscountValue(initialDiscountData.lineItemDiscountValue || "");
        }
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingDiscount(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [open, location, selectedLessons, initialDiscountData]);

  const handleSave = async () => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    const data: PrivateLessonsDiscountFormData = {
      paymentFrequencyDiscountPercent,
      customerDiscountPercent,
      multipleEnrollmentDiscountAmount,
      lineItemDiscountType,
      lineItemDiscountValue,
    };
    setIsSaving(true);
    try {
      const success = await onSave(data, lessonIds);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
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
          {isLoadingDiscount && (
            <p className="text-sm text-muted-foreground">Loading discount values...</p>
          )}
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
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasAnyValue || isSaving || isLoadingDiscount}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



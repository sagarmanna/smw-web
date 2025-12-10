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
import { cn } from "@/lib/utils";

export interface DiscountDetailFormData {
  discountType: "fixed" | "percentage";
  discountValue: string;
}

interface DiscountDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPreview: (data: DiscountDetailFormData) => void;
  initialData?: Partial<DiscountDetailFormData>;
  onClose?: () => void;
}

export function DiscountDetailModal({
  open,
  onOpenChange,
  onPreview,
  initialData,
  onClose,
}: DiscountDetailModalProps) {
  const [discountType, setDiscountType] = React.useState<"fixed" | "percentage">(
    initialData?.discountType || "fixed"
  );
  const [discountValue, setDiscountValue] = React.useState<string>(
    initialData?.discountValue || ""
  );

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setDiscountType(initialData?.discountType || "fixed");
      setDiscountValue(initialData?.discountValue || "");
    }
  }, [open, initialData]);

  const handlePreview = () => {
    onPreview({
      discountType,
      discountValue,
    });
    // Don't close the modal here - let the parent handle it
  };

  const handleCancel = () => {
    onOpenChange(false);
    onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Discount Detail</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="discount">Discount</Label>
            <div className="flex items-center gap-2">
              {/* Segmented Control */}
              <div className="flex gap-1 border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setDiscountType("fixed")}
                  className={cn(
                    "text-sm px-3 py-1.5 transition-colors",
                    discountType === "fixed"
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("percentage")}
                  className={cn(
                    "text-sm px-3 py-1.5 transition-colors",
                    discountType === "percentage"
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                  )}
                >
                  %
                </button>
              </div>

              {/* Input Field with Prefix */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {discountType === "fixed" ? "$" : "%"}
                </span>
                <Input
                  id="discount"
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0.00"
                  className="w-32"
                  min="0"
                  step={discountType === "percentage" ? "0.01" : "0.01"}
                  max={discountType === "percentage" ? "100" : undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handlePreview}
          >
            Preview
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


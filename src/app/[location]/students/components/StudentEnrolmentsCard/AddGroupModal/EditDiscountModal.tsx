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

export interface EditDiscountFormData {
  discountType: "fixed" | "percentage";
  discountValue: string;
}

interface EditDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EditDiscountFormData) => void;
  initialData?: EditDiscountFormData;
}

export function EditDiscountModal({
  open,
  onOpenChange,
  onSave,
  initialData,
}: EditDiscountModalProps) {
  const [discountType, setDiscountType] = React.useState<"fixed" | "percentage">(
    initialData?.discountType || "fixed"
  );
  const [discountValue, setDiscountValue] = React.useState<string>(
    initialData?.discountValue || ""
  );

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open && initialData) {
      setDiscountType(initialData.discountType);
      setDiscountValue(initialData.discountValue);
    }
  }, [open, initialData]);

  const handleSave = () => {
    onSave({
      discountType,
      discountValue,
    });
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="edit-discount">Discount</Label>
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
                  id="edit-discount"
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0.00"
                  className="w-32"
                  min="0"
                  step="0.01"
                  max={discountType === "percentage" ? "100" : undefined}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


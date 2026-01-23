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
import { getEnrolmentDiscountPreview, type PreviewItem } from "@/app/[location]/enrolments/[id]/enrolment-details.api";

export interface EditDiscountFormData {
  discountType: "fixed" | "percentage";
  discountValue: string;
}

interface EditStudentDiscountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: EditDiscountFormData) => Promise<boolean>;
  initialData?: EditDiscountFormData;
  saving?: boolean;
  location: string;
  enrolmentId: string;
}

/**
 * Parses discount value from API response format
 * Examples: "12.54%" -> { type: "percentage", value: "12.54" }
 *           "$50.00" -> { type: "fixed", value: "50.00" }
 *           "Not set" -> { type: "percentage", value: "" }
 */
export function parseDiscountFromApi(discount: string): EditDiscountFormData {
  if (!discount || discount === "Not set") {
    return {
      discountType: "percentage",
      discountValue: "",
    };
  }

  // Check if it's a percentage (ends with %)
  if (discount.endsWith("%")) {
    const value = discount.replace("%", "").trim();
    return {
      discountType: "percentage",
      discountValue: value,
    };
  }

  // Check if it's a dollar amount (starts with $)
  if (discount.startsWith("$")) {
    const value = discount.replace("$", "").trim();
    return {
      discountType: "fixed",
      discountValue: value,
    };
  }

  // Default to percentage if format is unclear
  return {
    discountType: "percentage",
    discountValue: discount,
  };
}

export function EditStudentDiscountModal({
  open,
  onOpenChange,
  onSave,
  initialData,
  saving = false,
  location,
  enrolmentId,
}: EditStudentDiscountModalProps) {
  const [discountType, setDiscountType] = React.useState<"fixed" | "percentage">(
    initialData?.discountType || "fixed"
  );
  const [discountValue, setDiscountValue] = React.useState<string>(
    initialData?.discountValue || ""
  );

  // Preview data state
  const [previewData, setPreviewData] = React.useState<PreviewItem[] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  // Track initial data to detect changes
  const [initialFormData, setInitialFormData] = React.useState<EditDiscountFormData>({
    discountType: initialData?.discountType || "fixed",
    discountValue: initialData?.discountValue || "",
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open && initialData) {
      const formData = {
        discountType: initialData.discountType,
        discountValue: initialData.discountValue,
      };
      setDiscountType(formData.discountType);
      setDiscountValue(formData.discountValue);
      setInitialFormData(formData);
    } else if (!open) {
      // Reset when modal closes
      setDiscountType("fixed");
      setDiscountValue("");
      setPreviewData(null);
      setInitialFormData({ discountType: "fixed", discountValue: "" });
    }
  }, [open, initialData]);

  // Check if there are changes
  const hasChanges = React.useMemo(() => {
    return (
      discountValue !== initialFormData.discountValue ||
      discountType !== initialFormData.discountType
    );
  }, [discountValue, discountType, initialFormData]);

  // Check if discount input is empty
  const isDiscountEmpty = React.useMemo(() => {
    return !discountValue || discountValue.trim() === "";
  }, [discountValue]);

  // Fetch preview when form data changes
  React.useEffect(() => {
    if (!open || !hasChanges || !enrolmentId) {
      setPreviewData(null);
      return;
    }

    const fetchPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const response = await getEnrolmentDiscountPreview(location, enrolmentId);
        if (response?.success && response.data?.previewItems) {
          setPreviewData(response.data.previewItems);
        } else {
          setPreviewData(null);
        }
      } catch (error) {
        console.error("Error loading discount preview:", error);
        setPreviewData(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    // Debounce preview fetch
    const timeoutId = setTimeout(() => {
      fetchPreview();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [open, hasChanges, location, enrolmentId]);

  const handleSave = async () => {
    const success = await onSave({
      discountType,
      discountValue,
    });
    
    if (success) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
        </DialogHeader>

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-discount" className="text-green-600 dark:text-green-400 font-semibold">
              Discount
            </Label>
            <div className="flex items-center gap-4">
              {/* Toggle between $ and % */}
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

              {/* Input Field with Prefix/Suffix */}
              <div className="flex items-center gap-2 flex-1">
                {discountType === "fixed" && (
                  <span className="text-sm text-muted-foreground">$</span>
                )}
                <Input
                  id="edit-discount"
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder="0.00"
                  className="border-green-500 focus:ring-2 focus:ring-green-500 flex-1"
                  min="0"
                  step="0.01"
                  max={discountType === "percentage" ? "100" : undefined}
                />
                {discountType === "percentage" && (
                  <span className="text-sm text-muted-foreground">%</span>
                )}
              </div>
            </div>
          </div>

          {/* Enrolment Edit Preview */}
          {hasChanges && (
            <div className="space-y-2">
              <label className="text-sm font-medium mb-2 block">Enrolment Edit Preview</label>
              {isLoadingPreview ? (
                <div className="text-center py-4 text-sm text-muted-foreground">Loading preview...</div>
              ) : previewData && previewData.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Objects</th>
                        <th className="px-4 py-2 text-left font-medium">Action</th>
                        <th className="px-4 py-2 text-left font-medium">Date Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((item, index) => (
                        <tr key={index} className="border-t dark:border-gray-700">
                          <td className="px-4 py-2">{item.objects}</td>
                          <td className="px-4 py-2">{item.action}</td>
                          <td className="px-4 py-2">{item.date_range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Unable to load preview
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || isDiscountEmpty}
            >
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

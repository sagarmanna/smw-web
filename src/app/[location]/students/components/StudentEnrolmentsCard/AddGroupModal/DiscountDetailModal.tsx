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
// import { LoadingAnimation } from "@/components/LoadingAnimation";
// import { applyGroupEnrolment } from "../../../../[id]/students-details.api";
import { toast } from "sonner";
import { applyGroupEnrolment, type LessonPreviewDto } from "../../../[id]/students-details.api";

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
  location?: string;
  studentId?: string;
  courseId?: string;
  onApiPreview?: (lessons: LessonPreviewDto[], enrolmentId?: number) => void; // Callback with API lessons data and enrolmentId
}

export function DiscountDetailModal({
  open,
  onOpenChange,
  onPreview,
  initialData,
  onClose,
  location,
  studentId,
  courseId,
  onApiPreview,
}: DiscountDetailModalProps) {
  const [discountType, setDiscountType] = React.useState<"fixed" | "percentage">(
    initialData?.discountType || "fixed"
  );
  const [discountValue, setDiscountValue] = React.useState<string>(
    initialData?.discountValue || ""
  );
  const [isLoading, setIsLoading] = React.useState(false);

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (open) {
      setDiscountType(initialData?.discountType || "fixed");
      setDiscountValue(initialData?.discountValue || "");
    }
  }, [open, initialData]);

  const handlePreview = async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) {
      return;
    }

    // If API preview is available and we have required data, call API
    if (onApiPreview && location && studentId && courseId) {
      setIsLoading(true);
      try {
        const response = await applyGroupEnrolment(
          location,
          studentId,
          courseId,
          discountValue || undefined,
          discountType
        );
        
        if (response?.success && response.data?.lessons) {
          // Pass lessons and enrolmentId from API to parent
          onApiPreview(response.data.lessons, response.data.enrolmentId);
          // Also call the regular preview callback for backward compatibility
          onPreview({
            discountType,
            discountValue,
          });
        } else {
          toast.error(response?.message || "Failed to load lesson details");
          // Fallback to regular preview
          onPreview({
            discountType,
            discountValue,
          });
        }
      } catch (error) {
        console.error("Error applying group enrolment:", error);
        toast.error("Failed to load lesson details");
        // Fallback to regular preview
        onPreview({
          discountType,
          discountValue,
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      // Fallback to regular preview (no API call)
      onPreview({
        discountType,
        discountValue,
      });
    }
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

              {/* Input Field with Prefix/Suffix */}
              <div className="flex items-center gap-2">
                {discountType === "fixed" && (
                  <span className="text-sm text-muted-foreground">$</span>
                )}
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
                {discountType === "percentage" && (
                  <span className="text-sm text-muted-foreground">%</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handlePreview}
            disabled={isLoading}
          >
            {isLoading ? (
              "Loading..."
            ) : (
              "Preview"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
import { AlertCircle } from "lucide-react";
import { EnrolmentDiscounts, EnrolmentSchedule, EnrolmentDetails } from "../../types";
import { ENROLMENT_CONSTANTS } from "../../utils/constants";
import { getEnrolmentDiscountPreview, type PreviewItem } from "../../[id]/enrolment-details.api";
import { cn } from "@/lib/utils";

interface EditEnrolmentDiscountsModalProps {
  open: boolean;
  onClose: () => void;
  discounts: EnrolmentDiscounts | null;
  schedule?: EnrolmentSchedule | null;
  details?: EnrolmentDetails | null;
  onSubmit: (discounts: Partial<EnrolmentDiscounts>) => Promise<boolean>;
  saving?: boolean;
  enrolmentType?: "private" | "group"; // Pass enrolment type for conditional rendering
  location: string;
  enrolmentId: string;
}

export function EditEnrolmentDiscountsModal({
  open,
  onClose,
  discounts,
  schedule,
  details,
  onSubmit,
  saving = false,
  enrolmentType = "private", // Default to private if not provided
  location,
  enrolmentId,
}: EditEnrolmentDiscountsModalProps) {
  // For group enrolments, use single discount field with type; for private, use two fields
  const [formData, setFormData] = React.useState({
    pfDiscount: "",
    multipleEnrolDiscount: "",
    discount: "",
    discountType: 1 as number, // 0 = percentage, 1 = dollar (default to dollar)
  });

  const [initialData, setInitialData] = React.useState({
    pfDiscount: "",
    multipleEnrolDiscount: "",
    discount: "",
    discountType: 1 as number,
  });

  // Preview data state
  const [previewData, setPreviewData] = React.useState<PreviewItem[] | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  /**
   * Strips currency and percentage symbols from discount values for input display
   */
  const stripDiscountSymbols = React.useCallback((value: string): string => {
    if (!value) return "";
    // Remove $, %, and any whitespace
    return value.replace(/[$%\s]/g, "").trim();
  }, []);

  /**
   * Initializes form data based on enrolment type and discounts
   * Extracted to reduce code duplication
   */
  const initializeFormData = React.useCallback(
    (discounts: EnrolmentDiscounts | null, type: "private" | "group") => {
      const emptyData = {
        pfDiscount: "",
        multipleEnrolDiscount: "",
        discount: "",
        discountType: 1,
      };

      if (!discounts) {
        return { formData: emptyData, initialData: emptyData };
      }

      if (type === "group") {
        // For group enrolments, use single discount field with type
        const discountValue =
          discounts.discount && discounts.discount !== ENROLMENT_CONSTANTS.DEFAULT_NOT_SET
            ? stripDiscountSymbols(discounts.discount)
            : "";
        // discountType: 0 = percentage, 1 = dollar
        // Default to dollar (1) if not provided
        const discountType = discounts.discountType !== undefined ? discounts.discountType : 1;
        const data = {
          pfDiscount: "",
          multipleEnrolDiscount: "",
          discount: discountValue,
          discountType: discountType,
        };
        return { formData: data, initialData: data };
      }

      // For private enrolments, use PF Discount and Multiple Enrol. Discount
      // Strip % from PF discount and $ from Multiple Enrolment discount
      const pfValue =
        discounts.pfDiscount && discounts.pfDiscount !== ENROLMENT_CONSTANTS.DEFAULT_NOT_SET
          ? stripDiscountSymbols(discounts.pfDiscount)
          : "";
      const multipleValue =
        discounts.multipleEnrolDiscount &&
        discounts.multipleEnrolDiscount !== ENROLMENT_CONSTANTS.DEFAULT_NOT_SET
          ? stripDiscountSymbols(discounts.multipleEnrolDiscount)
          : "";
      const data = {
        pfDiscount: pfValue,
        multipleEnrolDiscount: multipleValue,
        discount: "",
        discountType: 1, // Not used for private enrolments
      };
      return { formData: data, initialData: data };
    },
    [stripDiscountSymbols]
  );

  React.useEffect(() => {
    const { formData: newFormData, initialData: newInitialData } = initializeFormData(
      discounts,
      enrolmentType
    );
    setFormData(newFormData);
    setInitialData(newInitialData);
  }, [discounts, open, enrolmentType, initializeFormData]);

  // Check if there are changes
  const hasChanges = React.useMemo(() => {
    if (enrolmentType === "group") {
      return (
        formData.discount !== initialData.discount ||
        formData.discountType !== initialData.discountType
      );
    }
    return (
      formData.pfDiscount !== initialData.pfDiscount ||
      formData.multipleEnrolDiscount !== initialData.multipleEnrolDiscount
    );
  }, [formData, initialData, enrolmentType]);

  // Check if discount input is empty (for group enrolments)
  const isDiscountEmpty = React.useMemo(() => {
    if (enrolmentType === "group") {
      return !formData.discount || formData.discount.trim() === "";
    }
    return false; // For private enrolments, allow empty (they're optional)
  }, [formData.discount, enrolmentType]);

  // Fetch preview only once when modal opens
  React.useEffect(() => {
    if (!open) {
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

    // Fetch preview only once when modal opens
    fetchPreview();
  }, [open, location, enrolmentId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!discounts) return;
    
    // Submit different fields based on enrolment type
    const submitData = enrolmentType === "group"
      ? { 
          discount: formData.discount || "",
          discountType: formData.discountType,
        }
      : {
          pfDiscount: formData.pfDiscount || "",
          multipleEnrolDiscount: formData.multipleEnrolDiscount || "",
        };
    
    const success = await onSubmit(submitData);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warning Banner */}
          {enrolmentType === "private" && <div className="flex items-start gap-3 p-4 bg-orange-500 text-white rounded-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              You have entered a non-approved Arcadia discount. All non-approved discounts must be 
              submitted in writing and approved by Head Office prior to entering a discount, otherwise you 
              are in breach of your agreement.
            </p>
          </div>}

          {/* Input Fields - Conditional based on enrolment type */}
          {enrolmentType === "group" ? (
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-green-600 dark:text-green-400 font-semibold">
                Discount
              </Label>
              <div className="flex items-center gap-4">
                {/* Toggle between $ and % */}
                <div className="flex gap-1 border rounded-md overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, discountType: 1 }))}
                    className={cn(
                      "text-sm px-3 py-1.5 transition-colors",
                      formData.discountType === 1
                        ? "bg-blue-600 text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    $
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, discountType: 0 }))}
                    className={cn(
                      "text-sm px-3 py-1.5 transition-colors",
                      formData.discountType === 0
                        ? "bg-blue-600 text-white"
                        : "bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    )}
                  >
                    %
                  </button>
                </div>

                {/* Input Field with Prefix/Suffix */}
                <div className="flex items-center gap-2 flex-1">
                  {formData.discountType === 1 && (
                    <span className="text-sm text-muted-foreground">$</span>
                  )}
                  <Input
                    id="discount"
                    type="number"
                    value={formData.discount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
                    placeholder="0.00"
                    className="border-green-500 focus:ring-2 focus:ring-green-500 flex-1"
                    min="0"
                    step="0.01"
                    max={formData.discountType === 0 ? "100" : undefined}
                  />
                  {formData.discountType === 0 && (
                    <span className="text-sm text-muted-foreground">%</span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf-discount" className="text-green-600 dark:text-green-400 font-semibold">
                  Payment Frequency Discount (%)
                </Label>
                <Input
                  id="pf-discount"
                  type="text"
                  value={formData.pfDiscount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, pfDiscount: e.target.value }))}
                  placeholder="Enter discount"
                  className="border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="multiple-enrol-discount" className="font-semibold">
                  Multiple Enrolment Discount ($)
                </Label>
                <Input
                  id="multiple-enrol-discount"
                  type="text"
                  value={formData.multipleEnrolDiscount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, multipleEnrolDiscount: e.target.value }))}
                  placeholder="Enter discount"
                  className="border-green-500 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
          )}

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || isDiscountEmpty}>
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


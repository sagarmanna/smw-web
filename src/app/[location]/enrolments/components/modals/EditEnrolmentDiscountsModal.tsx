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

interface EditEnrolmentDiscountsModalProps {
  open: boolean;
  onClose: () => void;
  discounts: EnrolmentDiscounts | null;
  schedule?: EnrolmentSchedule | null;
  details?: EnrolmentDetails | null;
  onSubmit: (discounts: Partial<EnrolmentDiscounts>) => Promise<boolean>;
  saving?: boolean;
  enrolmentType?: "private" | "group"; // Pass enrolment type for conditional rendering
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
}: EditEnrolmentDiscountsModalProps) {
  // For group enrolments, use single discount field; for private, use two fields
  const [formData, setFormData] = React.useState({
    pfDiscount: "",
    multipleEnrolDiscount: "",
    discount: "",
  });

  const [initialData, setInitialData] = React.useState({
    pfDiscount: "",
    multipleEnrolDiscount: "",
    discount: "",
  });

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
      };

      if (!discounts) {
        return { formData: emptyData, initialData: emptyData };
      }

      if (type === "group") {
        // For group enrolments, use single discount field
        const discountValue =
          discounts.discount && discounts.discount !== ENROLMENT_CONSTANTS.DEFAULT_NOT_SET
            ? discounts.discount
            : "";
        const data = {
          pfDiscount: "",
          multipleEnrolDiscount: "",
          discount: discountValue,
        };
        return { formData: data, initialData: data };
      }

      // For private enrolments, use PF Discount and Multiple Enrol. Discount
      const pfValue =
        discounts.pfDiscount && discounts.pfDiscount !== ENROLMENT_CONSTANTS.DEFAULT_NOT_SET
          ? discounts.pfDiscount
          : "";
      const multipleValue =
        discounts.multipleEnrolDiscount &&
        discounts.multipleEnrolDiscount !== ENROLMENT_CONSTANTS.DEFAULT_NOT_SET
          ? discounts.multipleEnrolDiscount
          : "";
      const data = {
        pfDiscount: pfValue,
        multipleEnrolDiscount: multipleValue,
        discount: "",
      };
      return { formData: data, initialData: data };
    },
    []
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
      return formData.discount !== initialData.discount;
    }
    return (
      formData.pfDiscount !== initialData.pfDiscount ||
      formData.multipleEnrolDiscount !== initialData.multipleEnrolDiscount
    );
  }, [formData, initialData, enrolmentType]);

  // Get date range for preview
  const dateRange = React.useMemo(() => {
    if (schedule?.startDate && schedule?.endDate) {
      return `within ${schedule.startDate} - ${schedule.endDate}`;
    }
    if (details?.rateFromDate && details?.rateToDate) {
      return `within ${details.rateFromDate} - ${details.rateToDate}`;
    }
    return null;
  }, [schedule, details]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!discounts) return;
    
    // Submit different fields based on enrolment type
    const submitData = enrolmentType === "group"
      ? { discount: formData.discount || "" }
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
          <div className="flex items-start gap-3 p-4 bg-orange-500 text-white rounded-md">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              You have entered a non-approved Arcadia discount. All non-approved discounts must be 
              submitted in writing and approved by Head Office prior to entering a discount, otherwise you 
              are in breach of your agreement.
            </p>
          </div>

          {/* Input Fields - Conditional based on enrolment type */}
          {enrolmentType === "group" ? (
            <div className="space-y-2">
              <Label htmlFor="discount" className="text-green-600 dark:text-green-400 font-semibold">
                Discount
              </Label>
              <Input
                id="discount"
                type="text"
                value={formData.discount}
                onChange={(e) => setFormData((prev) => ({ ...prev, discount: e.target.value }))}
                placeholder="Enter discount"
                className="border-green-500 focus:ring-2 focus:ring-green-500"
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pf-discount" className="text-green-600 dark:text-green-400 font-semibold">
                  Payment Frequency Discount
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
                  Multiple Enrolment Discount
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
          {hasChanges && dateRange && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Enrolment Edit Preview</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Objects</th>
                      <th className="px-3 py-2 text-left font-medium">Action</th>
                      <th className="px-3 py-2 text-left font-medium">Date Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="px-3 py-2 text-blue-600 dark:text-blue-400">
                        Lessons&apos; Discount
                      </td>
                      <td className="px-3 py-2">
                        will be modified
                      </td>
                      <td className="px-3 py-2 text-blue-600 dark:text-blue-400">
                        {dateRange}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Confirm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


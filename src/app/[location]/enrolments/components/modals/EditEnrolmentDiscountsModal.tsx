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

interface EditEnrolmentDiscountsModalProps {
  open: boolean;
  onClose: () => void;
  discounts: EnrolmentDiscounts | null;
  schedule?: EnrolmentSchedule | null;
  details?: EnrolmentDetails | null;
  onSubmit: (discounts: Partial<EnrolmentDiscounts>) => Promise<boolean>;
  saving?: boolean;
}

export function EditEnrolmentDiscountsModal({
  open,
  onClose,
  discounts,
  schedule,
  details,
  onSubmit,
  saving = false,
}: EditEnrolmentDiscountsModalProps) {
  const [formData, setFormData] = React.useState({
    pfDiscount: "",
    multipleEnrolDiscount: "",
  });

  const [initialData, setInitialData] = React.useState({
    pfDiscount: "",
    multipleEnrolDiscount: "",
  });

  React.useEffect(() => {
    if (discounts) {
      // Convert "Not set" to empty string for display in input fields
      const pfValue = discounts.pfDiscount && discounts.pfDiscount !== "Not set" ? discounts.pfDiscount : "";
      const multipleValue = discounts.multipleEnrolDiscount && discounts.multipleEnrolDiscount !== "Not set" ? discounts.multipleEnrolDiscount : "";
      
      setFormData({
        pfDiscount: pfValue,
        multipleEnrolDiscount: multipleValue,
      });
      
      setInitialData({
        pfDiscount: pfValue,
        multipleEnrolDiscount: multipleValue,
      });
    } else {
      setFormData({
        pfDiscount: "",
        multipleEnrolDiscount: "",
      });
      setInitialData({
        pfDiscount: "",
        multipleEnrolDiscount: "",
      });
    }
  }, [discounts, open]);

  // Check if there are changes
  const hasChanges = React.useMemo(() => {
    return (
      formData.pfDiscount !== initialData.pfDiscount ||
      formData.multipleEnrolDiscount !== initialData.multipleEnrolDiscount
    );
  }, [formData, initialData]);

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
    
    const success = await onSubmit({
      pfDiscount: formData.pfDiscount || "",
      multipleEnrolDiscount: formData.multipleEnrolDiscount || "",
    });
    
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

          {/* Input Fields */}
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


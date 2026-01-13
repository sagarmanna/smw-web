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
import { Label } from "@/components/ui/label";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { EnrolmentPaymentFrequency } from "../../types";

interface PaymentFrequencyOption {
  value: string;
  label: string;
}

interface EditPaymentFrequencyModalProps {
  open: boolean;
  onClose: () => void;
  paymentFrequency: EnrolmentPaymentFrequency | null;
  paymentFrequencyOptions: PaymentFrequencyOption[];
  isLoadingOptions?: boolean;
  onSubmit: (data: { paymentFrequency: string; effectiveDate: string }) => Promise<boolean>;
  saving?: boolean;
}

export function EditPaymentFrequencyModal({
  open,
  onClose,
  paymentFrequency,
  paymentFrequencyOptions,
  isLoadingOptions = false,
  onSubmit,
  saving = false,
}: EditPaymentFrequencyModalProps) {
  const [selectedFrequency, setSelectedFrequency] = React.useState<string>("");
  const [effectiveDate, setEffectiveDate] = React.useState<Date>(new Date());
  const [error, setError] = React.useState<string>("");

  // Parse date string to Date object
  const parseDateString = (dateString: string | undefined): Date => {
    if (!dateString) {
      // Default to current month's first day
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        // Invalid date, default to current month's first day
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      }
      // Return the date (it's already the 1st day from backend)
      return date;
    } catch {
      // Default to current month's first day
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
  };

  React.useEffect(() => {
    if (open && paymentFrequency) {
      setSelectedFrequency(paymentFrequency.paymentFrequency || "");
      // Load effective date from paymentFrequency, or default to current month's first day
      const effectiveDateFromApi = parseDateString(paymentFrequency.effectiveDate);
      setEffectiveDate(effectiveDateFromApi);
      setError("");
    } else if (!open) {
      setSelectedFrequency("");
      setEffectiveDate(new Date());
      setError("");
    }
  }, [open, paymentFrequency]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!selectedFrequency) {
      setError("Payment Frequency is required.");
      return;
    }

    if (!effectiveDate) {
      setError("Effective Date is required.");
      return;
    }

    setError("");
    
    // Convert selected date to first day of that month and year
    const firstDayOfMonth = new Date(effectiveDate.getFullYear(), effectiveDate.getMonth(), 1);
    const effectiveDateString = format(firstDayOfMonth, "MMM dd, yyyy");
    
    const success = await onSubmit({
      paymentFrequency: selectedFrequency,
      effectiveDate: effectiveDateString,
    });
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Payment Frequency</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-frequency" className="font-semibold">
              Payment Frequency
            </Label>
            <SearchableSelect
              id="payment-frequency"
              options={paymentFrequencyOptions}
              value={selectedFrequency}
              onValueChange={(value) => {
                setSelectedFrequency(value);
                setError("");
              }}
              placeholder="Select payment frequency"
              searchPlaceholder="Search..."
              emptyText="No payment frequency options available"
              loadingText="Loading options..."
              noResultsText="No results found"
              isLoading={isLoadingOptions}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective-date" className="font-semibold">
              Effective Date
            </Label>
            <DatePicker
              id="effective-date"
              value={effectiveDate}
              onSelect={(date) => {
                if (date) {
                  // Convert selected date to first day of that month and year
                  const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                  setEffectiveDate(firstDayOfMonth);
                  setError("");
                }
              }}
              placeholder="Select month and year"
              fromYear={2005}
              toYear={2125}
            />
            <p className="text-xs text-muted-foreground">
              Select any day in the month. The effective date will be set to the 1st day of the selected month and year.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
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


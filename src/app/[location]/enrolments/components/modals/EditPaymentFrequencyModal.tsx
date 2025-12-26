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
import { DatePicker } from "@/components/ui/date-picker";
import { SearchableSelect } from "@/components/ui/searchable-select";
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
  const [effectiveDate, setEffectiveDate] = React.useState<Date | undefined>(undefined);
  const [error, setError] = React.useState<string>("");

  // Parse date string to Date object
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      // Try parsing common date formats
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  // Format Date to string (MMM dd, yyyy format like "Dec 01, 2025")
  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "MMM dd, yyyy");
  };

  React.useEffect(() => {
    if (open && paymentFrequency) {
      setSelectedFrequency(paymentFrequency.paymentFrequency || "");
      // Set effective date to today if not provided
      setEffectiveDate(new Date());
      setError("");
    } else if (!open) {
      setSelectedFrequency("");
      setEffectiveDate(undefined);
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
    const dateString = formatDateToString(effectiveDate);
    const success = await onSubmit({
      paymentFrequency: selectedFrequency,
      effectiveDate: dateString,
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
                setEffectiveDate(date);
                setError("");
              }}
              placeholder="Pick a date"
              fromYear={2005}
              toYear={2125}
              error={!!error && !effectiveDate}
              errorMessage={error && !effectiveDate ? error : undefined}
            />
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


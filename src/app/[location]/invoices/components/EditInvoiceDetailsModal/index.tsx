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
import { DatePicker } from "@/components/ui/date-picker";
import { parseDateString } from "@/utils/dateUtils";
import { format } from "date-fns";
import { InvoiceDetail } from "../../mockData/invoiceDetailMockData";

interface EditInvoiceDetailsModalProps {
  open: boolean;
  onClose: () => void;
  invoice: InvoiceDetail | null;
  onSubmit: (invoice: Partial<InvoiceDetail>) => Promise<boolean>;
  saving?: boolean;
}

export function EditInvoiceDetailsModal({
  open,
  onClose,
  invoice,
  onSubmit,
  saving = false,
}: EditInvoiceDetailsModalProps) {
  const [dateValue, setDateValue] = React.useState<Date | undefined>(undefined);
  const [error, setError] = React.useState<string>("");

  // Initialize date when modal opens
  React.useEffect(() => {
    if (open && invoice?.date) {
      // Parse the date string (format: "MMM dd, yyyy" or "MMM d, yyyy")
      const parsedDate = parseDateString(invoice.date);
      setDateValue(parsedDate || undefined);
      setError("");
    } else if (!open) {
      setDateValue(undefined);
      setError("");
    }
  }, [open, invoice?.date]);

  const handleDateSelect = (date: Date | undefined) => {
    setDateValue(date);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!dateValue) {
      setError("Date is required.");
      return;
    }

    if (!invoice) return;

    setError("");

    // Format date to "MMM dd, yyyy" format (e.g., "Jan 07, 2026")
    const formattedDate = format(dateValue, "MMM dd, yyyy");

    const success = await onSubmit({
      id: invoice.id,
      date: formattedDate,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle id="invoice-details-modal-title">Details</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-labelledby="invoice-details-modal-title"
        >
          <DatePicker
            id="invoice-date"
            label="Date"
            value={dateValue}
            onSelect={handleDateSelect}
            placeholder="Pick a date"
            fromYear={2005}
            toYear={2125}
            error={!!error && !dateValue}
            errorMessage={error && !dateValue ? error : undefined}
          />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              aria-label="Cancel editing invoice date"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !dateValue}
              aria-label={saving ? "Saving invoice date" : "Save invoice date"}
            >
              {saving ? (
                <>
                  <span className="sr-only">Saving</span>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


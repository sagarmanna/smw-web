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
import { parseDateString } from "@/utils/dateUtils";
import { format } from "date-fns";

interface EditDueDateModalProps {
  open: boolean;
  onClose: () => void;
  dueDate: string | null;
  onSubmit: (dueDate: string) => Promise<boolean>;
  saving?: boolean;
}

export function EditDueDateModal({
  open,
  onClose,
  dueDate,
  onSubmit,
  saving = false,
}: EditDueDateModalProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [error, setError] = React.useState<string>("");

  // Initialize date when modal opens
  React.useEffect(() => {
    if (open && dueDate) {
      // Parse the date string (format: "MMM dd, yyyy" or "MMM d, yyyy")
      const parsedDate = parseDateString(dueDate);
      setSelectedDate(parsedDate || undefined);
    } else if (!open) {
      setSelectedDate(undefined);
      setError("");
    }
  }, [open, dueDate]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDate) {
      setError("Due date is required.");
      return;
    }

    setError("");

    // Format date to API-required ISO format "yyyy-MM-dd" (e.g., "2025-09-15")
    const formattedDate = format(selectedDate, "yyyy-MM-dd");
    const success = await onSubmit(formattedDate);

    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Due Date</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="due-date" className="font-semibold">
              Due Date
            </Label>
            <DatePicker
              id="due-date"
              value={selectedDate}
              onSelect={handleDateSelect}
              placeholder="Pick a date"
              fromYear={2005}
              toYear={2125}
              error={!!error && !selectedDate}
              errorMessage={error && !selectedDate ? error : undefined}
            />
          </div>

          {error && selectedDate && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !selectedDate}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


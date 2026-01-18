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
import { format } from "date-fns";
import { EnrolmentSchedule } from "../../types";
import { toast } from "sonner";

interface AdjustEndDateModalProps {
  open: boolean;
  onClose: () => void;
  schedule: EnrolmentSchedule | null;
  onSubmit: (endDate: string) => Promise<boolean>;
  saving?: boolean;
  enrolmentType?: "private" | "group";
}

export function AdjustEndDateModal({
  open,
  onClose,
  schedule,
  onSubmit,
  saving = false,
  enrolmentType = "private",
}: AdjustEndDateModalProps) {
  const [endDate, setEndDate] = React.useState<Date | undefined>(undefined);
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

  // Format Date to string (YYYY-MM-DD)
  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  React.useEffect(() => {
    if (open && schedule?.endDate) {
      const parsed = parseDate(schedule.endDate);
      setEndDate(parsed);
      setError("");
    } else if (!open) {
      setEndDate(undefined);
      setError("");
    }
  }, [open, schedule]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!endDate) {
      setError("End Date cannot be blank.");
      return;
    }

    // For group enrolments: validate that new end date <= current end date (can only shrink)
    if (enrolmentType === "group" && schedule?.endDate) {
      const currentEndDate = parseDate(schedule.endDate);
      if (currentEndDate && endDate > currentEndDate) {
        toast.error("You can't extend group enrolments");
        return;
      }
    }

    setError("");
    const dateString = formatDateToString(endDate);
    const success = await onSubmit(dateString);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>End Date Adjustment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DatePicker
            id="end-date"
            label="End Date"
            value={endDate}
            onSelect={(date) => {
              setEndDate(date);
              
              // For group enrolments: validate that new end date <= current end date (can only shrink)
              if (enrolmentType === "group" && schedule?.endDate && date) {
                const currentEndDate = parseDate(schedule.endDate);
                if (currentEndDate && date > currentEndDate) {
                  toast.error("You can't extend group enrolments");
                  // Reset to current end date to prevent invalid selection
                  setEndDate(currentEndDate);
                  return;
                }
              }
              
              setError("");
            }}
            placeholder="Pick a date"
            fromYear={2005}
            toYear={2125}
            error={!!error}
            errorMessage={error}
          />

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


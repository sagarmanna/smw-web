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
import { MonthPicker } from "@/components/ui/month-picker";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { EnrolmentSchedule } from "../../types";

interface PermanentScheduleChangeModalProps {
  open: boolean;
  onClose: () => void;
  schedule: EnrolmentSchedule | null;
  onSubmit: (startingDate: string) => Promise<boolean>;
  saving?: boolean;
}

export function PermanentScheduleChangeModal({
  open,
  onClose,
  schedule,
  onSubmit,
  saving = false,
}: PermanentScheduleChangeModalProps) {
  const [startingDate, setStartingDate] = React.useState<Date | undefined>(undefined);
  const [error, setError] = React.useState<string>("");

  // Parse date string to Date object
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? undefined : date;
    } catch {
      return undefined;
    }
  };

  // Format Date to string (YYYY-MM-DD)
  // For month picker, we use the first day of the selected month
  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    // Ensure we use the first day of the month
    const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    return format(firstDayOfMonth, "yyyy-MM-dd");
  };

  React.useEffect(() => {
    if (open && schedule?.startDate) {
      const parsed = parseDate(schedule.startDate);
      setStartingDate(parsed);
      setError("");
    } else if (!open) {
      setStartingDate(undefined);
      setError("");
    }
  }, [open, schedule]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!startingDate) {
      setError("Date to change schedule cannot be blank.");
      return;
    }

    setError("");
    const dateString = formatDateToString(startingDate);
    const success = await onSubmit(dateString);
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enrolment Edit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={cn("space-y-2 p-3 rounded-md border", error ? "border-red-500" : "border-transparent")}>
            <label className={cn("text-sm font-semibold", error ? "text-red-600 dark:text-red-400" : "text-foreground")}>
              Date To Change Schedule
            </label>
            <MonthPicker
              id="starting-date"
              label="Starting Date"
              value={startingDate}
              onSelect={(date) => {
                setStartingDate(date);
                setError("");
              }}
              placeholder="Pick a month"
              fromYear={2005}
              toYear={2125}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Next"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


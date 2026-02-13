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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, isBefore } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BulkRescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (date: Date) => Promise<boolean>;
}

export function BulkRescheduleModal({
  open,
  onOpenChange,
  onSave,
}: BulkRescheduleModalProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedDate(undefined);
      setIsCalendarOpen(false);
    }
  }, [open]);

  const handleSave = React.useCallback(async () => {
    if (!selectedDate) return;

    const today = startOfDay(new Date());
    const selectedDateStart = startOfDay(selectedDate);
    if (isBefore(selectedDateStart, today)) return;

    setIsSaving(true);
    try {
      const success = await onSave(selectedDate);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [selectedDate, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setSelectedDate(undefined);
    onOpenChange(false);
  }, [onOpenChange]);

  const handleDateSelect = React.useCallback((date: Date | undefined) => {
    if (!date) {
      setSelectedDate(undefined);
      return;
    }

    // Validate: only allow today and future dates
    const today = startOfDay(new Date());
    const selectedDateStart = startOfDay(date);

    if (isBefore(selectedDateStart, today)) {
      // Show error toast if user tries to select a past date
      toast.error("Lessons can't be rescheduled because choosen date already had some lessons.");
      return;
    }

    setSelectedDate(date);
    setIsCalendarOpen(false);
  }, []);

  // Disable dates before today
  const today = startOfDay(new Date());
  const disabledDates = (date: Date) => {
    return isBefore(startOfDay(date), today);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Bulk Reschedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="bulk-reschedule-date" className="text-base font-semibold">
              Bulk Reschedule Date
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  disabled={disabledDates}
                  captionLayout="dropdown"
                  fromYear={2005}
                  toYear={2125}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedDate || isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { submitTeacherBulkReschedule } from "@/lib/api/legacyApiAdapter";

interface BulkRescheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  teacherId: number;
  onSuccess?: () => void;
}

export function BulkRescheduleModal({
  open,
  onOpenChange,
  location,
  teacherId,
  onSuccess,
}: BulkRescheduleModalProps) {
  const [sourceDate, setSourceDate] = useState<Date | undefined>(undefined);
  const [destinationDate, setDestinationDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceDatePopoverOpen, setSourceDatePopoverOpen] = useState(false);
  const [destinationDatePopoverOpen, setDestinationDatePopoverOpen] = useState(false);

  const handleSubmit = async () => {
    // Reset error
    setError(null);

    // Validation
    if (!sourceDate) {
      setError("Please select a source date");
      return;
    }

    if (!destinationDate) {
      setError("Please select a destination date");
      return;
    }

    if (sourceDate.getTime() === destinationDate.getTime()) {
      setError("Source date and destination date must be different");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format dates as "MMM dd, yyyy" (e.g., "Dec 13, 2025") for legacy API
      const sourceDateStr = format(sourceDate, "MMM dd, yyyy");
      const destinationDateStr = format(destinationDate, "MMM dd, yyyy");

      // Call legacy API to submit bulk reschedule request
      const response = await submitTeacherBulkReschedule(
        location,
        teacherId,
        sourceDateStr,
        destinationDateStr
      );

      // {"status":false,"error":"No Lessons for this teacher for the selected date"}
      if (!response || !response.status) {
        throw new Error(response?.message || response?.error || "Failed to submit bulk reschedule request");
      }

      // Show success message
      toast.success(response.message || "Bulk reschedule request submitted successfully", {
        duration: 3000,
      });

      // Reset form
      setSourceDate(undefined);
      setDestinationDate(undefined);
      setError(null);

      // Close modal
      onOpenChange(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to submit bulk reschedule request";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSourceDate(undefined);
      setDestinationDate(undefined);
      setError(null);
      setSourceDatePopoverOpen(false);
      setDestinationDatePopoverOpen(false);
      onOpenChange(false);
    }
  };

  const handleSourceDateSelect = (date: Date | undefined) => {
    setSourceDate(date);
    if (date) {
      setSourceDatePopoverOpen(false);
    }
  };

  const handleDestinationDateSelect = (date: Date | undefined) => {
    setDestinationDate(date);
    if (date) {
      setDestinationDatePopoverOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Bulk Reschedule</DialogTitle>
          <DialogDescription>
            Reschedule all lessons for this teacher from the source date to the destination date.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              {error}
            </div>
          )} */}

          <div className="grid gap-2">
            <Label htmlFor="source-date">Source Date</Label>
            <Popover open={sourceDatePopoverOpen} onOpenChange={setSourceDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !sourceDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {sourceDate ? format(sourceDate, "MMM dd, yyyy") : "Select source date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={sourceDate}
                  onSelect={handleSourceDateSelect}
                  disabled={isSubmitting}
                  captionLayout="dropdown"
                  fromYear={2005}
                  toYear={2125}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="destination-date">Destination Date</Label>
            <Popover open={destinationDatePopoverOpen} onOpenChange={setDestinationDatePopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !destinationDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {destinationDate
                    ? format(destinationDate, "MMM dd, yyyy")
                    : "Select destination date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={destinationDate}
                  onSelect={handleDestinationDateSelect}
                  disabled={isSubmitting}
                  captionLayout="dropdown"
                  fromYear={2005}
                  toYear={2125}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


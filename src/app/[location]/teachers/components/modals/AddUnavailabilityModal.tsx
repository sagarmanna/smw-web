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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { UnavailabilityData } from "../../teacherTabConfigs";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { isoStringToDate } from "../../utils/dateUtils";

interface AddUnavailabilityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<UnavailabilityData, "id">) => void;
  onUpdate?: (data: UnavailabilityData) => void;
  onDelete?: (id: string) => void;
  existingUnavailabilities?: UnavailabilityData[];
  initialData?: UnavailabilityData | null;
  mode?: "add" | "edit";
}

// Generate time options (15-minute intervals)
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      const time12h = format(new Date(2000, 0, 1, hour, minute), "h:mm a");
      times.push(`${h}:${m} - ${time12h}`);
    }
  }
  return times;
}

function parseTimeOption(timeOption: string): { hour: number; minute: number } {
  const [timePart] = timeOption.split(" - ");
  const [hour, minute] = timePart.split(":").map(Number);
  return { hour, minute };
}

function formatDateTimeToISO(date: Date, timeOption: string): string {
  const { hour, minute } = parseTimeOption(timeOption);
  const dateTime = new Date(date);
  dateTime.setHours(hour, minute, 0, 0);
  return dateTime.toISOString();
}

function parseDateTimeToDateAndTime(dateTimeStr: string): { date: Date; timeOption: string } | null {
  const parsedDate = isoStringToDate(dateTimeStr);
  if (!parsedDate) return null;
  
  const hour = parsedDate.getHours();
  const minute = parsedDate.getMinutes();
  const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  const time12h = format(parsedDate, "h:mm a");
  const timeOption = `${timeStr} - ${time12h}`;
  
  return { date: parsedDate, timeOption };
}

function checkOverlap(
  fromDateTime: Date,
  toDateTime: Date,
  existingUnavailabilities: UnavailabilityData[],
  excludeId?: string
): boolean {
  for (const existing of existingUnavailabilities) {
    if (excludeId && existing.id === excludeId) continue;
    
    const existingFrom = isoStringToDate(existing.fromDateTime);
    const existingTo = isoStringToDate(existing.toDateTime);
    
    if (!existingFrom || !existingTo) continue;
    
    if (fromDateTime < existingTo && toDateTime > existingFrom) {
      return true;
    }
  }
  return false;
}

export function AddUnavailabilityModal({
  open,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  existingUnavailabilities = [],
  initialData = null,
  mode = "add",
}: AddUnavailabilityModalProps) {
  const isEditMode = mode === "edit" && initialData !== null;
  const [fromDate, setFromDate] = React.useState<Date | undefined>(new Date());
  const [fromTime, setFromTime] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<Date | undefined>(new Date());
  const [toTime, setToTime] = React.useState<string>("");
  const [reason, setReason] = React.useState("");
  const [overlapError, setOverlapError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const timeOptions = React.useMemo(() => generateTimeOptions(), []);

  React.useEffect(() => {
    if (open) {
      if (isEditMode && initialData) {
        const fromData = parseDateTimeToDateAndTime(initialData.fromDateTime);
        const toData = parseDateTimeToDateAndTime(initialData.toDateTime);
        
        if (fromData) {
          setFromDate(fromData.date);
          const matchingTime = timeOptions.find((opt) => opt === fromData.timeOption);
          setFromTime(matchingTime || timeOptions[0]);
        }
        
        if (toData) {
          setToDate(toData.date);
          const matchingTime = timeOptions.find((opt) => opt === toData.timeOption);
          setToTime(matchingTime || timeOptions[0]);
        }
        
        setReason(initialData.reason || "");
      } else {
        const now = new Date();
        setFromDate(now);
        setToDate(now);
        const currentHour = now.getHours();
        const currentMinute = Math.round(now.getMinutes() / 15) * 15;
        const defaultTime = `${currentHour.toString().padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;
        const defaultTimeOption = timeOptions.find((opt) => opt.startsWith(defaultTime)) || timeOptions[0];
        setFromTime(defaultTimeOption);
        const toHour = currentMinute === 45 ? (currentHour + 1) % 24 : currentHour;
        const toMinute = currentMinute === 45 ? 0 : currentMinute + 15;
        const toTimeStr = `${toHour.toString().padStart(2, "0")}:${toMinute.toString().padStart(2, "0")}`;
        const toTimeOption = timeOptions.find((opt) => opt.startsWith(toTimeStr)) || timeOptions[Math.min(4, timeOptions.length - 1)];
        setToTime(toTimeOption);
        setReason("");
      }
      setError(null);
      setOverlapError(null);
      setShowDeleteConfirm(false);
    }
  }, [open, timeOptions, isEditMode, initialData]);

  React.useEffect(() => {
    if (fromDate && fromTime && toDate && toTime && existingUnavailabilities.length > 0) {
      const fromDateTime = new Date(fromDate);
      const { hour: fromHour, minute: fromMinute } = parseTimeOption(fromTime);
      fromDateTime.setHours(fromHour, fromMinute, 0, 0);

      const toDateTime = new Date(toDate);
      const { hour: toHour, minute: toMinute } = parseTimeOption(toTime);
      toDateTime.setHours(toHour, toMinute, 0, 0);

      if (toDateTime > fromDateTime) {
        const excludeId = isEditMode && initialData ? initialData.id : undefined;
        const hasOverlap = checkOverlap(fromDateTime, toDateTime, existingUnavailabilities, excludeId);
        setOverlapError(hasOverlap ? "Teacher unavailability is overlapped" : null);
      } else {
        setOverlapError(null);
      }
    } else {
      setOverlapError(null);
    }
  }, [fromDate, fromTime, toDate, toTime, existingUnavailabilities, isEditMode, initialData]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!fromDate || !fromTime) {
      setError("Please select From Date Time.");
      return;
    }

    if (!toDate || !toTime) {
      setError("Please select To Date Time.");
      return;
    }

    const fromDateTime = new Date(fromDate);
    const { hour: fromHour, minute: fromMinute } = parseTimeOption(fromTime);
    fromDateTime.setHours(fromHour, fromMinute, 0, 0);

    const toDateTime = new Date(toDate);
    const { hour: toHour, minute: toMinute } = parseTimeOption(toTime);
    toDateTime.setHours(toHour, toMinute, 0, 0);

    if (toDateTime <= fromDateTime) {
      setError("To Date Time must be after From Date Time.");
      return;
    }

    if (existingUnavailabilities.length > 0) {
      const excludeId = isEditMode && initialData ? initialData.id : undefined;
      const hasOverlap = checkOverlap(fromDateTime, toDateTime, existingUnavailabilities, excludeId);
      if (hasOverlap) {
        setOverlapError("Teacher unavailability is overlapped");
        return;
      }
    }

    if (isEditMode && initialData && onUpdate) {
      const updateData: UnavailabilityData = {
        id: initialData.id,
        fromDateTime: formatDateTimeToISO(fromDate, fromTime),
        toDateTime: formatDateTimeToISO(toDate, toTime),
        reason: reason.trim(),
      };
      onUpdate(updateData);
    } else {
      const submitData: Omit<UnavailabilityData, "id"> = {
        fromDateTime: formatDateTimeToISO(fromDate, fromTime),
        toDateTime: formatDateTimeToISO(toDate, toTime),
        reason: reason.trim(),
      };
      onSubmit(submitData);
    }
    onClose();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = () => {
    if (isEditMode && initialData && onDelete) {
      onDelete(initialData.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const resetForm = () => {
    setFromDate(undefined);
    setFromTime("");
    setToDate(undefined);
    setToTime("");
    setReason("");
    setError(null);
    setOverlapError(null);
    setShowDeleteConfirm(false);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unavailability</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && !overlapError && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label 
              htmlFor="from-datetime" 
              className={cn(
                "font-bold",
                overlapError && "text-red-600 dark:text-red-400"
              )}
            >
              From Date Time
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground",
                      overlapError && "border-red-500 focus-visible:ring-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "MMM dd, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={fromTime} onValueChange={setFromTime}>
                <SelectTrigger className={cn(overlapError && "border-red-500 focus:ring-red-500")}>
                  <SelectValue placeholder="Select time">
                    {fromTime ? fromTime.split(" - ")[1] : "Select time"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time.split(" - ")[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {overlapError && (
              <p className="text-sm text-red-600 dark:text-red-400">{overlapError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="to-datetime" className="font-bold">To Date Time</Label>
            <div className="grid grid-cols-2 gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "MMM dd, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Select value={toTime} onValueChange={setToTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time">
                    {toTime ? toTime.split(" - ")[1] : "Select time"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time.split(" - ")[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Enter reason for unavailability"
              rows={4}
              className="resize-none"
            />
          </div>

          <DialogFooter className="flex items-center justify-between w-full">
            <div className="flex-1">
              {isEditMode && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this?"
        onConfirm={handleDeleteConfirm}
      />
    </Dialog>
  );
}

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
import { isoStringToDate } from "@/utils/dateUtils";
import { validateTeacherUnavailability, createTeacherUnavailability, updateTeacherUnavailability, deleteTeacherUnavailability } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";

interface AddUnavailabilityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<UnavailabilityData, "id">) => void;
  onUpdate?: (data: UnavailabilityData) => void;
  onDelete?: (id: string) => void;
  existingUnavailabilities?: UnavailabilityData[];
  initialData?: UnavailabilityData | null;
  mode?: "add" | "edit";
  location?: string;
  teacherId?: number;
  onSuccess?: () => void;
}

function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      times.push(`${h}:${m} - ${format(new Date(2000, 0, 1, hour, minute), "h:mm a")}`);
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
  // Round minutes to nearest 5-minute interval to match timeOptions
  let roundedMinute = Math.round(minute / 5) * 5;
  let adjustedHour = hour;
  // Handle rollover if rounded to 60 minutes
  if (roundedMinute === 60) {
    roundedMinute = 0;
    adjustedHour = (hour + 1) % 24;
  }
  // Create adjusted date for formatting (using year 2000 like timeOptions generation)
  const adjustedDate = new Date(2000, 0, 1, adjustedHour, roundedMinute);
  const timeStr = `${adjustedHour.toString().padStart(2, "0")}:${roundedMinute.toString().padStart(2, "0")}`;
  // Format to match timeOptions format: "HH:mm - h:mm a"
  const formattedTime = format(adjustedDate, "h:mm a");
  return { date: parsedDate, timeOption: `${timeStr} - ${formattedTime}` };
}

function checkOverlap(fromDateTime: Date, toDateTime: Date, existingUnavailabilities: UnavailabilityData[], excludeId?: string): boolean {
  for (const existing of existingUnavailabilities) {
    if (excludeId && existing.id === excludeId) continue;
    const existingFrom = isoStringToDate(existing.fromDateTime);
    const existingTo = isoStringToDate(existing.toDateTime);
    if (existingFrom && existingTo && fromDateTime < existingTo && toDateTime > existingFrom) return true;
  }
  return false;
}

function createDateTime(date: Date, timeOption: string): Date {
  const { hour, minute } = parseTimeOption(timeOption);
  const dateTime = new Date(date);
  dateTime.setHours(hour, minute, 0, 0);
  return dateTime;
}

function formatDateTimeForValidation(date: Date, timeOption: string): string {
  const { hour, minute } = parseTimeOption(timeOption);
  const dateTime = new Date(date);
  dateTime.setHours(hour, minute, 0, 0);
  // Format as "MMM dd, yyyy HH:mm" (e.g., "Dec 22, 2025 11:55")
  return format(dateTime, "MMM dd, yyyy HH:mm");
}

interface DateTimePickerProps {
  date: Date | undefined;
  time: string;
  timeOptions: string[];
  onDateChange: (date: Date | undefined) => void;
  onTimeChange: (time: string) => void;
  onCalendarOpenChange: (open: boolean) => void;
  onTimeSelectOpenChange: (open: boolean) => void;
  dateButtonRef?: React.RefObject<HTMLButtonElement | null>;
  timeSelectRef?: React.RefObject<HTMLButtonElement | null>;
  showError?: boolean;
  label: string;
  popoverOpen?: boolean;
  onPopoverOpenChange?: (open: boolean) => void;
}

const DateTimePicker = React.memo<DateTimePickerProps>(({
  date, time, timeOptions, onDateChange, onTimeChange, onCalendarOpenChange, onTimeSelectOpenChange,
  dateButtonRef, timeSelectRef, showError = false, label, popoverOpen, onPopoverOpenChange,
}) => {
  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate && onPopoverOpenChange) {
      onPopoverOpenChange(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className={cn("font-bold", showError && "text-red-600 dark:text-red-400")}>{label}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Popover 
          open={popoverOpen} 
          onOpenChange={(open) => {
            if (onPopoverOpenChange) {
              onPopoverOpenChange(open);
            }
            onCalendarOpenChange(open);
          }}
        >
          <PopoverTrigger asChild>
            <Button ref={dateButtonRef} variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", showError && "border-red-500 focus-visible:ring-red-500")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar 
              mode="single" 
              selected={date} 
              onSelect={handleDateSelect} 
              initialFocus
              captionLayout="dropdown"
              fromYear={2005}
              toYear={2125}
            />
          </PopoverContent>
        </Popover>
        <Select value={time} onValueChange={onTimeChange} onOpenChange={onTimeSelectOpenChange}>
          <SelectTrigger ref={timeSelectRef} className={cn(showError && "border-red-500 focus:ring-red-500")}>
            <SelectValue placeholder="Select time">{time ? time.split(" - ")[1] : "Select time"}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((timeOption) => (
              <SelectItem key={timeOption} value={timeOption}>{timeOption.split(" - ")[1]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

DateTimePicker.displayName = "DateTimePicker";

export function AddUnavailabilityModal({
  open, onClose, onSubmit, onUpdate, onDelete, existingUnavailabilities = [], initialData = null, mode = "add", location, teacherId, onSuccess,
}: AddUnavailabilityModalProps) {
  const isEditMode = mode === "edit" && initialData !== null;
  const [fromDate, setFromDate] = React.useState<Date | undefined>(undefined);
  const [fromTime, setFromTime] = React.useState<string>("");
  const [toDate, setToDate] = React.useState<Date | undefined>(undefined);
  const [toTime, setToTime] = React.useState<string>("");
  const [reason, setReason] = React.useState("");
  const [overlapError, setOverlapError] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [fromDatePopoverOpen, setFromDatePopoverOpen] = React.useState(false);
  const [toDatePopoverOpen, setToDatePopoverOpen] = React.useState(false);
  const [validationErrors, setValidationErrors] = React.useState<{ [key: string]: string[] }>({});
  const [isValidating, setIsValidating] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fromTimeSelectRef = React.useRef<HTMLButtonElement>(null);
  const toDateButtonRef = React.useRef<HTMLButtonElement>(null);
  const toTimeSelectRef = React.useRef<HTMLButtonElement>(null);
  const timeOptions = React.useMemo(() => generateTimeOptions(), []);
  const excludeId = React.useMemo(() => (isEditMode && initialData ? initialData.id : undefined), [isEditMode, initialData]);
  
  // Store original date/time values for comparison in edit mode
  const originalFromDateTime = React.useRef<string | null>(null);
  const originalToDateTime = React.useRef<string | null>(null);

  const getCurrentTimeOption = React.useCallback(() => {
    const now = new Date();
    const hour = now.getHours();
    const minute = Math.round(now.getMinutes() / 15) * 15;
    return timeOptions.find((opt) => opt.startsWith(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`)) || timeOptions[0];
  }, [timeOptions]);

  const resetForm = React.useCallback(() => {
    setFromDate(undefined);
    setFromTime("");
    setToDate(undefined);
    setToTime("");
    setReason("");
    setError(null);
    setOverlapError(null);
    setShowDeleteConfirm(false);
    setFromDatePopoverOpen(false);
    setToDatePopoverOpen(false);
    setValidationErrors({});
  }, []);

  const handleFromDateCalendarOpen = React.useCallback((open: boolean) => { if (open && !fromDate) setFromDate(new Date()); }, [fromDate]);
  const handleToDateCalendarOpen = React.useCallback((open: boolean) => { if (open && !toDate) setToDate(new Date()); }, [toDate]);
  const handleFromTimeSelectOpen = React.useCallback((open: boolean) => { if (open && !fromTime) setFromTime(getCurrentTimeOption()); }, [fromTime, getCurrentTimeOption]);
  const handleToTimeSelectOpen = React.useCallback((open: boolean) => { if (open && !toTime) setToTime(getCurrentTimeOption()); }, [toTime, getCurrentTimeOption]);
  const handleFromDateSelect = React.useCallback((date: Date | undefined) => { setFromDate(date); if (date) setTimeout(() => fromTimeSelectRef.current?.click(), 100); }, []);
  const handleFromTimeChange = React.useCallback((value: string) => { setFromTime(value); setTimeout(() => toDateButtonRef.current?.click(), 100); }, []);
  const handleToDateSelect = React.useCallback((date: Date | undefined) => { setToDate(date); if (date) setTimeout(() => toTimeSelectRef.current?.click(), 100); }, []);
  const handleToTimeChange = React.useCallback((value: string) => setToTime(value), []);

  React.useEffect(() => {
    if (!open) return;
    if (isEditMode && initialData) {
      const fromData = parseDateTimeToDateAndTime(initialData.fromDateTime);
      const toData = parseDateTimeToDateAndTime(initialData.toDateTime);
      if (fromData) {
        setFromDate(fromData.date);
        setFromTime(timeOptions.find((opt) => opt === fromData.timeOption) || timeOptions[0]);
      }
      if (toData) {
        setToDate(toData.date);
        setToTime(timeOptions.find((opt) => opt === toData.timeOption) || timeOptions[0]);
      }
      setReason(initialData.reason || "");
      // Store original values for comparison
      originalFromDateTime.current = initialData.fromDateTime;
      originalToDateTime.current = initialData.toDateTime;
    } else {
      resetForm();
      originalFromDateTime.current = null;
      originalToDateTime.current = null;
    }
  }, [open, timeOptions, isEditMode, initialData, resetForm]);

  React.useEffect(() => {
    if (!fromDate || !fromTime || !toDate || !toTime || existingUnavailabilities.length === 0) {
      setOverlapError(null);
      return;
    }
    const fromDateTime = createDateTime(fromDate, fromTime);
    const toDateTime = createDateTime(toDate, toTime);
    setOverlapError(toDateTime > fromDateTime && checkOverlap(fromDateTime, toDateTime, existingUnavailabilities, excludeId) ? "Teacher unavailability is overlapped" : null);
  }, [fromDate, fromTime, toDate, toTime, existingUnavailabilities, excludeId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setValidationErrors({});
    setOverlapError(null);

    if (!fromDate || !fromTime || !toDate || !toTime) {
      setError(!fromDate || !fromTime ? "Please select From Date Time." : "Please select To Date Time.");
      return;
    }

    const fromDateTime = createDateTime(fromDate, fromTime);
    const toDateTime = createDateTime(toDate, toTime);
    if (toDateTime <= fromDateTime) {
      setError("To Date Time must be after From Date Time.");
      return;
    }

    // Validate using API if location and teacherId are provided
    if (location && teacherId) {
      setIsValidating(true);
      try {
        const fromDateTimeStr = formatDateTimeForValidation(fromDate, fromTime);
        const toDateTimeStr = formatDateTimeForValidation(toDate, toTime);
        
        const validationResponse = await validateTeacherUnavailability(
          location,
          teacherId,
          fromDateTimeStr,
          toDateTimeStr,
          reason.trim()
        );

        // Check if there are validation errors
        const hasErrors = Object.keys(validationResponse).length > 0;
        if (hasErrors) {
          setValidationErrors(validationResponse);
          
          // Extract and display error messages
          const errorMessages: string[] = [];
          Object.values(validationResponse).forEach((messages) => {
            if (Array.isArray(messages)) {
              errorMessages.push(...messages);
            }
          });
          
          if (validationResponse['teacherunavailability-fromdatetime']) {
            setOverlapError(validationResponse['teacherunavailability-fromdatetime'][0]);
          }
          
          if (validationResponse['teacherunavailability-todatetime']) {
            setError(validationResponse['teacherunavailability-todatetime'][0]);
          } else if (errorMessages.length > 0) {
            setError(errorMessages[0]);
          }
          
          setIsValidating(false);
          return;
        }
      } catch (err) {
        console.error("Validation error:", err);
        const errorMessage = err instanceof Error ? err.message : "Validation failed";
        toast.error(errorMessage);
        setIsValidating(false);
        return;
      } finally {
        setIsValidating(false);
      }
    } else {
      // Fallback to client-side validation if API not available
      if (existingUnavailabilities.length > 0 && checkOverlap(fromDateTime, toDateTime, existingUnavailabilities, excludeId)) {
        setOverlapError("Teacher unavailability is overlapped");
        return;
      }
    }

    // Create using API if location and teacherId are provided and it's add mode
    if (!isEditMode && location && teacherId) {
      setIsSubmitting(true);
      try {
        const fromDateTimeStr = formatDateTimeForValidation(fromDate, fromTime);
        const toDateTimeStr = formatDateTimeForValidation(toDate, toTime);
        
        const response = await createTeacherUnavailability(
          location,
          teacherId,
          fromDateTimeStr,
          toDateTimeStr,
          reason.trim()
        );

        if (response.status) {
          toast.success("Unavailability created successfully");
          // Call success callback to refresh data
          if (onSuccess) {
            onSuccess();
          }
          // Also call onSubmit for Redux update if needed
          const data = { fromDateTime: formatDateTimeToISO(fromDate, fromTime), toDateTime: formatDateTimeToISO(toDate, toTime), reason: reason.trim() };
          onSubmit(data);
          onClose();
        } else {
          toast.error(response.message || "Failed to create unavailability");
        }
      } catch (err) {
        console.error("Create error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to create unavailability";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else if (isEditMode && location && initialData) {
      // Update using API if location is provided and it's edit mode
      setIsSubmitting(true);
      try {
        const fromDateTimeStr = formatDateTimeForValidation(fromDate, fromTime);
        const toDateTimeStr = formatDateTimeForValidation(toDate, toTime);
        
        const response = await updateTeacherUnavailability(
          location,
          initialData.id,
          fromDateTimeStr,
          toDateTimeStr,
          reason.trim()
        );

        if (response.status) {
          toast.success("Unavailability updated successfully");
          // Call success callback to refresh data
          if (onSuccess) {
            onSuccess();
          }
          // Also call onUpdate for Redux update if needed
          const data = { fromDateTime: formatDateTimeToISO(fromDate, fromTime), toDateTime: formatDateTimeToISO(toDate, toTime), reason: reason.trim() };
          if (onUpdate) {
            onUpdate({ ...data, id: initialData.id });
          }
          onClose();
        } else {
          // Handle validation errors from update API
          if (response.errors) {
            setValidationErrors({
              'teacherunavailability-fromdatetime': response.errors.fromDateTime || [],
              'teacherunavailability-todatetime': response.errors.toDateTime || [],
            });
            
            // Don't set overlapError if validationErrors already has the error
            // This prevents duplicate error messages
            if (response.errors.toDateTime && response.errors.toDateTime.length > 0) {
              setError(response.errors.toDateTime[0]);
            } else if (response.errors.fromDateTime && response.errors.fromDateTime.length > 0) {
              setError(response.errors.fromDateTime[0]);
            }
            // Clear overlapError when using validationErrors
            setOverlapError(null);
          } else {
            toast.error(response.message || "Failed to update unavailability");
          }
        }
      } catch (err) {
        console.error("Update error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to update unavailability";
        toast.error(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Fallback to local state management when API not available
      const data = { fromDateTime: formatDateTimeToISO(fromDate, fromTime), toDateTime: formatDateTimeToISO(toDate, toTime), reason: reason.trim() };
      if (isEditMode && initialData && onUpdate) {
        onUpdate({ ...data, id: initialData.id });
      } else {
        onSubmit(data);
      }
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) { resetForm(); onClose(); } }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Unavailability</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && !overlapError && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          <DateTimePicker
            date={fromDate} time={fromTime} timeOptions={timeOptions}
            onDateChange={handleFromDateSelect} onTimeChange={handleFromTimeChange}
            onCalendarOpenChange={handleFromDateCalendarOpen} onTimeSelectOpenChange={handleFromTimeSelectOpen}
            timeSelectRef={fromTimeSelectRef} showError={!!overlapError || !!validationErrors['teacherunavailability-fromdatetime']} label="From Date Time"
            popoverOpen={fromDatePopoverOpen}
            onPopoverOpenChange={setFromDatePopoverOpen}
          />
          {/* Show validationErrors first if available, otherwise show overlapError */}
          {validationErrors['teacherunavailability-fromdatetime'] && validationErrors['teacherunavailability-fromdatetime'].length > 0 ? (
            <p className="text-sm text-red-600 dark:text-red-400">
              {validationErrors['teacherunavailability-fromdatetime'][0]}
            </p>
          ) : overlapError ? (
            <p className="text-sm text-red-600 dark:text-red-400">{overlapError}</p>
          ) : null}
          <DateTimePicker
            date={toDate} time={toTime} timeOptions={timeOptions}
            onDateChange={handleToDateSelect} onTimeChange={handleToTimeChange}
            onCalendarOpenChange={handleToDateCalendarOpen} onTimeSelectOpenChange={handleToTimeSelectOpen}
            dateButtonRef={toDateButtonRef} timeSelectRef={toTimeSelectRef} label="To Date Time"
            popoverOpen={toDatePopoverOpen}
            onPopoverOpenChange={setToDatePopoverOpen}
            showError={!!validationErrors['teacherunavailability-todatetime']}
          />
          {validationErrors['teacherunavailability-todatetime'] && (
            <p className="text-sm text-red-600 dark:text-red-400">
              {validationErrors['teacherunavailability-todatetime'][0]}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for unavailability" rows={4} className="resize-none" />
          </div>
          <DialogFooter className="flex items-center justify-between w-full">
            <div className="flex-1">
              {isEditMode && onDelete && <Button type="button" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>Delete</Button>}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isValidating || isSubmitting || isDeleting}>Cancel</Button>
              <Button 
                type="submit" 
                disabled={
                  isValidating || 
                  isSubmitting || 
                  isDeleting ||
                  !fromDate || 
                  !fromTime || 
                  !toDate || 
                  !toTime ||
                  (isEditMode && (() => {
                    // In edit mode, only enable if fromDateTime or toDateTime has changed
                    if (!originalFromDateTime.current || !originalToDateTime.current) return true;
                    
                    const currentFromDateTime = formatDateTimeToISO(fromDate, fromTime);
                    const currentToDateTime = formatDateTimeToISO(toDate, toTime);
                    
                    const fromChanged = currentFromDateTime !== originalFromDateTime.current;
                    const toChanged = currentToDateTime !== originalToDateTime.current;
                    
                    // Disable if nothing has changed
                    return !fromChanged && !toChanged;
                  })())
                }
              >
                {isSubmitting 
                  ? (isEditMode ? "Updating..." : "Creating...") 
                  : isValidating 
                    ? "Validating..." 
                    : "Save"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this?"
        isDeleting={isDeleting}
        onConfirm={async () => {
          if (!isEditMode || !initialData || !onDelete) return;
          
          // Delete using API if location is provided
          if (location && fromDate && fromTime && toDate && toTime) {
            setIsDeleting(true);
            try {
              const fromDateTimeStr = formatDateTimeForValidation(fromDate, fromTime);
              const toDateTimeStr = formatDateTimeForValidation(toDate, toTime);
              
              const response = await deleteTeacherUnavailability(
                location,
                initialData.id,
                fromDateTimeStr,
                toDateTimeStr,
                reason.trim()
              );

              if (response.status) {
                toast.success("Unavailability deleted successfully");
                // Call success callback to refresh data
                if (onSuccess) {
                  onSuccess();
                }
                // Also call onDelete for Redux update if needed
                onDelete(initialData.id);
                setShowDeleteConfirm(false);
                onClose();
              } else {
                toast.error(response.message || "Failed to delete unavailability");
              }
            } catch (err) {
              console.error("Delete error:", err);
              const errorMessage = err instanceof Error ? err.message : "Failed to delete unavailability";
              toast.error(errorMessage);
            } finally {
              setIsDeleting(false);
            }
          } else {
            // Fallback to local state management when API not available
            onDelete(initialData.id);
            setShowDeleteConfirm(false);
            onClose();
          }
        }}
      />
    </Dialog>
  );
}

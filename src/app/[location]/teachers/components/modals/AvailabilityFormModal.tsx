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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AvailabilityFormData, Classroom } from "../../[id]/mockAvailabilityData";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { cn } from "@/lib/utils";

interface AvailabilityFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: AvailabilityFormData) => Promise<{ success: boolean; errors?: Record<string, string[]> }>;
  onDelete?: (id: string) => void;
  initialData?: {
    id?: string;
    day?: number;
    fromTime?: string;
    toTime?: string;
    classroomId?: number;
  } | null;
  classrooms: Classroom[];
  mode?: "add" | "edit";
  existingAvailabilities?: Array<{
    id: string;
    day: number;
    fromTime: string;
    toTime: string;
  }>;
}

// Day options (Monday-Sunday)
const DAY_OPTIONS = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

// Generate time options (15-minute intervals)
function generateTimeOptions(): string[] {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, "0");
      const m = minute.toString().padStart(2, "0");
      const time24 = `${h}:${m}`;
      const date = new Date(2000, 0, 1, hour, minute);
      const time12 = date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      times.push(`${time24} - ${time12}`);
    }
  }
  return times;
}

// Parse time option to HH:mm:ss format
function parseTimeOption(timeOption: string): string {
  const [timePart] = timeOption.split(" - ");
  return `${timePart}:00`;
}

// Format time string (HH:mm:ss) to time option format
function formatTimeToOption(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":").map(Number);
  const h = hours.toString().padStart(2, "0");
  const m = minutes.toString().padStart(2, "0");
  const time24 = `${h}:${m}`;
  const date = new Date(2000, 0, 1, hours, minutes);
  const time12 = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${time24} - ${time12}`;
}

// Check if time ranges overlap
function checkTimeOverlap(
  day: number,
  fromTime: string,
  toTime: string,
  existingAvailabilities: Array<{
    id: string;
    day: number;
    fromTime: string;
    toTime: string;
  }>,
  excludeId?: string
): boolean {
  for (const existing of existingAvailabilities) {
    if (excludeId && existing.id === excludeId) continue;
    if (existing.day !== day) continue;

    // Convert times to minutes for comparison
    const [fromH, fromM] = fromTime.split(":").map(Number);
    const [toH, toM] = toTime.split(":").map(Number);
    const [existingFromH, existingFromM] = existing.fromTime.split(":").map(Number);
    const [existingToH, existingToM] = existing.toTime.split(":").map(Number);

    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;
    const existingFromMinutes = existingFromH * 60 + existingFromM;
    const existingToMinutes = existingToH * 60 + existingToM;

    // Check for overlap
    if (fromMinutes < existingToMinutes && toMinutes > existingFromMinutes) {
      return true;
    }
  }
  return false;
}

export function AvailabilityFormModal({
  open,
  onClose,
  onSubmit,
  onDelete,
  initialData = null,
  classrooms,
  mode = "add",
  existingAvailabilities = [],
}: AvailabilityFormModalProps) {
  const isEditMode = mode === "edit" && initialData !== null;
  const [day, setDay] = React.useState<number | undefined>(undefined);
  const [fromTime, setFromTime] = React.useState<string>("");
  const [toTime, setToTime] = React.useState<string>("");
  const [classroomId, setClassroomId] = React.useState<number | undefined>(undefined);
  const [error, setError] = React.useState<string | null>(null);
  const [overlapError, setOverlapError] = React.useState<string | null>(null);
  const [apiErrors, setApiErrors] = React.useState<{ fromTime?: string; toTime?: string }>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const timeOptions = React.useMemo(() => generateTimeOptions(), []);
  const excludeId = React.useMemo(() => (isEditMode && initialData ? initialData.id : undefined), [isEditMode, initialData]);

  const resetForm = React.useCallback(() => {
    setDay(undefined);
    setFromTime("");
    setToTime("");
    setClassroomId(undefined);
    setError(null);
    setOverlapError(null);
    setApiErrors({});
    setIsSubmitting(false);
    setShowDeleteConfirm(false);
  }, []);

  // Initialize form when modal opens or initialData changes
  React.useEffect(() => {
    if (!open) {
      resetForm();
      return;
    }

    if (initialData) {
      // Populate form for both add and edit modes when initialData is provided
      setDay(initialData.day);
      setFromTime(initialData.fromTime ? formatTimeToOption(initialData.fromTime) : "");
      setToTime(initialData.toTime ? formatTimeToOption(initialData.toTime) : "");
      setClassroomId(initialData.classroomId);
    } else {
      resetForm();
    }
  }, [open, initialData, resetForm]);

  // Validate time overlap
  React.useEffect(() => {
    // Don't show client-side overlap error if API errors are present
    if (Object.keys(apiErrors).length > 0) {
      return;
    }

    if (!day || !fromTime || !toTime || existingAvailabilities.length === 0) {
      setOverlapError(null);
      return;
    }

    const fromTimeStr = parseTimeOption(fromTime);
    const toTimeStr = parseTimeOption(toTime);

    // Check if fromTime < toTime
    const [fromH, fromM] = fromTimeStr.split(":").map(Number);
    const [toH, toM] = toTimeStr.split(":").map(Number);
    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;

    if (fromMinutes >= toMinutes) {
      setOverlapError("From time must be less than To time.");
      return;
    }

    // Check for overlap
    if (checkTimeOverlap(day, fromTimeStr, toTimeStr, existingAvailabilities, excludeId)) {
      setOverlapError("Availability time overlaps with existing availability for this day.");
      return;
    }

    setOverlapError(null);
  }, [day, fromTime, toTime, existingAvailabilities, excludeId, apiErrors]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setApiErrors({});
    setIsSubmitting(true);

    // Validation
    if (!day) {
      setError("Please select a day.");
      setIsSubmitting(false);
      return;
    }

    if (!fromTime) {
      setError("Please select From Time.");
      setIsSubmitting(false);
      return;
    }

    if (!toTime) {
      setError("Please select To Time.");
      setIsSubmitting(false);
      return;
    }

    const fromTimeStr = parseTimeOption(fromTime);
    const toTimeStr = parseTimeOption(toTime);

    // Validate time range
    const [fromH, fromM] = fromTimeStr.split(":").map(Number);
    const [toH, toM] = toTimeStr.split(":").map(Number);
    const fromMinutes = fromH * 60 + fromM;
    const toMinutes = toH * 60 + toM;

    if (fromMinutes >= toMinutes) {
      setError("From time must be less than To time.");
      setIsSubmitting(false);
      return;
    }

    // Check for overlap (client-side validation)
    if (checkTimeOverlap(day, fromTimeStr, toTimeStr, existingAvailabilities, excludeId)) {
      setOverlapError("Availability time overlaps with existing availability for this day.");
      setIsSubmitting(false);
      return;
    }

    // Submit data
    const formData: AvailabilityFormData = {
      day,
      fromTime: fromTimeStr,
      toTime: toTimeStr,
      classroomId: classroomId || undefined,
    };

    try {
      const result = await onSubmit(formData);
      
      if (result.success) {
        // Only close modal on successful submission
        onClose();
      } else if (result.errors) {
        // Map API error field names to form field names
        const fieldErrors: { fromTime?: string; toTime?: string } = {};
        
        // Map "teacherroom-from_time" to "fromTime"
        if (result.errors["teacherroom-from_time"] && result.errors["teacherroom-from_time"].length > 0) {
          fieldErrors.fromTime = result.errors["teacherroom-from_time"][0];
        }
        
        // Map "teacherroom-to_time" to "toTime"
        if (result.errors["teacherroom-to_time"] && result.errors["teacherroom-to_time"].length > 0) {
          fieldErrors.toTime = result.errors["teacherroom-to_time"][0];
        }
        
        setApiErrors(fieldErrors);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save availability";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (isEditMode && initialData?.id && onDelete) {
      onDelete(initialData.id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  return (
    <>
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
            <DialogTitle>Set Availability and Classroom</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {(error || overlapError) && !Object.keys(apiErrors).length && (
              <div className="rounded border border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error || overlapError}
              </div>
            )}

            {/* Day Selection */}
            <div className="space-y-2">
              <Label htmlFor="day" className={cn("font-bold", (error || overlapError) && "text-red-600 dark:text-red-400")}>
                Day <span className="text-red-500">*</span>
              </Label>
              <Select
                value={day?.toString()}
                onValueChange={(value) => {
                  setDay(Number(value));
                  setError(null);
                  setOverlapError(null);
                }}
                disabled={isEditMode}
              >
                <SelectTrigger
                  id="day"
                  className={cn((error || overlapError) && "border-red-500 focus:ring-red-500")}
                >
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* From Time */}
            <div className="space-y-2">
              <Label htmlFor="fromTime" className={cn("font-bold", (error || overlapError || apiErrors.fromTime) && "text-red-600 dark:text-red-400")}>
                From Time <span className="text-red-500">*</span>
              </Label>
              <Select
                value={fromTime}
                onValueChange={(value) => {
                  setFromTime(value);
                  setError(null);
                  setOverlapError(null);
                  setApiErrors((prev) => ({ ...prev, fromTime: undefined }));
                }}
              >
                <SelectTrigger
                  id="fromTime"
                  className={cn((error || overlapError || apiErrors.fromTime) && "border-red-500 focus:ring-red-500")}
                >
                  <SelectValue placeholder="Select time">
                    {fromTime ? fromTime.split(" - ")[1] : "Select time"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption.split(" - ")[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {apiErrors.fromTime && (
                <p className="text-sm text-red-600 dark:text-red-400">{apiErrors.fromTime}</p>
              )}
            </div>

            {/* To Time */}
            <div className="space-y-2">
              <Label htmlFor="toTime" className={cn("font-bold", (error || overlapError || apiErrors.toTime) && "text-red-600 dark:text-red-400")}>
                To Time <span className="text-red-500">*</span>
              </Label>
              <Select
                value={toTime}
                onValueChange={(value) => {
                  setToTime(value);
                  setError(null);
                  setOverlapError(null);
                  setApiErrors((prev) => ({ ...prev, toTime: undefined }));
                }}
              >
                <SelectTrigger
                  id="toTime"
                  className={cn((error || overlapError || apiErrors.toTime) && "border-red-500 focus:ring-red-500")}
                >
                  <SelectValue placeholder="Select time">
                    {toTime ? toTime.split(" - ")[1] : "Select time"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((timeOption) => (
                    <SelectItem key={timeOption} value={timeOption}>
                      {timeOption.split(" - ")[1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {apiErrors.toTime && (
                <p className="text-sm text-red-600 dark:text-red-400">{apiErrors.toTime}</p>
              )}
            </div>

            {/* Classroom Selection (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="classroom">Classroom</Label>
              <Select
                value={classroomId?.toString() || ""}
                onValueChange={(value) => {
                  setClassroomId(value ? Number(value) : undefined);
                }}
              >
                <SelectTrigger id="classroom">
                  <SelectValue placeholder="Select Classroom (Optional)" />
                </SelectTrigger>
                <SelectContent>
                  {/* <SelectItem value="">None (No classroom assigned)</SelectItem> */}
                  {classrooms.map((classroom) => (
                    <SelectItem key={classroom.id} value={classroom.id.toString()}>
                      {classroom.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="flex items-center justify-between w-full">
              <div className="flex-1">
                {isEditMode && onDelete && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Delete
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this availability?"
        onConfirm={handleDelete}
      />
    </>
  );
}


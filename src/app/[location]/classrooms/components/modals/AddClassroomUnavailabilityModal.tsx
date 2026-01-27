"use client";

import * as React from "react";

import { DateRangePicker } from "@/components/DateRangePicker";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { convertToDate, formatDateToISO } from "@/utils/dateUtils";

export interface ClassroomUnavailabilityRow {
  id: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  reason: string;
}

interface AddClassroomUnavailabilityModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<ClassroomUnavailabilityRow, "id">) => void;
  onUpdate?: (data: ClassroomUnavailabilityRow) => void;
  onDelete?: (id: string) => void;
  initialData?: ClassroomUnavailabilityRow | null;
  mode?: "add" | "edit";
}

export function AddClassroomUnavailabilityModal({
  open,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
  initialData = null,
  mode = "add",
}: AddClassroomUnavailabilityModalProps) {
  const isEditMode = mode === "edit";

  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date } | undefined>(undefined);
  const [dateRangeError, setDateRangeError] = React.useState<string | null>(null);
  const [reason, setReason] = React.useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const resetForm = React.useCallback(() => {
    setDateRange(undefined);
    setDateRangeError(null);
    setReason("");
    setShowDeleteConfirm(false);
  }, []);

  React.useEffect(() => {
    if (!open) return;
    if (!initialData) {
      resetForm();
      return;
    }

    const from = convertToDate(initialData.fromDate);
    const to = convertToDate(initialData.toDate);
    setDateRange(from && to ? { from, to } : undefined);
    setDateRangeError(null);
    setReason(initialData.reason || "");
    setShowDeleteConfirm(false);
  }, [initialData, open, resetForm]);

  const canSave = Boolean(dateRange?.from && dateRange?.to);

  const handleSave = () => {
    if (!dateRange?.from || !dateRange?.to) {
      setDateRangeError("Date Range is required.");
      return;
    }
    const payload = {
      fromDate: formatDateToISO(dateRange.from),
      toDate: formatDateToISO(dateRange.to),
      reason: reason.trim(),
    };

    if (isEditMode && initialData && onUpdate) {
      onUpdate({ ...payload, id: initialData.id });
    } else {
      onSubmit(payload);
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (!v ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Unavailability</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                  setDateRangeError(null);
                }
              }}
              preset="privateLessons"
              className={dateRangeError ? "w-full border border-red-500 rounded-md" : "w-full"}
            />
            {dateRangeError && (
              <p className="text-sm text-red-600 dark:text-red-400">{dateRangeError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="classroom-unavailability-reason">Reason</Label>
            <Textarea
              id="classroom-unavailability-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={8}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between w-full">
          <div className="flex-1">
            {isEditMode && initialData && onDelete && (
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
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={!canSave}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this?"
        onConfirm={() => {
          if (!isEditMode || !initialData || !onDelete) return;
          onDelete(initialData.id);
          setShowDeleteConfirm(false);
          onClose();
        }}
      />
    </Dialog>
  );
}


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
import { DurationPicker } from "@/components/DurationPicker";
import type { PrivateLessonRow } from "../privateLessonsListing.api";

interface EditDurationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLessons: PrivateLessonRow[];
  onSave: (duration: string, lessonIds: number[]) => Promise<boolean>;
}

export function EditDurationModal({
  open,
  onOpenChange,
  selectedLessons,
  onSave,
}: EditDurationModalProps) {
  const [duration, setDuration] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);

  // Determine initial duration value when modal opens
  React.useEffect(() => {
    if (open) {
      if (selectedLessons.length === 0) {
        setDuration("");
        setError("");
        return;
      }

      // Check if all selected lessons have the same duration
      const firstDuration = selectedLessons[0]?.duration || "";
      const allSameDuration = selectedLessons.every(
        (lesson) => lesson.duration === firstDuration
      );

      if (allSameDuration && firstDuration) {
        setDuration(firstDuration);
      } else {
        // Multiple different durations - show placeholder
        setDuration("");
      }
      setError("");
    } else {
      // Reset when modal closes
      setDuration("");
      setError("");
    }
  }, [open, selectedLessons]);

  const handleSave = async () => {
    if (!duration || duration.trim() === "") {
      setError("Duration cannot be blank.");
      return;
    }

    const durationRegex = /^\d{2}:\d{2}$/;
    if (!durationRegex.test(duration)) {
      setError("Duration must be in HH:mm format.");
      return;
    }

    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    setIsSaving(true);
    try {
      const success = await onSave(duration, lessonIds);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setDuration("");
    setError("");
    onOpenChange(false);
  };

  // Determine if we should show [multiple] placeholder
  const showMultiplePlaceholder = React.useMemo(() => {
    if (selectedLessons.length === 0) return false;
    if (selectedLessons.length === 1) return false;
    
    const firstDuration = selectedLessons[0]?.duration || "";
    const allSameDuration = selectedLessons.every(
      (lesson) => lesson.duration === firstDuration
    );
    
    return !allSameDuration || !firstDuration;
  }, [selectedLessons]);

  // Get display value - show "00:00" when empty, but indicate multiple with helper text
  const displayDuration = React.useMemo(() => {
    if (showMultiplePlaceholder && !duration) {
      return "00:00"; // Default value for DurationPicker
    }
    return duration || "00:00";
  }, [duration, showMultiplePlaceholder]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Duration</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <DurationPicker
              value={displayDuration}
              onChange={setDuration}
              label="Duration"
              error={error}
              className="w-full"
            />
            {showMultiplePlaceholder && !duration && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                [multiple]
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!duration || duration.trim() === "" || isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import type { PrivateLessonRow } from "../privateLessonsListing.api";

interface EditOnlineTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLessons: PrivateLessonRow[];
  onSave: (onlineStatus: string, lessonIds: number[]) => Promise<boolean>;
}

export function EditOnlineTypeModal({
  open,
  onOpenChange,
  selectedLessons,
  onSave,
}: EditOnlineTypeModalProps) {
  const [onlineType, setOnlineType] = React.useState<string>("online");
  const [isSaving, setIsSaving] = React.useState(false);

  // Determine initial value based on selected lessons
  React.useEffect(() => {
    if (open && selectedLessons.length > 0) {
      // Check if all selected lessons have the same online status
      const firstOnline = selectedLessons[0]?.online?.toLowerCase() === "yes";
      const allSameOnline = selectedLessons.every(
        (lesson) => (lesson.online?.toLowerCase() === "yes") === firstOnline
      );

      if (allSameOnline) {
        setOnlineType(firstOnline ? "online" : "in-class");
      } else {
        // Multiple different statuses - default to "online"
        setOnlineType("online");
      }
    }
  }, [open, selectedLessons]);

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setOnlineType("online");
    }
  }, [open]);

  const handleSave = React.useCallback(async () => {
    const onlineStatus = onlineType === "online" ? "Yes" : "No";
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    setIsSaving(true);
    try {
      const success = await onSave(onlineStatus, lessonIds);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [onlineType, selectedLessons, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setOnlineType("online");
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Edit online type
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={onlineType} onValueChange={setOnlineType}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="online" id="online" />
              <Label htmlFor="online" className="cursor-pointer">
                Make Online
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="in-class" id="in-class" />
              <Label htmlFor="in-class" className="cursor-pointer">
                Make In Class
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


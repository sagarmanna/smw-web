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
import { LessonData } from "../../[id]/groupCourseTabConfigs";

interface EditOnlineTypeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLessons: LessonData[];
  onSave: (isOnline: boolean, lessonIds: string[]) => void;
}

export function EditOnlineTypeModal({
  open,
  onOpenChange,
  selectedLessons,
  onSave,
}: EditOnlineTypeModalProps) {
  const [onlineType, setOnlineType] = React.useState<string>("online");

  // Determine initial value based on selected lessons
  React.useEffect(() => {
    if (selectedLessons.length > 0) {
      // If all selected lessons are online, default to "online", otherwise "in-class"
      const allOnline = selectedLessons.every((lesson) => lesson.isOnline);
      setOnlineType(allOnline ? "online" : "in-class");
    }
  }, [selectedLessons]);

  const handleSave = React.useCallback(() => {
    const isOnline = onlineType === "online";
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    onSave(isOnline, lessonIds);
    onOpenChange(false);
  }, [onlineType, selectedLessons, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


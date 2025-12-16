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
import { Input } from "@/components/ui/input";
import { Calendar as CalendarIcon, Plus, Minus } from "lucide-react";
import { GroupCourseRow } from "../../types";
import { cn } from "@/lib/utils";

interface ScheduleRow {
  id: string;
  day: string;
  time: string;
}

interface AddGroupCourseScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack: () => void;
  course: Partial<GroupCourseRow> | null;
}

export function AddGroupCourseScheduleModal({
  open,
  onOpenChange,
  onBack,
  course,
}: AddGroupCourseScheduleModalProps) {
  const [rows, setRows] = React.useState<ScheduleRow[]>([
    { id: "row-1", day: "", time: "" },
  ]);

  React.useEffect(() => {
    if (open) {
      setRows([{ id: "row-1", day: "", time: "" }]);
    }
  }, [open]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: `row-${prev.length + 1}`, day: "", time: "" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };


  const handlePreviewLessons = () => {
    // For now this is a no-op; real implementation will open a lessons preview modal
  };

  const title = course?.program
    ? `Create Group Course - ${course.program}`
    : "Create Group Course";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-left">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-[80px,1fr,1fr,80px] items-center gap-3 px-2">
            <span className="font-semibold text-sm text-muted-foreground">Schedule</span>
            <span className="font-semibold text-sm text-muted-foreground">Day</span>
            <span className="font-semibold text-sm text-muted-foreground">Time</span>
            <span />
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.id}
                className="grid grid-cols-[80px,1fr,1fr,80px] items-center gap-3 px-2"
              >
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    disabled
                    className={cn(
                      "h-9 w-9 rounded-md border border-input bg-background flex items-center justify-center text-muted-foreground opacity-50 cursor-not-allowed"
                    )}
                    title="Calendar selection not available"
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  placeholder="Day"
                  value={row.day}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, day: e.target.value } : r
                      )
                    )
                  }
                />
                <Input
                  placeholder="Time (e.g. 07:30 PM)"
                  value={row.time}
                  onChange={(e) =>
                    setRows((prev) =>
                      prev.map((r) =>
                        r.id === row.id ? { ...r, time: e.target.value } : r
                      )
                    )
                  }
                />
                <div className="flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    className="h-8 w-8 bg-primary hover:bg-primary/90"
                    onClick={handleAddRow}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={() => handleRemoveRow(row.id)}
                    disabled={rows.length <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handlePreviewLessons}>
              Preview Lessons
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



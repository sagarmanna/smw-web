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
import { format, addDays } from "date-fns";

export interface LessonPreview {
  index: number;
  date: string;      // YYYY-MM-DD
  day: string;       // e.g. Thursday
  startTime: string; // HH:mm
  duration: string;  // HH:mm
}

interface NewEnrolmentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessons: LessonPreview[];
  onBack?: () => void;
  onConfirm?: () => void;
}

export function NewEnrolmentReviewModal({
  open,
  onOpenChange,
  lessons,
  onBack,
  onConfirm,
}: NewEnrolmentReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Preview Lessons</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {lessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center">
              No lessons to preview. Please complete the previous steps.
            </p>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left">#</th>
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Day</th>
                    <th className="px-3 py-2 text-left">Start Time</th>
                    <th className="px-3 py-2 text-left">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => {
                    const parsedDate = new Date(lesson.date);
                    const displayDate = isNaN(parsedDate.getTime())
                      ? lesson.date
                      : format(parsedDate, "MMM dd, yyyy");
                    return (
                      <tr key={lesson.index} className="border-t">
                        <td className="px-3 py-2">{lesson.index}</td>
                        <td className="px-3 py-2">{displayDate}</td>
                        <td className="px-3 py-2">{lesson.day}</td>
                        <td className="px-3 py-2">{lesson.startTime}</td>
                        <td className="px-3 py-2">{lesson.duration}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {lessons.length > 0 && (
            <p className="text-xs text-muted-foreground">
              This is a preview based on the selected start date, day, time, and number of
              lessons. Final scheduling may adjust for holidays or other constraints in the
              legacy system.
            </p>
          )}
        </div>

        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          <Button type="button" onClick={onBack}>
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
            <Button type="button" onClick={onConfirm}>
              Confirm Enrolment
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



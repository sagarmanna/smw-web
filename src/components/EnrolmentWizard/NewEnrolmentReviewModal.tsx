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
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export interface LessonPreview {
  index: number;
  date: string;      // YYYY-MM-DD
  day: string;       // e.g. Thursday
  startTime: string; // HH:mm
  duration: string;  // HH:mm
  conflict?: string; // Optional conflict message
  isHolidayConflict?: boolean; // Whether this is a holiday conflict
  isConflict?: boolean; // Whether this has a conflict
  isUnscheduled?: boolean; // Whether this lesson is unscheduled
}

export interface EnrolmentReviewDetails {
  studentName?: string;
  programName?: string;
  teacherName?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
}

interface NewEnrolmentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessons: LessonPreview[];
  details?: EnrolmentReviewDetails;
  onBack?: () => void;
  onConfirm?: () => void;
  isLoading?: boolean; // Loading state for Confirm Enrolment button
}

export function NewEnrolmentReviewModal({
  open,
  onOpenChange,
  lessons,
  details,
  onBack,
  onConfirm,
  isLoading = false,
}: NewEnrolmentReviewModalProps) {
  // Debug: Log details when they change
  React.useEffect(() => {
    if (open && details) {
      console.log('[NewEnrolmentReviewModal] Details:', details);
    }
  }, [open, details]);

  // Calculate summary statistics
  const summary = React.useMemo(() => {
    const holidayConflictedCount = lessons.filter(l => l.isHolidayConflict).length;
    const conflictedCount = lessons.filter(l => l.isConflict && !l.isHolidayConflict).length;
    const unscheduledCount = lessons.filter(l => l.isUnscheduled && !l.isHolidayConflict && !l.isConflict).length;
    const scheduledCount = lessons.length - (holidayConflictedCount + conflictedCount + unscheduledCount);
    const totalCount = lessons.length;

    return {
      holidayConflicted: holidayConflictedCount,
      conflicted: conflictedCount,
      unscheduled: unscheduledCount,
      scheduled: scheduledCount,
      total: totalCount,
    };
  }, [lessons]);

  // Format date/time similar to legacy (datetime format)
  const formatDateTime = (date: string, time: string): string => {
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return `${date} ${time}`;
      
      const formattedDate = format(dateObj, "MMM dd, yyyy");
      return `${formattedDate} ${time}`;
    } catch {
      return `${date} ${time}`;
    }
  };

  // Format duration from HH:mm to H:i format (like legacy)
  const formatDuration = (duration: string): string => {
    try {
      const [hours, minutes] = duration.split(':');
      return `${hours}:${minutes || '00'}`;
    } catch {
      return duration;
    }
  };

  // Format time to h:i A format (like legacy)
  const formatTime = (time: string | undefined): string => {
    if (!time) return '';
    try {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours, 10);
      const min = (minutes || '00').padStart(2, '0');
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${min} ${ampm}`;
    } catch {
      return time;
    }
  };

  // Format period (start date to end date)
  const formatPeriod = (startDate?: string, endDate?: string): string => {
    if (!startDate || !endDate) return '';
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
      return `${format(start, "MMM dd, yyyy")} to ${format(end, "MMM dd, yyyy")}`;
    } catch {
      return '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Review Lessons</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Details and Summary Section - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Details Section - Left */}
            <div className="border rounded-md p-4 bg-muted/50">
              <h3 className="text-sm font-semibold mb-3">Details</h3>
              {details ? (
                <dl className="space-y-2 text-sm">
                  {details.studentName && (
                    <div>
                      <dt className="text-muted-foreground font-medium">Student</dt>
                      <dd className="mt-1">{details.studentName}</dd>
                    </div>
                  )}
                  {details.programName && (
                    <div>
                      <dt className="text-muted-foreground font-medium">Program</dt>
                      <dd className="mt-1">{details.programName}</dd>
                    </div>
                  )}
                  {details.teacherName && (
                    <div>
                      <dt className="text-muted-foreground font-medium">Teacher</dt>
                      <dd className="mt-1">{details.teacherName}</dd>
                    </div>
                  )}
                  {details.startDate && details.endDate && (
                    <div>
                      <dt className="text-muted-foreground font-medium">Period</dt>
                      <dd className="mt-1">{formatPeriod(details.startDate, details.endDate)}</dd>
                    </div>
                  )}
                  {details.startTime && (
                    <div>
                      <dt className="text-muted-foreground font-medium">Time</dt>
                      <dd className="mt-1">{formatTime(details.startTime)}</dd>
                    </div>
                  )}
                  {!details.studentName && !details.programName && !details.teacherName && 
                   !details.startDate && !details.endDate && !details.startTime && (
                    <p className="text-xs text-muted-foreground">No details available</p>
                  )}
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">No details available</p>
              )}
            </div>

            {/* Summary Section - Right */}
            <div className="border rounded-md p-4 bg-muted/50">
              <h3 className="text-sm font-semibold mb-3">Review Lessons Summary</h3>
              {lessons.length > 0 ? (
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-muted-foreground text-xs">Unscheduled Lesson(s)</dt>
                    <dt className="text-muted-foreground text-xs">due to holiday conflict</dt>
                    <dd className="text-lg font-semibold">{summary.holidayConflicted}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Unscheduled Lessons</dt>
                    <dd className="text-lg font-semibold">{summary.unscheduled}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Scheduled Lessons</dt>
                    <dd className="text-lg font-semibold">{summary.scheduled}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Conflicted Lesson(s)</dt>
                    <dd className="text-lg font-semibold">{summary.conflicted}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground text-xs">Total Lessons</dt>
                    <dd className="text-lg font-semibold">{summary.total}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">No lessons to summarize</p>
              )}
            </div>
          </div>

          {lessons.length === 0 ? (
            <div className="border rounded-md p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No conflicts here! You are ready to confirm!
              </p>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Date/Time</th>
                    <th className="px-3 py-2 text-left font-semibold">Duration</th>
                    <th className="px-3 py-2 text-left font-semibold">Conflict</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.map((lesson) => {
                    const dateTime = formatDateTime(lesson.date, lesson.startTime);
                    const duration = formatDuration(lesson.duration);
                    const hasConflict = lesson.isConflict || lesson.isHolidayConflict || lesson.isUnscheduled;
                    
                    return (
                      <tr key={lesson.index} className="border-t hover:bg-muted/50">
                        <td className="px-3 py-2">{dateTime}</td>
                        <td className="px-3 py-2">{duration}</td>
                        <td className="px-3 py-2">
                          {lesson.conflict || (hasConflict ? (
                            <span className="text-destructive text-xs">
                              {lesson.isHolidayConflict ? 'Holiday conflict' : 
                               lesson.isConflict ? 'Conflict' : 
                               lesson.isUnscheduled ? 'Unscheduled' : ''}
                            </span>
                          ) : null)}
                        </td>
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
            <Button type="button" onClick={onConfirm} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Enrolment
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



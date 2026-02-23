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
import { format, parse } from "date-fns";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { LessonEditModal } from "./LessonEditModal";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { toast } from "sonner";

export interface LessonPreview {
  index: number;
  id?: number;       // Lesson ID for editing
  date: string;      // YYYY-MM-DD
  day: string;       // e.g. Thursday
  startTime: string; // HH:mm
  duration: string;  // HH:mm
  conflict?: string; // Optional conflict message
  isHolidayConflict?: boolean; // Whether this is a holiday conflict
  isConflict?: boolean; // Whether this has a conflict
  isUnscheduled?: boolean; // Whether this lesson is unscheduled
  programId?: string; // Program ID for filtering teachers
}

export interface EnrolmentReviewDetails {
  studentName?: string;
  programId?: number; // From lesson review API; used in edit modal
  programName?: string;
  teacherName?: string;
  teacherId?: number; // From lesson review API; used in edit modal
  startDate?: string;
  endDate?: string;
  startTime?: string;
  // Bulk teacher change details
  oldTeacherName?: string;
  newTeacherName?: string;
  studentNames?: string; // Comma-separated list for multiple students
  changesFrom?: string;
  isBulkTeacherChange?: boolean;
}

interface NewEnrolmentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessons: LessonPreview[];
  details?: EnrolmentReviewDetails;
  onBack?: () => void;
  onConfirm?: () => void;
  isLoading?: boolean; // Loading state for Confirm Enrolment button
  onLessonUpdated?: () => void; // Callback when a lesson is updated
  /** When provided, a delete action is shown per lesson and this is called on delete (e.g. group course review) */
  onDeleteLesson?: (lessonId: number) => Promise<boolean | void>;
  location?: string; // Location slug for API calls
  courseId?: number; // Course ID for refreshing review data
  programId?: string; // Program ID for filtering teachers
  unscheduledLessons?: LessonPreview[]; // Old confirmed lessons that became unscheduled
  rescheduledLessons?: LessonPreview[]; // Old confirmed lessons that were rescheduled
  isPermanentScheduleChange?: boolean; // Whether this is a permanent schedule change flow
}

export function NewEnrolmentReviewModal({
  open,
  onOpenChange,
  lessons,
  details,
  onBack,
  onConfirm,
  isLoading = false,
  onLessonUpdated,
  onDeleteLesson,
  location,
  courseId,
  programId,
  unscheduledLessons = [],
  rescheduledLessons = [],
  isPermanentScheduleChange = false,
}: NewEnrolmentReviewModalProps) {
  const [editingLesson, setEditingLesson] = React.useState<{
    id: number;
    date: string;
    time: string;
    duration: string;
    programId?: string;
  } | null>(null);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [deletingLessonId, setDeletingLessonId] = React.useState<number | null>(null);
  const [lessonIdToDelete, setLessonIdToDelete] = React.useState<number | null>(null);

  const handleDeleteLessonConfirm = React.useCallback(async () => {
    if (lessonIdToDelete == null || !onDeleteLesson) return;
    setDeletingLessonId(lessonIdToDelete);
    try {
      const ok = await onDeleteLesson(lessonIdToDelete);
      if (ok !== false) {
        toast.success("Lesson deleted successfully");
        setLessonIdToDelete(null);
      } else {
        toast.error("Failed to delete lesson");
      }
    } catch {
      toast.error("Failed to delete lesson");
    } finally {
      setDeletingLessonId(null);
    }
  }, [lessonIdToDelete, onDeleteLesson]);

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

  // Check if there are any conflicts (excluding holiday conflicts which are handled separately)
  const hasConflicts = React.useMemo(() => {
    return lessons.some(lesson => lesson.isConflict || lesson.conflict);
  }, [lessons]);

  // Format date/time similar to legacy (datetime format with AM/PM)
  const formatDateTime = (date: string, time: string): string => {
    try {
      // Handle both YYYY-MM-DD and YYYY-MM-DDTHH:mm:ss formats
      // If date includes time (T), parse it carefully to avoid timezone issues
      let dateObj: Date;
      if (date.includes('T')) {
        // Date string includes time - parse as local time (not UTC)
        // Split date and time, then create date object treating as local time
        const [datePart, timePart] = date.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [hours, minutes, seconds] = (timePart || '').split(':').map(Number);
        // Create date object in local timezone (not UTC)
        dateObj = new Date(year, month - 1, day, hours || 0, minutes || 0, seconds || 0);
      } else {
        // Date only format (YYYY-MM-DD) - parse as local date
        const [year, month, day] = date.split('-').map(Number);
        dateObj = new Date(year, month - 1, day);
      }
      
      if (isNaN(dateObj.getTime())) return `${date} ${formatTime(time)}`;
      
      const formattedDate = format(dateObj, "MMM dd, yyyy");
      return `${formattedDate} ${formatTime(time)}`;
    } catch {
      return `${date} ${formatTime(time)}`;
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
  // Extracts date portion from UTC datetime strings to avoid timezone conversion issues
  const formatPeriod = (startDate?: string, endDate?: string): string => {
    if (!startDate || !endDate) return '';
    try {
      // Extract date portion (YYYY-MM-DD) from ISO datetime string
      // Handles both "2026-01-20T18:30:00.000Z" and "2026-01-20" formats
      const startDateStr = startDate.split('T')[0];
      const endDateStr = endDate.split('T')[0];
      
      // Parse dates using date-fns parse (parses as local date, which is what we want for display)
      const start = parse(startDateStr, 'yyyy-MM-dd', new Date());
      const end = parse(endDateStr, 'yyyy-MM-dd', new Date());
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return '';
      
      // Format using date-fns format
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
          {/* Details and Summary/Unscheduled-Rescheduled Section - Side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Details Section - Left */}
            <div className="border rounded-md p-4 bg-muted/50">
              <h3 className="text-sm font-semibold mb-3">Details</h3>
              {details ? (
                <dl className="space-y-2 text-sm">
                  {details.isBulkTeacherChange ? (
                    <>
                      {details.oldTeacherName && (
                        <div>
                          <dt className="text-muted-foreground font-medium">Old Teacher</dt>
                          <dd className="mt-1">{details.oldTeacherName}</dd>
                        </div>
                      )}
                      {details.newTeacherName && (
                        <div>
                          <dt className="text-muted-foreground font-medium">New Teacher</dt>
                          <dd className="mt-1">{details.newTeacherName}</dd>
                        </div>
                      )}
                      {details.studentNames && (
                        <div>
                          <dt className="text-muted-foreground font-medium">Students</dt>
                          <dd className="mt-1">{details.studentNames}</dd>
                        </div>
                      )}
                      {details.changesFrom && (
                        <div>
                          <dt className="text-muted-foreground font-medium">As of</dt>
                          <dd className="mt-1">
                            {format(new Date(details.changesFrom), "MMM dd, yyyy")}
                          </dd>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                  {details.isBulkTeacherChange && 
                   !details.oldTeacherName && !details.newTeacherName && 
                   !details.studentNames && !details.changesFrom && (
                    <p className="text-xs text-muted-foreground">No details available</p>
                  )}
                  {!details.isBulkTeacherChange && 
                   !details.studentName && !details.programName && !details.teacherName && 
                   !details.startDate && !details.endDate && !details.startTime && (
                    <p className="text-xs text-muted-foreground">No details available</p>
                  )}
                </dl>
              ) : (
                <p className="text-xs text-muted-foreground">No details available</p>
              )}
            </div>

            {/* Summary Section - Right (only for non-permanent schedule change) */}
            {!isPermanentScheduleChange && (
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
            )}
          </div>

          {/* Unscheduled and Rescheduled Lessons Sections - For permanent schedule change, show instead of Summary */}
          {isPermanentScheduleChange && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unscheduled Lessons Section */}
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="text-sm font-semibold">Unscheduled Lessons</h3>
                </div>
                {unscheduledLessons.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Date/Time</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unscheduledLessons.map((lesson, index) => {
                        const dateTime = formatDateTime(lesson.date, lesson.startTime);
                        const duration = formatDuration(lesson.duration);
                        return (
                          <tr key={index} className="border-t hover:bg-muted/50">
                            <td className="px-3 py-2">{dateTime}</td>
                            <td className="px-3 py-2">{duration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No Unscheduled Lessons</p>
                  </div>
                )}
              </div>

              {/* Rescheduled Lessons Section */}
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="text-sm font-semibold">Rescheduled Lessons</h3>
                </div>
                {rescheduledLessons.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Date/Time</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rescheduledLessons.map((lesson, index) => {
                        const dateTime = formatDateTime(lesson.date, lesson.startTime);
                        const duration = formatDuration(lesson.duration);
                        return (
                          <tr key={index} className="border-t hover:bg-muted/50">
                            <td className="px-3 py-2">{dateTime}</td>
                            <td className="px-3 py-2">{duration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No Rescheduled Lessons</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Unscheduled and Rescheduled Lessons Sections - Side by side (for non-permanent schedule change, show below Summary) */}
          {!isPermanentScheduleChange && (unscheduledLessons.length > 0 || rescheduledLessons.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Unscheduled Lessons Section */}
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="text-sm font-semibold">Unscheduled Lessons</h3>
                </div>
                {unscheduledLessons.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Date/Time</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unscheduledLessons.map((lesson, index) => {
                        const dateTime = formatDateTime(lesson.date, lesson.startTime);
                        const duration = formatDuration(lesson.duration);
                        return (
                          <tr key={index} className="border-t hover:bg-muted/50">
                            <td className="px-3 py-2">{dateTime}</td>
                            <td className="px-3 py-2">{duration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No Unscheduled Lessons</p>
                  </div>
                )}
              </div>

              {/* Rescheduled Lessons Section */}
              <div className="border rounded-md overflow-hidden">
                <div className="bg-muted px-4 py-2 border-b">
                  <h3 className="text-sm font-semibold">Rescheduled Lessons</h3>
                </div>
                {rescheduledLessons.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Date/Time</th>
                        <th className="px-3 py-2 text-left font-semibold text-xs">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rescheduledLessons.map((lesson, index) => {
                        const dateTime = formatDateTime(lesson.date, lesson.startTime);
                        const duration = formatDuration(lesson.duration);
                        return (
                          <tr key={index} className="border-t hover:bg-muted/50">
                            <td className="px-3 py-2">{dateTime}</td>
                            <td className="px-3 py-2">{duration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-muted-foreground">No Rescheduled Lessons</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {lessons.length === 0 ? (
            <div className="border rounded-md p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No future lessons to review.
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
                    <th className="px-3 py-2 text-left font-semibold">Action</th>
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
                              {lesson.conflict || (
                                lesson.isHolidayConflict ? 'Holiday conflict' : 
                                lesson.isConflict ? 'Conflict' : 
                                lesson.isUnscheduled ? 'Unscheduled' : ''
                              )}
                            </span>
                          ) : null)}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            {lesson.id && location && (
                              <Pencil
                                className="h-4 w-4 text-blue-600 cursor-pointer hover:text-blue-800 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const lessonDate = new Date(lesson.date);
                                  const hours = lessonDate.getUTCHours();
                                  const minutes = lessonDate.getUTCMinutes();
                                  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
                                  setEditingLesson({
                                    id: lesson.id!,
                                    date: lesson.date,
                                    time: timeStr,
                                    duration: lesson.duration,
                                  });
                                  setEditModalOpen(true);
                                }}
                              />
                            )}
                            {lesson.id && onDeleteLesson && (
                              <button
                                type="button"
                                aria-label="Delete lesson"
                                disabled={deletingLessonId === lesson.id}
                                className="text-destructive hover:text-destructive/80 disabled:opacity-50 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (lesson.id) setLessonIdToDelete(lesson.id);
                                }}
                              >
                                {deletingLessonId === lesson.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* {lessons.length > 0 && (
            <p className="text-xs text-muted-foreground">
              This is a preview based on the selected start date, day, time, and number of
              lessons. Only future lessons are shown. Final scheduling may adjust for holidays or other constraints in the
              legacy system.
            </p>
          )} */}
        </div>

        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          {onBack && !details?.isBulkTeacherChange && (
            <Button type="button" onClick={onBack}>
              Back
            </Button>
          )}
          {(!onBack || details?.isBulkTeacherChange) && <div />}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={onConfirm} 
              disabled={isLoading || hasConflicts}
              title={hasConflicts ? "Please resolve all conflicts before confirming" : isLoading ? "Processing..." : undefined}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPermanentScheduleChange ? "Confirm Schedule Change" : "Confirm Enrolment"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Lesson Edit Modal - use programId/teacherId from review API (details) when available, like startDate */}
      {editingLesson && location && (
        <LessonEditModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          lessonId={editingLesson.id}
          lessonDate={editingLesson.date}
          lessonTime={editingLesson.time}
          lessonDuration={editingLesson.duration}
          location={location}
          programId={details?.programId != null ? String(details.programId) : programId}
          courseId={courseId}
          currentTeacherId={details?.teacherId}
          onLessonUpdated={() => {
            setEditModalOpen(false);
            setEditingLesson(null);
            onLessonUpdated?.();
          }}
          allLessons={lessons
            .filter(l => l.id && (l.conflict || l.isConflict || l.isHolidayConflict))
            .map(l => {
              // Extract time from date (UTC time stored in database)
              const lessonDate = new Date(l.date);
              const hours = lessonDate.getUTCHours();
              const minutes = lessonDate.getUTCMinutes();
              const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
              
              return {
                id: l.id!,
                date: l.date,
                time: timeStr,
                duration: l.duration,
                programId: programId,
              };
            })}
        />
      )}

      {onDeleteLesson && (
        <DeleteConfirmationModal
          open={lessonIdToDelete != null}
          onOpenChange={(open) => !open && setLessonIdToDelete(null)}
          title="Delete lesson"
          description="Are you sure you want to delete this lesson? This action cannot be undone."
          onConfirm={handleDeleteLessonConfirm}
          isDeleting={deletingLessonId != null}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      )}
    </Dialog>
  );
}



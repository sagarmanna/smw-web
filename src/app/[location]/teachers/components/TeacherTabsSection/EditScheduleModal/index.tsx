"use client";

import * as React from "react";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays } from "date-fns";
import { parseTimeVoucherString } from "@/utils/dateUtils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleLessonEvent,
  type TeacherScheduleAvailabilityEvent,
} from "../../../[id]/teachers-details-tabs.api";
import { getTeacherView, getTeachersList } from "@/app/[location]/schedule/schedule.api";
import { 
  updateLesson, 
  formatDateTimeForLegacy,
  validateLesson,
  formatDateForValidation,
  formatDateOnlyForValidation,
  type LessonValidationResponse,
} from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

// Shared interface for lesson data that can be edited
export interface EditableLessonData {
  id: string;
  student: string;
  program: string;
  programId?: number;
  duration: string;
  originalDate?: string;
  expiryDate?: string;
  originalDateTime?: string; // For TimeVoucherData: the full time string like "Wednesday, November 5th, 2025 04:00 PM"
  teacher?: {
    id: number;
    title: string;
  };
  // For TimeVoucherData, we need to extract lesson ID from the id string
  // Format: "time-voucher-{lessonId}-{timestamp}-{index}"
}

interface EditScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  teacherId: number;
  selectedLesson: EditableLessonData | null;
  onSuccess?: () => void;
}

const DAY_RESOURCES = [
  { id: 1, title: "Monday" },
  { id: 2, title: "Tuesday" },
  { id: 3, title: "Wednesday" },
  { id: 4, title: "Thursday" },
  { id: 5, title: "Friday" },
  { id: 6, title: "Saturday" },
  { id: 7, title: "Sunday" },
];

export function EditScheduleModal({
  open,
  onOpenChange,
  location,
  teacherId,
  selectedLesson,
  onSuccess,
}: EditScheduleModalProps) {
  const [scheduleData, setScheduleData] = useState<TeacherScheduleData | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [showAllModal, setShowAllModal] = useState<boolean>(false);
  const [goToDateOpen, setGoToDateOpen] = useState<boolean>(false);
  const [eligibleTeachers, setEligibleTeachers] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState<string>("");
  const [lessonId, setLessonId] = useState<number | null>(null);
  const [resolvedProgramId, setResolvedProgramId] = useState<number | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<LessonValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const getMonday = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const convertLessonsToEvents = useCallback(
    (lessons: TeacherScheduleLessonEvent[], mondayDate: Date): CalendarEvent[] => {
  return lessons.map((lesson) => {
    const originalStart = new Date(lesson.start);
    const originalEnd = new Date(lesson.end);
    
    const startHours = originalStart.getHours();
    const startMinutes = originalStart.getMinutes();
    const startSeconds = originalStart.getSeconds();
    const endHours = originalEnd.getHours();
    const endMinutes = originalEnd.getMinutes();
    const endSeconds = originalEnd.getSeconds();
    
    const eventStart = new Date(mondayDate);
    eventStart.setHours(startHours, startMinutes, startSeconds, 0);
    
    const eventEnd = new Date(mondayDate);
    eventEnd.setHours(endHours, endMinutes, endSeconds, 0);

    return {
      id: `lesson-${lesson.lessonId}`,
      title: lesson.title,
      start: eventStart,
      end: eventEnd,
          resourceId: lesson.resourceId,
      backgroundColor: lesson.backgroundColor,
      borderColor: lesson.backgroundColor,
      className: lesson.className,
      extendedProps: {
        lessonId: lesson.lessonId.toString(),
        url: lesson.url,
      },
    };
  });
    },
    []
  );

  const convertAvailabilityToBackground = useCallback(
    (availability: TeacherScheduleAvailabilityEvent[], mondayDate: Date) => {
      return availability.map((avail) => {
        const originalStart = new Date(avail.start);
        const originalEnd = new Date(avail.end);

        const startHours = originalStart.getHours();
        const startMinutes = originalStart.getMinutes();
        const startSeconds = originalStart.getSeconds();
        const endHours = originalEnd.getHours();
        const endMinutes = originalEnd.getMinutes();
        const endSeconds = originalEnd.getSeconds();

        const availStart = new Date(mondayDate);
        availStart.setHours(startHours, startMinutes, startSeconds, 0);

        const availEnd = new Date(mondayDate);
        availEnd.setHours(endHours, endMinutes, endSeconds, 0);

        return {
          resourceId: avail.resourceId,
          title: "",
          start: availStart.toISOString(),
          end: availEnd.toISOString(),
          rendering: avail.rendering,
          className: avail.className,
          backgroundColor: avail.backgroundColor,
        };
      });
    },
    []
  );

  const fetchSchedule = useCallback(
    async (baseDate: Date, targetTeacherId?: number) => {
      setScheduleLoading(true);
      setScheduleError(null);
      try {
        const year = baseDate.getFullYear();
        const month = String(baseDate.getMonth() + 1).padStart(2, "0");
        const day = String(baseDate.getDate()).padStart(2, "0");
        const dateString = `${year}-${month}-${day}`;

        const teacherIdToUse = targetTeacherId || teacherId;
        const result = await getTeacherScheduleEvents(location, teacherIdToUse, dateString);
        if (result) {
          setScheduleData(result);
      } else {
          setScheduleData(null);
          setScheduleError("No schedule data available");
        }
      } catch (err) {
        console.error("Error fetching schedule events:", err);
        setScheduleError("Failed to load schedule events");
        setScheduleData(null);
      } finally {
        setScheduleLoading(false);
      }
    },
    [location, teacherId]
  );

  const fetchEligibleTeachers = useCallback(
    async (programId?: number, date?: Date) => {
      try {
        if (programId) {
          // Fetch teachers by program if programId is available
          // Always use the passed date parameter, or current date if not provided
          const dateToUse = date || new Date();
          const year = dateToUse.getFullYear();
          const month = String(dateToUse.getMonth() + 1).padStart(2, "0");
          const day = String(dateToUse.getDate()).padStart(2, "0");
          const dateString = `${year}-${month}-${day}`;

          const response = await getTeacherView(location, dateString, false, programId.toString(), undefined, 'all-teachers-by-program');
          const resources = response?.data?.resources || [];
          setEligibleTeachers(resources);
        } else {
          // If no programId, fetch all teachers for the location
          const response = await getTeachersList(location);
          if (response?.success && response.data) {
            // Map Teacher (id, name) to TeacherViewResource format (id, title)
            const teachers = response.data.map((t) => ({
              id: t.id,
              title: t.name,
            }));
            setEligibleTeachers(teachers);
          } else {
            setEligibleTeachers([]);
          }
        }
      } catch (err) {
        console.error("Error fetching eligible teachers:", err);
        setEligibleTeachers([]);
      }
    },
    [location]
  );

  // Parse duration string (HH:mm) into hours and minutes
  const parseDuration = useCallback((durationStr: string) => {
    if (!durationStr) return { hours: 0, minutes: 0 };
    const parts = durationStr.split(":");
    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parseInt(parts[1] || "0", 10);
    return { hours, minutes };
  }, []);

  // Format hours and minutes into HH:mm string
  const formatDuration = useCallback((hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }, []);

  // Extract lesson ID from different ID formats
  const extractLessonId = useCallback((id: string): number | null => {
    // Handle unscheduled lesson format: "unscheduled-lesson-{id}-{timestamp}-{index}"
    const unscheduledMatch = id.match(/unscheduled-lesson-(\d+)-/);
    if (unscheduledMatch) {
      return parseInt(unscheduledMatch[1], 10);
    }
    
    // Handle time voucher format: "time-voucher-{id}-{timestamp}-{index}"
    const timeVoucherMatch = id.match(/time-voucher-(\d+)-/);
    if (timeVoucherMatch) {
      return parseInt(timeVoucherMatch[1], 10);
    }
    
    return null;
  }, []);


  // Initialize when modal opens
  useEffect(() => {
    if (!open || !selectedLesson) {
      // Clear validation errors when modal closes
      if (!open) {
        setValidationErrors(null);
      }
      return;
    }
    
    // Set teacher ID - use lesson's teacher if available, otherwise default to teacherId prop
    setSelectedTeacherId(selectedLesson.teacher?.id || teacherId);
    
    // Extract lesson ID from the id string
    const extractedLessonId = extractLessonId(selectedLesson.id);
    setLessonId(extractedLessonId);
    
    // Reset resolved programId when lesson changes
    setResolvedProgramId(undefined);
    
    // Round duration to nearest 15-minute increment
    if (selectedLesson.duration) {
      const { hours, minutes } = parseDuration(selectedLesson.duration);
      const roundedMinutes = Math.round(minutes / 15) * 15;
      const finalMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
      const finalHours = roundedMinutes >= 60 ? hours + 1 : hours;
      setDuration(formatDuration(finalHours, finalMinutes));
    } else {
      setDuration("00:00");
    }
    
    // Parse originalDateTime if available (from TimeVoucherData)
    let initialRescheduleDate: Date | null = null;
    let initialSelectedDate = new Date();
    
    if (selectedLesson.originalDateTime) {
      const parsedDate = parseTimeVoucherString(selectedLesson.originalDateTime);
      if (parsedDate) {
        initialRescheduleDate = parsedDate;
        initialSelectedDate = parsedDate; // Set calendar to show the week containing this date
      }
    }
    
    setSelectedDate(initialSelectedDate);
    setRescheduleDate(initialRescheduleDate);
    setShowAllModal(false);
    setGoToDateOpen(false);
    setValidationErrors(null); // Clear validation errors when modal opens
    
    // If programId is available, fetch teachers by program immediately
    // Otherwise, we'll fetch it from schedule data after schedule loads
    if (selectedLesson.programId) {
      fetchEligibleTeachers(selectedLesson.programId, initialSelectedDate);
    }
    // If no programId, we'll resolve it from schedule data in fetchSchedule
  }, [open, selectedLesson?.id, selectedLesson?.originalDateTime, teacherId, fetchEligibleTeachers, parseDuration, formatDuration, extractLessonId]);

  // Load schedule data when modal opens or selectedDate/selectedTeacherId changes
  useEffect(() => {
    if (!open) return;
    
    const teacherIdToUse = selectedTeacherId || selectedLesson?.teacher?.id || teacherId;
    fetchSchedule(selectedDate, teacherIdToUse);
  }, [open, selectedDate, selectedTeacherId, selectedLesson?.teacher?.id, teacherId, fetchSchedule]);
  
  // Extract programId from schedule data if lessonId is available but programId is not
  useEffect(() => {
    if (!open || !scheduleData || !lessonId || resolvedProgramId || selectedLesson?.programId) return;
    
    // Try to find the lesson in schedule data to get programId
    const lesson = scheduleData.lessons.find((l) => l.lessonId === lessonId);
    if (lesson && lesson.programId) {
      setResolvedProgramId(lesson.programId);
    }
  }, [open, scheduleData, lessonId, resolvedProgramId, selectedLesson?.programId]);
  
  // Fetch eligible teachers when programId is resolved from schedule data
  useEffect(() => {
    if (!open || !resolvedProgramId || selectedLesson?.programId) return;
    
    // Only fetch if we resolved programId from schedule and didn't have it originally
    fetchEligibleTeachers(resolvedProgramId, selectedDate);
  }, [open, resolvedProgramId, selectedLesson?.programId, selectedDate, fetchEligibleTeachers]);

  const mondayDate = useMemo(() => getMonday(selectedDate), [selectedDate, getMonday]);

  // Validate lesson data
  const validateLessonData = useCallback(async () => {
    if (!lessonId || !selectedTeacherId || !rescheduleDate || !selectedLesson || !duration) {
      setValidationErrors(null);
      return;
    }

    setIsValidating(true);
    try {
      // Parse duration
      const { hours, minutes } = parseDuration(duration);
      const durationFormatted = formatDuration(hours, minutes);
      
      // Extract hour and minute from rescheduleDate
      const rescheduleHour = rescheduleDate.getHours();
      const rescheduleMinute = rescheduleDate.getMinutes();
      
      // Format dates
      const formattedDate = formatDateForValidation(rescheduleDate);
      const formattedExpiryDate = selectedLesson.expiryDate 
        ? formatDateOnlyForValidation(new Date(selectedLesson.expiryDate))
        : formatDateOnlyForValidation(new Date());
      const formattedGoToDate = formatDateOnlyForValidation(mondayDate);

      const validationResult = await validateLesson(location, lessonId.toString(), {
        hour: rescheduleHour.toString().padStart(2, '0'),
        minute: rescheduleMinute.toString().padStart(2, '0'),
        duration: durationFormatted,
        teacherId: selectedTeacherId,
        date: formattedDate,
        expiryDate: formattedExpiryDate,
        goToDate: formattedGoToDate,
      });

      // Check if validation passed (empty object or empty arrays)
      const hasErrors = Object.keys(validationResult).length > 0 && 
        Object.values(validationResult).some((errors) => Array.isArray(errors) && errors.length > 0);
      
      if (hasErrors) {
        setValidationErrors(validationResult);
      } else {
        setValidationErrors(null);
      }
    } catch (error) {
      console.error("Error validating lesson:", error);
      // Don't show error toast for validation, just log it
    } finally {
      setIsValidating(false);
    }
  }, [lessonId, selectedTeacherId, rescheduleDate, selectedLesson, duration, location, mondayDate, parseDuration, formatDuration]);

  // Validate lesson when Duration, Teacher, Reschedule Date, or Expiry Date changes
  useEffect(() => {
    if (!open || !lessonId) return;
    
    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(() => {
      validateLessonData();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [open, lessonId, duration, selectedTeacherId, rescheduleDate, selectedLesson?.expiryDate, validateLessonData]);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    if (!scheduleData) return [];
    const lessons = convertLessonsToEvents(scheduleData.lessons, mondayDate);
    
    // Add preview event for rescheduled lesson if rescheduleDate is set
    if (rescheduleDate && selectedLesson && duration && selectedTeacherId) {
      const { hours, minutes } = parseDuration(duration);
      
      // Extract time components from rescheduleDate
      const startHours = rescheduleDate.getHours();
      const startMinutes = rescheduleDate.getMinutes();
      const startSeconds = rescheduleDate.getSeconds();
      
      // Calculate end time
      const endTime = new Date(rescheduleDate);
      endTime.setHours(endTime.getHours() + hours);
      endTime.setMinutes(endTime.getMinutes() + minutes);
      const endHours = endTime.getHours();
      const endMinutes = endTime.getMinutes();
      const endSeconds = endTime.getSeconds();
      
      // Get the day of week from rescheduleDate (1-7, Monday-Sunday)
      const dayOfWeek = rescheduleDate.getDay();
      const resourceId = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert Sunday from 0 to 7
      
      // Adjust preview dates to use Monday as base date (for calendar display)
      // but keep the time from rescheduleDate
      const previewStartAdjusted = new Date(mondayDate);
      previewStartAdjusted.setHours(startHours, startMinutes, startSeconds, 0);
      
      const previewEndAdjusted = new Date(mondayDate);
      previewEndAdjusted.setHours(endHours, endMinutes, endSeconds, 0);
      
      const previewEvent: CalendarEvent = {
        id: "preview-reschedule",
        title: selectedLesson.student || "Rescheduled Lesson",
        start: previewStartAdjusted,
        end: previewEndAdjusted,
        resourceId,
        backgroundColor: "#3d85c6",
        borderColor: "#3d85c6",
        className: "lesson-rescheduled-preview",
        extendedProps: {
          lessonId: "preview",
        },
      };
      
      return [...lessons, previewEvent];
    }
    
    return lessons;
  }, [scheduleData, convertLessonsToEvents, mondayDate, rescheduleDate, selectedLesson, duration, selectedTeacherId, parseDuration]);

  const calendarAvailability = useMemo(() => {
    if (!scheduleData) return [];
    return convertAvailabilityToBackground(scheduleData.availability || [], mondayDate);
  }, [scheduleData, convertAvailabilityToBackground, mondayDate]);

  const timeRange = useMemo(() => {
    if (scheduleData?.time) {
      return {
        minTime: scheduleData.time.from,
        maxTime: scheduleData.time.to,
      };
    }
    return {
      minTime: "08:00:00",
      maxTime: "23:30:00",
    };
  }, [scheduleData]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle calendar slot selection (drag to create reschedule time)
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
      if (!selectedLesson || !selectedTeacherId) {
        toast.error("Please select a teacher first");
        return;
      }

      // Extract day of week from resourceId (1-7, Monday-Sunday)
      const resourceId = typeof slotInfo.resourceId === "string" 
        ? parseInt(slotInfo.resourceId) 
        : slotInfo.resourceId || 1;
      
      // Extract time from slotInfo.start (time is correct, but date might be Monday for display)
      const selectedHours = slotInfo.start.getHours();
      const selectedMinutes = slotInfo.start.getMinutes();
      const selectedSeconds = slotInfo.start.getSeconds();
      
      // Calculate the actual date for the selected day of week in the visible week
      const selectedDayDate = new Date(mondayDate);
      const daysToAdd = resourceId - 1; // resourceId is 1-7 (Monday-Sunday)
      selectedDayDate.setDate(mondayDate.getDate() + daysToAdd);
      selectedDayDate.setHours(selectedHours, selectedMinutes, selectedSeconds, 0);
      
      // Set reschedule date to the constructed date
      setRescheduleDate(selectedDayDate);
    },
    [selectedLesson, selectedTeacherId, mondayDate]
  );

  // Handle save/reschedule
  const handleSave = useCallback(async () => {
    if (!lessonId || !selectedTeacherId || !rescheduleDate || !selectedLesson) {
      toast.error("Please select a teacher and reschedule date");
      return;
    }

    // Check validation errors before saving
    if (validationErrors && Object.keys(validationErrors).length > 0) {
      const errorMessages = Object.values(validationErrors)
        .flat()
        .filter((msg) => typeof msg === 'string')
        .join(', ');
      toast.error(`Please fix validation errors: ${errorMessages}`);
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse duration (keep as HH:mm format)
      const { hours: durationHours, minutes: durationMinutes } = parseDuration(duration);
      const durationFormatted = formatDuration(durationHours, durationMinutes);
      
      // Extract hour and minute from rescheduleDate
      const rescheduleHour = rescheduleDate.getHours();
      const rescheduleMinute = rescheduleDate.getMinutes();
      
      // Format dates
      const formattedDate = formatDateForValidation(rescheduleDate);
      const formattedExpiryDate = selectedLesson.expiryDate 
        ? formatDateOnlyForValidation(new Date(selectedLesson.expiryDate))
        : undefined;
      const formattedGoToDate = formatDateOnlyForValidation(mondayDate);

      const response = await updateLesson(location, lessonId.toString(), {
        hour: rescheduleHour.toString().padStart(2, '0'),
        minute: rescheduleMinute.toString().padStart(2, '0'),
        duration: durationFormatted,
        teacherId: selectedTeacherId,
        date: formattedDate,
        expiryDate: formattedExpiryDate,
        goToDate: formattedGoToDate,
      });

      if (response.status) {
        toast.success("Lesson rescheduled successfully");
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error(response.message || "Failed to reschedule lesson");
      }
    } catch (error) {
      console.error("Error rescheduling lesson:", error);
      toast.error("Failed to reschedule lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [lessonId, selectedTeacherId, rescheduleDate, selectedLesson, duration, location, validationErrors, mondayDate, parseDuration, formatDuration, formatDateForValidation, formatDateOnlyForValidation, onOpenChange, onSuccess]);

  // Get current hours and minutes from duration
  const { hours: currentHours, minutes: currentMinutes } = useMemo(() => {
    return parseDuration(duration);
  }, [duration, parseDuration]);

  // Handle hour change
  const handleHourChange = useCallback((newHours: number) => {
    const clampedHours = Math.max(0, Math.min(23, newHours));
    setDuration(formatDuration(clampedHours, currentMinutes));
  }, [currentMinutes, formatDuration]);

  // Handle minute change (only allow 00, 15, 30, 45)
  const handleMinuteChange = useCallback((newMinutes: number) => {
    // Round to nearest 15-minute increment
    const roundedMinutes = Math.round(newMinutes / 15) * 15;
    const clampedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
    setDuration(formatDuration(currentHours, clampedMinutes));
  }, [currentHours, formatDuration]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] overflow-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-semibold">Edit schedule</DialogTitle>
          
          {/* Validation Errors Alert */}
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {Object.entries(validationErrors).map(([key, errors]) => (
                    <div key={key}>
                      {Array.isArray(errors) && errors.length > 0 && (
                        <div>
                          {errors.map((error, index) => (
                            <div key={index}>{error}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Duration</div>
              <div className="flex items-center gap-2 border rounded-md h-10 px-3 bg-background">
                {/* Hours */}
                <Select
                  value={currentHours.toString()}
                  onValueChange={(val) => handleHourChange(parseInt(val))}
                >
                  <SelectTrigger className="w-16 h-8 px-2 py-0 border-0 focus:ring-0 text-base font-medium shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent 
                    className="max-h-[200px]"
                    style={{ maxHeight: '200px' }}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i.toString().padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-xl font-semibold text-foreground">:</span>
                {/* Minutes */}
                <Select
                  value={currentMinutes.toString()}
                  onValueChange={(val) => handleMinuteChange(parseInt(val))}
                >
                  <SelectTrigger className="w-16 h-8 px-2 py-0 border-0 focus:ring-0 text-base font-medium shadow-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">00</SelectItem>
                    <SelectItem value="15">15</SelectItem>
                    <SelectItem value="30">30</SelectItem>
                    <SelectItem value="45">45</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Teacher</div>
              <Select
                value={selectedTeacherId ? selectedTeacherId.toString() : undefined}
                onValueChange={(val) => setSelectedTeacherId(Number(val))}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleTeachers.map((t) => (
                    <SelectItem key={t.id} value={t.id.toString()}>
                      {t.title}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Reschedule Date</div>
              <Input
                value={rescheduleDate ? format(rescheduleDate, "MMM dd, yyyy hh:mm a") : ""}
                readOnly
                className="h-10"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-semibold">Expiry Date</div>
              <Input
                value={selectedLesson?.expiryDate ?? ""}
                readOnly
                className="h-10"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all-modal"
                checked={showAllModal}
                onCheckedChange={(checked) => {
                  const val = Boolean(checked);
                  setShowAllModal(val);
                  const teacherIdToUse = selectedTeacherId || selectedLesson?.teacher?.id || teacherId;
                  fetchSchedule(selectedDate, teacherIdToUse);
                }}
              />
              <label htmlFor="show-all-modal" className="text-sm">
                Show All
              </label>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-base font-semibold text-foreground text-center">
                {format(mondayDate, "dd-MMM-yyyy, EEEE")} – {format(addDays(mondayDate, 6), "dd-MMM-yyyy, EEEE")}
              </div>
            </div>
            <div className="flex items-center justify-end">
              <Popover open={goToDateOpen} onOpenChange={setGoToDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    Go to Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    defaultMonth={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setSelectedDate(date);
                        setRescheduleDate(date);
                        setGoToDateOpen(false);
                      }
                    }}
                    captionLayout="dropdown"
                    fromYear={2005}
                    toYear={2125}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </DialogHeader>

        {scheduleLoading ? (
          <div className="py-6 text-center text-muted-foreground">Loading schedule...</div>
        ) : scheduleError ? (
          <div className="py-6 text-center text-red-500">{scheduleError}</div>
        ) : (
          <div className="border rounded-md">
              <ReactBigCalendarWrapper
                events={calendarEvents}
              availability={calendarAvailability}
                resources={DAY_RESOURCES}
              date={mondayDate}
                onNavigate={(newDate) => {
                const monday = getMonday(newDate);
                  setSelectedDate(monday);
                }}
              onSelectSlot={handleSelectSlot}
              viewType="teacher"
                minTime={timeRange.minTime}
                maxTime={timeRange.maxTime}
              editable={false}
              height="60vh"
            />
          </div>
        )}

        <DialogFooter className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting || !selectedTeacherId || !rescheduleDate}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


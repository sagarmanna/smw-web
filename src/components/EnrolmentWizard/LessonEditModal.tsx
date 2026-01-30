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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { getTeachersList, getTeachersByProgram, type TeachersResponse } from "@/app/[location]/schedule/schedule.api";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleAvailabilityEvent,
  type TeacherScheduleLessonEvent,
} from "@/app/[location]/teachers/[id]/teachers-details-tabs.api";
import { updateLesson, updateLessonField, validateLessonUpdate, type UpdateLessonRequest, type UpdateLessonFieldRequest, type UpdateLessonFieldResponse, type ValidateLessonUpdateRequest, type ValidateLessonUpdateResponse } from "@/app/[location]/students/[id]/students-details.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface LessonEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lessonId: number;
  lessonDate: string; // ISO date string
  lessonTime: string; // HH:mm format
  lessonDuration: string; // HH:mm format
  currentTeacherId?: number;
  location: string;
  programId?: string; // Optional program ID to filter teachers
  onLessonUpdated?: () => void; // Callback when lesson is updated
  allLessons?: Array<{ id: number; date: string; time: string; duration: string }>; // All lessons for "Apply All"
}

const DAY_RESOURCES = [
  { id: 1, title: "Monday" }, { id: 2, title: "Tuesday" }, { id: 3, title: "Wednesday" },
  { id: 4, title: "Thursday" }, { id: 5, title: "Friday" }, { id: 6, title: "Saturday" },
  { id: 7, title: "Sunday" },
];
const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const getMondayOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setDate(date.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const convertLessonsToCalendarEvents = (lessons: TeacherScheduleLessonEvent[], mondayDate: Date): CalendarEvent[] => {
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
    
    const resourceId = lesson.resourceId;
    const isOnline = typeof lesson.isOnline === 'number' ? lesson.isOnline === 1 : lesson.isOnline;
    
    return {
      id: `lesson-${lesson.lessonId}`,
      title: lesson.title,
      start: eventStart,
      end: eventEnd,
      resourceId,
      backgroundColor: lesson.backgroundColor,
      borderColor: lesson.backgroundColor,
      className: lesson.className,
      extendedProps: {
        lessonId: lesson.lessonId.toString(),
        isOwing: lesson.isOwing ?? undefined,
        isOwingRentalAgreement: lesson.isOwingRentalAgreement ?? undefined,
        isOnline: isOnline,
        programId: lesson.programId?.toString() || undefined,
        url: lesson.url,
        tooltip: lesson.title,
      },
    };
  });
};

const convertAvailabilityEvents = (availability: TeacherScheduleAvailabilityEvent[], mondayDate: Date) => {
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
    };
  });
};

interface DatePickerProps {
  label: string;
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const DatePickerField: React.FC<DatePickerProps> = ({ label, date, onDateSelect, isOpen, onOpenChange }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Popover open={isOpen} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM dd, yyyy") : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 border-b">
          <Button variant="outline" size="sm" onClick={() => onDateSelect(new Date())} className="w-full h-8 text-xs">Today</Button>
        </div>
        <Calendar mode="single" selected={date} onSelect={onDateSelect} defaultMonth={date || new Date()} captionLayout="dropdown" fromYear={2005} toYear={2125} />
      </PopoverContent>
    </Popover>
  </div>
);

export function LessonEditModal({
  open,
  onOpenChange,
  lessonId,
  lessonDate,
  lessonTime,
  lessonDuration,
  currentTeacherId,
  location,
  programId,
  onLessonUpdated,
  allLessons = [],
}: LessonEditModalProps) {
  const [teachers, setTeachers] = React.useState<Array<{ id: number; name: string }>>([]);
  const [loadingTeachers, setLoadingTeachers] = React.useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>(() => {
    // Set initial teacher ID from prop if available
    return currentTeacherId?.toString() || "";
  });
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() => {
    const date = new Date(lessonDate);
    return isNaN(date.getTime()) ? new Date() : date;
  });
  const [day, setDay] = React.useState<string>("");
  const [startTime, setStartTime] = React.useState<string>(lessonTime || "");
  const [goToDate, setGoToDate] = React.useState<Date | undefined>(() => {
    const date = new Date(lessonDate);
    return isNaN(date.getTime()) ? new Date() : date;
  });
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [duration, setDuration] = React.useState<string>(lessonDuration || "00:30");
  const [calendarDate, setCalendarDate] = React.useState<Date>(() => {
    const date = new Date(lessonDate);
    return isNaN(date.getTime()) ? new Date() : getMondayOfWeek(new Date());
  });
  const [scheduleData, setScheduleData] = React.useState<TeacherScheduleData | null>(null);
  const [loadingCalendar, setLoadingCalendar] = React.useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = React.useState(false);
  const [goToDatePickerOpen, setGoToDatePickerOpen] = React.useState(false);
  const [isApplyingSingle, setIsApplyingSingle] = React.useState(false); // Loading state for Apply button
  const [isApplyingAll, setIsApplyingAll] = React.useState(false); // Loading state for Apply All button
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const isExpanded = !!selectedTeacherId;

  // Update form data when lesson data changes
  React.useEffect(() => {
    if (open) {
      const date = new Date(lessonDate);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        setGoToDate(date);
        setCalendarDate(getMondayOfWeek(date));
      }
      if (lessonTime) setStartTime(lessonTime);
      if (lessonDuration) setDuration(lessonDuration);
      if (currentTeacherId) {
        setSelectedTeacherId(currentTeacherId.toString());
      }
    }
  }, [open, lessonDate, lessonTime, lessonDuration, currentTeacherId]);

  React.useEffect(() => {
    if (!open) return;
    setLoadingTeachers(true);
    const parsedProgramId = programId && typeof programId === 'string' && programId.trim() ? parseInt(programId, 10) : null;
    const isValidProgramId = parsedProgramId !== null && !isNaN(parsedProgramId) && parsedProgramId > 0;
    
    const fetchTeachers = isValidProgramId
      ? getTeachersByProgram(location, parsedProgramId)
      : getTeachersList(location);
    
    fetchTeachers
      .then((response: TeachersResponse | null) => {
        if (response?.success && response.data) {
          const teachersList = response.data.map((t) => ({ id: t.id, name: t.name || "" }));
          setTeachers(teachersList);
          
          // Set teacher selection after teachers are loaded
          if (currentTeacherId && !selectedTeacherId) {
            const teacherExists = teachersList.some(t => t.id === currentTeacherId);
            if (teacherExists) {
              setSelectedTeacherId(currentTeacherId.toString());
            }
          }
        }
      })
      .catch((err: unknown) => console.error("Error fetching teachers:", err))
      .finally(() => setLoadingTeachers(false));
  }, [open, location, programId, currentTeacherId, selectedTeacherId]);

  React.useEffect(() => {
    if (!selectedTeacherId || !open) {
      setScheduleData(null);
      return;
    }
    setLoadingCalendar(true);
    const monday = getMondayOfWeek(calendarDate);
    getTeacherScheduleEvents(location, parseInt(selectedTeacherId), formatDateString(monday), showAll)
      .then((response: TeacherScheduleData | null) => {
        if (response) {
          setScheduleData(response);
          if (response.date?.from) {
            const apiWeekStart = new Date(response.date.from + 'T00:00:00');
            apiWeekStart.setHours(0, 0, 0, 0);
            if (Math.abs(apiWeekStart.getTime() - monday.getTime()) > 12 * 60 * 60 * 1000) {
              setCalendarDate(apiWeekStart);
            }
          }
        } else {
          setScheduleData(null);
        }
      })
      .catch((err: unknown) => {
        console.error("Error fetching schedule:", err);
        setScheduleData(null);
      })
      .finally(() => setLoadingCalendar(false));
  }, [selectedTeacherId, calendarDate, location, open, showAll]);

  const teacherOptions = React.useMemo(() => teachers.map((t) => ({ value: t.id.toString(), label: t.name })), [teachers]);
  const selectedTeacherName = React.useMemo(() => teachers.find((t) => t.id.toString() === selectedTeacherId)?.name || "", [teachers, selectedTeacherId]);
  const calendarMonday = React.useMemo(() => getMondayOfWeek(calendarDate), [calendarDate]);
  const calendarEvents = React.useMemo(() => {
    if (!scheduleData) return [];
    const events = convertLessonsToCalendarEvents(scheduleData.lessons, calendarMonday);
    
    if (day && startTime && selectedTeacherId && duration) {
      const [hoursStr, minutesStr] = startTime.split(':');
      const selectedHours = parseInt(hoursStr || '0', 10);
      const selectedMinutes = parseInt(minutesStr || '0', 10);
      
      const dayIndex = DAY_NAMES.indexOf(day);
      const resourceId = dayIndex >= 1 && dayIndex <= 7 ? dayIndex : null;
      
      if (resourceId) {
        const [durationHoursStr, durationMinutesStr] = duration.split(':');
        const durationHours = parseInt(durationHoursStr || '0', 10);
        const durationMinutes = parseInt(durationMinutesStr || '0', 10);
        
        const startTimeMinutes = selectedHours * 60 + selectedMinutes;
        const totalDurationMinutes = durationHours * 60 + durationMinutes;
        const endTimeMinutes = startTimeMinutes + totalDurationMinutes;
        
        const endHours = Math.floor(endTimeMinutes / 60);
        const endMinutes = endTimeMinutes % 60;
        
        const previewStartAdjusted = new Date(calendarMonday);
        previewStartAdjusted.setHours(selectedHours, selectedMinutes, 0, 0);
        
        const previewEndAdjusted = new Date(calendarMonday);
        previewEndAdjusted.setHours(endHours, endMinutes, 0, 0);
        
        const formatTime = (hours: number, minutes: number) => {
          const h = hours % 12 || 12;
          const m = minutes.toString().padStart(2, '0');
          const ampm = hours >= 12 ? 'PM' : 'AM';
          return `${h}:${m} ${ampm}`;
        };
        
        const startTimeFormatted = formatTime(selectedHours, selectedMinutes);
        const endTimeFormatted = formatTime(endHours, endMinutes);
        
        const previewEvent: CalendarEvent = {
          id: "preview-selected-slot",
          title: `Selected: ${startTimeFormatted} - ${endTimeFormatted}`,
          start: previewStartAdjusted,
          end: previewEndAdjusted,
          resourceId,
          backgroundColor: "#3d85c6",
          borderColor: "#3d85c6",
          className: "enrolment-slot-preview",
          extendedProps: {
            lessonId: "preview",
            tooltip: `Selected slot: ${day} at ${startTimeFormatted} - ${endTimeFormatted} (Duration: ${duration})`,
          },
        };
        
        return [...events, previewEvent];
      }
    }
    
    return events;
  }, [scheduleData, calendarMonday, day, startTime, selectedTeacherId, duration]);
  const timeRange = React.useMemo(() => scheduleData ? { minTime: scheduleData.time.from, maxTime: scheduleData.time.to } : { minTime: "04:00:00", maxTime: "20:00:00" }, [scheduleData]);
  const dateRange = React.useMemo(() => {
    if (scheduleData?.date) {
      const start = new Date(scheduleData.date.from);
      const end = new Date(scheduleData.date.to);
      return `${format(start, "dd-MMM-yyyy, EEEE")} – ${format(end, "dd-MMM-yyyy, EEEE")}`;
    }
    const monday = startOfWeek(calendarDate, { weekStartsOn: 1 });
    const sunday = endOfWeek(calendarDate, { weekStartsOn: 1 });
    return `${format(monday, "dd-MMM-yyyy, EEEE")} – ${format(sunday, "dd-MMM-yyyy, EEEE")}`;
  }, [scheduleData, calendarDate]);
  const availabilityEvents = React.useMemo(() => scheduleData?.availability ? convertAvailabilityEvents(scheduleData.availability, calendarMonday) : [], [scheduleData, calendarMonday]);

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
    setCalendarDate(getMondayOfWeek(selectedDate || new Date()));
  };

  const handleDateSelect = (date: Date | undefined, setter: (date: Date | undefined) => void, closePicker: () => void) => {
    if (date) {
      setter(date);
      setCalendarDate(getMondayOfWeek(date));
      closePicker();
    }
  };

  const handleSelectSlot = React.useCallback(async (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
    if (!slotInfo.start || !slotInfo.resourceId || !selectedTeacherId || !lessonId) return;
    
    const resourceId = typeof slotInfo.resourceId === 'string' 
      ? parseInt(slotInfo.resourceId) 
      : slotInfo.resourceId || 1;
    
    if (resourceId >= 1 && resourceId <= 7) {
      setDay(DAY_NAMES[resourceId]);
    }
    
    const selectedHours = slotInfo.start.getHours();
    const selectedMinutes = slotInfo.start.getMinutes();
    const selectedSeconds = slotInfo.start.getSeconds();
    
    const selectedDayDate = new Date(calendarMonday);
    const daysToAdd = resourceId - 1;
    selectedDayDate.setDate(calendarMonday.getDate() + daysToAdd);
    selectedDayDate.setHours(selectedHours, selectedMinutes, selectedSeconds, 0);
    
    // Update both selectedDate and goToDate when user selects a slot in the calendar
    // This ensures the date is correctly used when building the update request
    setSelectedDate(selectedDayDate);
    setGoToDate(selectedDayDate);
    
    const hours = String(selectedHours).padStart(2, '0');
    const minutes = String(selectedMinutes).padStart(2, '0');
    setStartTime(`${hours}:${minutes}`);
    
    // Validate the selected slot
    setValidationError(null); // Clear previous errors
    
    try {
      const teacherId = parseInt(selectedTeacherId, 10);
      if (!teacherId || !duration) return;
      
      // Build date string in UTC format (YYYY-MM-DDTHH:mm:ss.sssZ)
      const validationDate = new Date(selectedDayDate);
      validationDate.setUTCHours(selectedHours, selectedMinutes, selectedSeconds, 0);
      
      // Format duration as HH:mm:ss
      const durationParts = duration.split(':');
      const durationFormatted = durationParts.length === 2 
        ? `${durationParts[0]}:${durationParts[1]}:00`
        : duration;
      
      const validationRequest: ValidateLessonUpdateRequest = {
        id: lessonId,
        teacherId,
        date: validationDate.toISOString(),
        duration: durationFormatted,
      };
      
      const validationResult = await validateLessonUpdate(location, lessonId, validationRequest);
      
      if (validationResult && !validationResult.success) {
        // Show validation errors as alert above calendar
        const errors = validationResult.data || {};
        const errorMessages: string[] = [];
        
        Object.keys(errors).forEach((key) => {
          const fieldErrors = errors[key];
          if (Array.isArray(fieldErrors)) {
            errorMessages.push(...fieldErrors);
          }
        });
        
        if (errorMessages.length > 0) {
          setValidationError(errorMessages.join(', '));
        } else {
          setValidationError(validationResult.message || 'Validation failed');
        }
      } else {
        setValidationError(null); // Clear error on successful validation
      }
    } catch (error) {
      console.error('Error validating lesson update:', error);
      setValidationError('Error validating lesson. Please try again.');
    }
  }, [calendarMonday, selectedTeacherId, lessonId, location, duration]);

  const buildUpdateRequest = (targetDate: Date, targetTime: string, targetTeacherId?: number): UpdateLessonRequest => {
    // Combine date and time into ISO string using UTC to match database storage
    const [hours, minutes] = targetTime.split(':');
    const combinedDate = new Date(targetDate);
    combinedDate.setUTCHours(parseInt(hours || '0', 10), parseInt(minutes || '0', 10), 0, 0);
    
    const request: UpdateLessonRequest = {
      date: combinedDate.toISOString(),
    };
    
    if (targetTeacherId) {
      request.teacherId = targetTeacherId;
    }
    
    if (duration) {
      request.duration = `${duration}:00`; // Convert HH:mm to HH:mm:ss
    }
    
    return request;
  };

  const buildUpdateFieldRequest = (targetDate: Date, targetTime: string, targetTeacherId?: number, applyContext?: string): UpdateLessonFieldRequest => {
    // Extract hour and minute from time string
    const [hours, minutes] = targetTime.split(':');
    const hour = parseInt(hours || '0', 10);
    const minute = parseInt(minutes || '0', 10);
    
    // Format goToDate as "MMM dd, yyyy" - API will use this + hour + minute to build the date
    // This is more reliable than parsing the date string with time
    const goToDateStr = format(targetDate, "MMM dd, yyyy");
    
    const request: UpdateLessonFieldRequest = {
      id: lessonId,
      // Don't provide date field - let API build it from goToDate + hour + minute
      // This ensures the date is correctly updated when user changes the calendar date
      hour: String(hour).padStart(2, '0'),
      minute: String(minute).padStart(2, '0'),
      goToDate: goToDateStr, // API uses this to build the new date
    };
    
    if (targetTeacherId) {
      request.teacherId = targetTeacherId;
    }
    
    if (duration) {
      // Convert HH:mm to HH:mm:ss format (ensure we don't add extra :00)
      const durationParts = duration.split(':');
      if (durationParts.length === 2) {
        // Format: HH:mm -> convert to HH:mm:ss
        request.duration = `${durationParts[0]}:${durationParts[1]}:00`;
      } else if (durationParts.length === 3) {
        // Already in HH:mm:ss format
        request.duration = duration;
      } else {
        // Fallback: assume it's already correct
        request.duration = duration;
      }
    }
    
    // Always include applyContext (legacy: '1' = apply single, '2' = apply all)
    // If not provided, default to '1' for apply single
    request.applyContext = applyContext || '1';
    
    return request;
  };

  const handleApply = async () => {
    if (!selectedDate || !startTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (validationError) {
      toast.error("Please resolve validation errors before applying");
      return;
    }

    setIsApplyingSingle(true);
    try {
      const teacherId = selectedTeacherId ? parseInt(selectedTeacherId, 10) : undefined;
      // applyContext='1' for apply single (legacy: '1' = apply single, '2' = apply all)
      const updateRequest = buildUpdateFieldRequest(selectedDate, startTime, teacherId, '1');
      
      const result = await updateLessonField(location, lessonId, updateRequest);
      
      if (result?.success) {
        toast.success("Lesson updated successfully");
        onLessonUpdated?.();
        onOpenChange(false);
      } else {
        toast.error(result?.message || "Failed to update lesson");
      }
    } catch (error: unknown) {
      console.error("Error updating lesson:", error);
      toast.error("Failed to update lesson");
    } finally {
      setIsApplyingSingle(false);
    }
  };

  const handleApplyAll = async () => {
    if (!selectedDate || !startTime) {
      toast.error("Please select a date and time");
      return;
    }

    if (validationError) {
      toast.error("Please resolve validation errors before applying");
      return;
    }

    setIsApplyingAll(true);
    try {
      const teacherId = selectedTeacherId ? parseInt(selectedTeacherId, 10) : undefined;
      
      // Use the new update-field endpoint with applyContext='2' for Apply All (legacy: '2' = apply all, '1' = apply single)
      const updateRequest = buildUpdateFieldRequest(selectedDate, startTime, teacherId, '2');
      
      const result = await updateLessonField(location, lessonId, updateRequest);
      
      if (result?.success) {
        const responseData = result.data as UpdateLessonFieldResponse['data'];
        const updatedCount = responseData?.updatedCount ?? 0;
        const totalCount = responseData?.totalCount ?? 0;
        if (totalCount > 0) {
          if (updatedCount === totalCount) {
            toast.success(`All ${totalCount} lessons updated successfully`);
          } else {
            toast.warning(`${updatedCount} of ${totalCount} lessons updated successfully`);
          }
        } else {
          toast.success("Lessons updated successfully");
        }
        onLessonUpdated?.();
        onOpenChange(false);
      } else {
        toast.error(result?.message || "Failed to update lessons");
      }
    } catch (error: unknown) {
      console.error("Error updating lessons:", error);
      toast.error("Failed to update some lessons");
    } finally {
      setIsApplyingAll(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-4xl", isExpanded && "max-w-7xl max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle className="text-center">Edit Lesson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher</Label>
              <SearchableSelect
                id="teacher"
                options={teacherOptions}
                value={selectedTeacherId}
                onValueChange={handleTeacherChange}
                placeholder="Teacher"
                searchPlaceholder="Search teachers..."
                emptyText="No teachers available"
                loadingText="Loading teachers..."
                noResultsText="No teachers found"
                className="w-full"
                disabled={loadingTeachers}
                isLoading={loadingTeachers}
              />
            </div>
            <DatePickerField label="Date" date={selectedDate} onDateSelect={(date) => handleDateSelect(date, setSelectedDate, () => setStartDatePickerOpen(false))} isOpen={startDatePickerOpen} onOpenChange={setStartDatePickerOpen} />
            <div className="space-y-2">
              <Label htmlFor="day">Day</Label>
              <Input id="day" type="text" value={day} onChange={(e) => setDay(e.target.value)} className="w-full" placeholder="Day" disabled={!isExpanded} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start-time">Start Time</Label>
              <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full" disabled={!isExpanded} />
            </div>
            {isExpanded && <DatePickerField label="Go to Date" date={goToDate} onDateSelect={(date) => handleDateSelect(date, setGoToDate, () => setGoToDatePickerOpen(false))} isOpen={goToDatePickerOpen} onOpenChange={setGoToDatePickerOpen} />}
          </div>
          {isExpanded && (
            <>
              <div className="flex items-center gap-2">
                <Checkbox id="show-all" checked={showAll} onCheckedChange={(checked) => setShowAll(checked === true)} />
                <Label htmlFor="show-all" className="text-sm font-normal cursor-pointer">Show All</Label>
              </div>
              <div className="text-center py-2">
                <p className="text-lg font-semibold">{dateRange}</p>
              </div>
              {validationError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-red-800">{validationError}</p>
                    </div>
                    <div className="ml-auto pl-3">
                      <button
                        type="button"
                        onClick={() => setValidationError(null)}
                        className="inline-flex text-red-400 hover:text-red-600"
                      >
                        <span className="sr-only">Dismiss</span>
                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="border rounded-lg overflow-hidden">
                {loadingCalendar ? (
                  <div className="flex items-center justify-center h-[60vh]">
                    <p className="text-muted-foreground">Loading schedule...</p>
                  </div>
                ) : (
                  <ReactBigCalendarWrapper
                    events={calendarEvents}
                    resources={DAY_RESOURCES}
                    date={calendarMonday}
                    onNavigate={(newDate) => setCalendarDate(getMondayOfWeek(newDate))}
                    onSelectSlot={handleSelectSlot}
                    editable={false}
                    showAll={showAll}
                    viewType="teacher"
                    minTime={timeRange.minTime}
                    maxTime={timeRange.maxTime}
                    availability={availabilityEvents}
                    height="60vh"
                  />
                )}
              </div>
            </>
          )}
        </div>
        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleApply}
              disabled={isApplyingSingle || isApplyingAll || !selectedDate || !startTime || !!validationError}
            >
              {isApplyingSingle && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={handleApplyAll}
              disabled={isApplyingSingle || isApplyingAll || !selectedDate || !startTime || !!validationError}
            >
              {isApplyingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Apply All
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


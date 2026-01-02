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
import { Loader2 } from "lucide-react";
import { getTeachersList, getTeachersByProgram, type TeachersResponse } from "@/app/[location]/schedule/schedule.api";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleAvailabilityEvent,
  type TeacherScheduleLessonEvent,
} from "@/app/[location]/teachers/[id]/teachers-details-tabs.api";

interface NewEnrolmentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onPreviewLessons?: (data: EnrolmentDetailFormData) => void;
  initialData?: EnrolmentDetailFormData;
  location: string;
  nextButtonText?: string; // Custom button text, defaults to "Preview Lessons"
  programId?: string; // Optional program ID to filter teachers
  isLoading?: boolean; // Loading state for Preview Lessons button
}

export interface EnrolmentDetailFormData {
  teacherId?: string;
  teacherName?: string;
  startDate?: string;
  day?: string;
  startTime?: string;
  goToDate?: string;
  showAll?: boolean;
  duration?: string; // Duration in HH:mm format
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
    
    // Always use Monday date, but keep the time
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
    
    // Always use Monday date, but keep the time
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

export function NewEnrolmentDetailModal({
  open,
  onOpenChange,
  onBack,
  onPreviewLessons,
  initialData,
  location,
  nextButtonText = "Preview Lessons", // Default to "Preview Lessons" for students context
  programId,
  isLoading = false,
}: NewEnrolmentDetailModalProps) {
  const [teachers, setTeachers] = React.useState<Array<{ id: number; name: string }>>([]);
  const [loadingTeachers, setLoadingTeachers] = React.useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>(initialData?.teacherId || "");
  const [startDate, setStartDate] = React.useState<Date | undefined>(initialData?.startDate ? new Date(initialData.startDate) : new Date());
  const [day, setDay] = React.useState<string>(initialData?.day || "");
  const [startTime, setStartTime] = React.useState<string>(initialData?.startTime || "");
  const [goToDate, setGoToDate] = React.useState<Date | undefined>(initialData?.goToDate ? new Date(initialData.goToDate) : new Date());
  const [showAll, setShowAll] = React.useState<boolean>(initialData?.showAll || false);
  const [duration, setDuration] = React.useState<string>(initialData?.duration || "00:30");
  const [calendarDate, setCalendarDate] = React.useState<Date>(new Date());
  const [scheduleData, setScheduleData] = React.useState<TeacherScheduleData | null>(null);
  const [loadingCalendar, setLoadingCalendar] = React.useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = React.useState(false);
  const [goToDatePickerOpen, setGoToDatePickerOpen] = React.useState(false);
  const isExpanded = !!selectedTeacherId;

  // Update form data when initialData changes or modal opens
  React.useEffect(() => {
    if (open && initialData) {
      if (initialData.startDate) {
        const parsedDate = new Date(initialData.startDate);
        if (!isNaN(parsedDate.getTime())) {
          setStartDate(parsedDate);
          setCalendarDate(getMondayOfWeek(parsedDate));
        }
      }
      if (initialData.teacherId) setSelectedTeacherId(initialData.teacherId);
      if (initialData.day) setDay(initialData.day);
      if (initialData.startTime) setStartTime(initialData.startTime);
      if (initialData.goToDate) {
        const parsedGoToDate = new Date(initialData.goToDate);
        if (!isNaN(parsedGoToDate.getTime())) setGoToDate(parsedGoToDate);
      }
      if (initialData.showAll !== undefined) setShowAll(initialData.showAll);
      if (initialData.duration) setDuration(initialData.duration);
    } else if (!open) {
      setSelectedTeacherId("");
      setStartDate(new Date());
      setDay("");
      setStartTime("");
      setGoToDate(new Date());
      setShowAll(false);
      setDuration("00:30");
      setScheduleData(null);
      return;
    }
  }, [open, initialData]);

  React.useEffect(() => {
    if (!open) return;
    setLoadingTeachers(true);
    // Use getTeachersByProgram if programId is provided and valid, otherwise use getTeachersList
    const parsedProgramId = programId && typeof programId === 'string' && programId.trim() ? parseInt(programId, 10) : null;
    const isValidProgramId = parsedProgramId !== null && !isNaN(parsedProgramId) && parsedProgramId > 0;
    
    const fetchTeachers = isValidProgramId
      ? getTeachersByProgram(location, parsedProgramId)
      : getTeachersList(location);
    
    fetchTeachers
      .then((response: TeachersResponse | null) => {
        if (response?.success && response.data) {
          setTeachers(response.data.map((t) => ({ id: t.id, name: t.name || "" })));
        }
      })
      .catch((err: unknown) => console.error("Error fetching teachers:", err))
      .finally(() => setLoadingTeachers(false));
  }, [open, location, programId]);

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
          console.log('[NewEnrolmentDetailModal] Schedule data received:', response);
          console.log('[NewEnrolmentDetailModal] Lessons count:', response.lessons?.length || 0);
          console.log('[NewEnrolmentDetailModal] Availability count:', response.availability?.length || 0);
          setScheduleData(response);
          if (response.date?.from) {
            const apiWeekStart = new Date(response.date.from + 'T00:00:00');
            apiWeekStart.setHours(0, 0, 0, 0);
            if (Math.abs(apiWeekStart.getTime() - monday.getTime()) > 12 * 60 * 60 * 1000) {
              setCalendarDate(apiWeekStart);
            }
          }
        } else {
          console.log('[NewEnrolmentDetailModal] No schedule data received');
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
    
    // Add preview event for selected slot if day and startTime are set
    if (day && startTime && selectedTeacherId && duration) {
      // Parse startTime (HH:mm format)
      const [hoursStr, minutesStr] = startTime.split(':');
      const selectedHours = parseInt(hoursStr || '0', 10);
      const selectedMinutes = parseInt(minutesStr || '0', 10);
      
      // Find resourceId from day name (DAY_NAMES has empty string at index 0, so index matches resourceId)
      const dayIndex = DAY_NAMES.indexOf(day);
      const resourceId = dayIndex >= 1 && dayIndex <= 7 ? dayIndex : null;
      
      if (resourceId) {
        // Parse duration (HH:mm format)
        const [durationHoursStr, durationMinutesStr] = duration.split(':');
        const durationHours = parseInt(durationHoursStr || '0', 10);
        const durationMinutes = parseInt(durationMinutesStr || '0', 10);
        
        // Calculate end time by adding duration to start time
        const startTimeMinutes = selectedHours * 60 + selectedMinutes;
        const totalDurationMinutes = durationHours * 60 + durationMinutes;
        const endTimeMinutes = startTimeMinutes + totalDurationMinutes;
        
        const endHours = Math.floor(endTimeMinutes / 60);
        const endMinutes = endTimeMinutes % 60;
        
        // Adjust preview dates to use Monday as base date (for calendar display)
        // but keep the time from selected slot
        const previewStartAdjusted = new Date(calendarMonday);
        previewStartAdjusted.setHours(selectedHours, selectedMinutes, 0, 0);
        
        const previewEndAdjusted = new Date(calendarMonday);
        previewEndAdjusted.setHours(endHours, endMinutes, 0, 0);
        
        // Format time for display (12-hour format with AM/PM)
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
          backgroundColor: "#3d85c6", // Blue color matching EditScheduleModal
          borderColor: "#3d85c6", // Same blue for border
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
    setCalendarDate(getMondayOfWeek(startDate || new Date()));
  };

  const handleDateSelect = (date: Date | undefined, setter: (date: Date | undefined) => void, closePicker: () => void) => {
    if (date) {
      setter(date);
      setCalendarDate(getMondayOfWeek(date));
      closePicker();
    }
  };

  const handleSelectSlot = React.useCallback((slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
    if (!slotInfo.start || !slotInfo.resourceId) return;
    
    // Extract day of week from resourceId (1-7, Monday-Sunday)
    const resourceId = typeof slotInfo.resourceId === 'string' 
      ? parseInt(slotInfo.resourceId) 
      : slotInfo.resourceId || 1;
    
    // Validate resourceId is in valid range (1-7)
    if (resourceId >= 1 && resourceId <= 7) {
      setDay(DAY_NAMES[resourceId]);
    }
    
    // Extract time components from slotInfo.start
    // The time is correct, but date might be Monday for display purposes
    const selectedHours = slotInfo.start.getHours();
    const selectedMinutes = slotInfo.start.getMinutes();
    const selectedSeconds = slotInfo.start.getSeconds();
    
    // Calculate the actual date for the selected day of week in the visible week
    // Use calendarMonday which is already calculated from calendarDate
    const selectedDayDate = new Date(calendarMonday);
    const daysToAdd = resourceId - 1; // resourceId is 1-7 (Monday-Sunday)
    selectedDayDate.setDate(calendarMonday.getDate() + daysToAdd);
    selectedDayDate.setHours(selectedHours, selectedMinutes, selectedSeconds, 0);
    
    // Update startDate and goToDate to the selected day's date
    setStartDate(selectedDayDate);
    setGoToDate(selectedDayDate);
    
    // Format time as HH:mm for the startTime input field
    const hours = String(selectedHours).padStart(2, '0');
    const minutes = String(selectedMinutes).padStart(2, '0');
    setStartTime(`${hours}:${minutes}`);
  }, [calendarMonday]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("max-w-4xl", isExpanded && "max-w-7xl max-h-[90vh] overflow-y-auto")}>
        <DialogHeader>
          <DialogTitle className="text-center">New Enrolment Detail</DialogTitle>
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
            <DatePickerField label="Start Date" date={startDate} onDateSelect={(date) => handleDateSelect(date, setStartDate, () => setStartDatePickerOpen(false))} isOpen={startDatePickerOpen} onOpenChange={setStartDatePickerOpen} />
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
          <Button onClick={onBack}>Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            {isExpanded && (
              <Button
                onClick={() => {
                  // Close modal immediately to prevent unnecessary schedule API calls
                  onOpenChange(false);
                  // Then call onPreviewLessons with the form data
                  onPreviewLessons?.({
                    teacherId: selectedTeacherId,
                    teacherName: selectedTeacherName,
                    startDate: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
                    day,
                    startTime,
                    goToDate: goToDate ? format(goToDate, "yyyy-MM-dd") : undefined,
                    showAll,
                    duration,
                  });
                }}
                disabled={isLoading || !day || !startTime}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {nextButtonText}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



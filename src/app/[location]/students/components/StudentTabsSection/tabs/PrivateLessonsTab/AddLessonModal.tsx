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
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { cn } from "@/lib/utils";
import { getTeachersList, type TeachersResponse } from "@/app/[location]/schedule/schedule.api";
import { getProgramsList } from "@/app/[location]/teachers/teachers.api";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleAvailabilityEvent,
  type TeacherScheduleLessonEvent,
} from "@/app/[location]/teachers/[id]/teachers-details-tabs.api";
import { type PrivateLessonData } from "../../../../[id]/studentTabConfigs";

interface AddLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  studentId: string;
  privateLessonData?: PrivateLessonData[];
  onSave?: (data: LessonFormData) => void;
}

export interface LessonFormData {
  programId?: string;
  programName?: string;
  teacherId?: string;
  teacherName?: string;
  duration?: string;
  date?: string;
  isOnline?: boolean;
  showAll?: boolean;
  goToDate?: string;
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

// Helper to extract time components from a date
const extractTimeComponents = (date: Date) => ({
  hours: date.getHours(),
  minutes: date.getMinutes(),
  seconds: date.getSeconds(),
});

// Helper to create a date with time from a base date
const createDateWithTime = (baseDate: Date, sourceDate: Date): Date => {
  const { hours, minutes, seconds } = extractTimeComponents(sourceDate);
  const newDate = new Date(baseDate);
  newDate.setHours(hours, minutes, seconds, 0);
  return newDate;
};

// Helper to parse resourceId
const parseResourceId = (resourceId: number | string | undefined): number => {
  if (typeof resourceId === "string") return parseInt(resourceId, 10);
  return resourceId || 1;
};

const convertLessonsToCalendarEvents = (lessons: TeacherScheduleLessonEvent[], mondayDate: Date): CalendarEvent[] => {
  return lessons.map((lesson) => {
    const originalStart = new Date(lesson.start);
    const originalEnd = new Date(lesson.end);
    const eventStart = createDateWithTime(mondayDate, originalStart);
    const eventEnd = createDateWithTime(mondayDate, originalEnd);
    const isOnline = typeof lesson.isOnline === 'number' ? lesson.isOnline === 1 : lesson.isOnline;
    
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
    const availStart = createDateWithTime(mondayDate, originalStart);
    const availEnd = createDateWithTime(mondayDate, originalEnd);
    
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
  disabled?: boolean;
}

const DatePickerField: React.FC<DatePickerProps> = ({ label, date, onDateSelect, isOpen, onOpenChange, disabled = false }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <Popover open={isOpen && !disabled} onOpenChange={(open) => !disabled && onOpenChange(open)}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground", disabled && "cursor-not-allowed opacity-50")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM dd, yyyy hh:mm a") : "Pick a date"}
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

export function AddLessonModal({
  open,
  onOpenChange,
  location,
  studentId,
  privateLessonData = [],
  onSave,
}: AddLessonModalProps) {
  // Props are kept for future use
  void studentId;

  const [programs, setPrograms] = React.useState<Array<{ id: number; name: string }>>([]);
  const [teachers, setTeachers] = React.useState<Array<{ id: number; name: string }>>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [loadingTeachers, setLoadingTeachers] = React.useState(false);
  
  const [selectedProgramId, setSelectedProgramId] = React.useState<string>("");
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");
  const [duration, setDuration] = React.useState<string>("00:30");
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [isOnline, setIsOnline] = React.useState<boolean>(false);
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [goToDate, setGoToDate] = React.useState<Date | undefined>(new Date());
  
  const [calendarDate, setCalendarDate] = React.useState<Date>(new Date());
  const [scheduleData, setScheduleData] = React.useState<TeacherScheduleData | null>(null);
  const [loadingCalendar, setLoadingCalendar] = React.useState(false);
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [goToDatePickerOpen, setGoToDatePickerOpen] = React.useState(false);

  // Parse duration string (HH:mm) into hours and minutes
  const parseDuration = React.useCallback((durationStr: string) => {
    if (!durationStr) return { hours: 0, minutes: 0 };
    const parts = durationStr.split(":");
    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parseInt(parts[1] || "0", 10);
    return { hours, minutes };
  }, []);

  // Format hours and minutes into HH:mm string
  const formatDuration = React.useCallback((hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }, []);

  // Get current hours and minutes from duration
  const { hours: currentHours, minutes: currentMinutes } = React.useMemo(() => {
    return parseDuration(duration);
  }, [duration, parseDuration]);

  // Handle hour change
  const handleHourChange = React.useCallback((newHours: number) => {
    const clampedHours = Math.max(0, Math.min(23, newHours));
    setDuration(formatDuration(clampedHours, currentMinutes));
  }, [currentMinutes, formatDuration]);

  // Handle minute change (only allow 00, 15, 30, 45)
  const handleMinuteChange = React.useCallback((newMinutes: number) => {
    // Round to nearest 15-minute increment
    const roundedMinutes = Math.round(newMinutes / 15) * 15;
    const clampedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
    setDuration(formatDuration(currentHours, clampedMinutes));
  }, [currentHours, formatDuration]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedProgramId("");
      setSelectedTeacherId("");
      setDuration("00:30");
      setDate(undefined);
      setIsOnline(false);
      setShowAll(false);
      setGoToDate(new Date());
      setCalendarDate(new Date());
      setScheduleData(null);
    }
  }, [open]);

  // Get most recent program from private lesson data
  const getMostRecentProgram = React.useCallback(() => {
    if (!privateLessonData || privateLessonData.length === 0) return null;
    
    // Sort by date (most recent first) and get the first one's program name
    const sorted = [...privateLessonData].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA; // Most recent first
    });
    
    return sorted[0]?.programName || null;
  }, [privateLessonData]);

  // Generic fetch handler
  const handleFetch = React.useCallback(
    async <T,>(
      fetchFn: () => Promise<T>,
      setData: (data: T) => void,
      setLoading: (loading: boolean) => void,
      errorMessage: string
    ) => {
      setLoading(true);
      try {
        const result = await fetchFn();
        setData(result);
      } catch (err: unknown) {
        console.error(errorMessage, err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch programs when modal opens
  React.useEffect(() => {
    if (!open) return;
    
    handleFetch(
      () => getProgramsList('private'),
      (programList) => {
        setPrograms(programList);
        // Set default program from most recent private lesson
        const mostRecentProgramName = getMostRecentProgram();
        if (mostRecentProgramName) {
          const matchingProgram = programList.find((p) => p.name === mostRecentProgramName);
          if (matchingProgram) {
            setSelectedProgramId(matchingProgram.id.toString());
          }
        }
      },
      setLoadingPrograms,
      "Error fetching programs:"
    );
  }, [open, getMostRecentProgram, handleFetch]);

  // Fetch teachers when modal opens
  React.useEffect(() => {
    if (!open) return;
    
    handleFetch(
      () => getTeachersList(location),
      (response: TeachersResponse | null) => {
        if (response?.success && response.data) {
          setTeachers(response.data.map((t) => ({ id: t.id, name: t.name || "" })));
        }
      },
      setLoadingTeachers,
      "Error fetching teachers:"
    );
  }, [open, location, handleFetch]);

  // Fetch schedule when teacher is selected
  React.useEffect(() => {
    if (!selectedTeacherId || !open) {
      setScheduleData(null);
      setLoadingCalendar(false);
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

  // Helper to convert array to select options
  const createSelectOptions = React.useCallback(
    <T extends { id: number; name: string }>(items: T[]) =>
      items.map((item) => ({ value: item.id.toString(), label: item.name })),
    []
  );

  // Helper to find name by id
  const findNameById = React.useCallback(
    <T extends { id: number; name: string }>(items: T[], id: string) =>
      items.find((item) => item.id.toString() === id)?.name || "",
    []
  );

  const programOptions = React.useMemo(() => createSelectOptions(programs), [programs, createSelectOptions]);
  const teacherOptions = React.useMemo(() => createSelectOptions(teachers), [teachers, createSelectOptions]);
  const selectedProgramName = React.useMemo(
    () => findNameById(programs, selectedProgramId),
    [programs, selectedProgramId, findNameById]
  );
  const selectedTeacherName = React.useMemo(
    () => findNameById(teachers, selectedTeacherId),
    [teachers, selectedTeacherId, findNameById]
  );
  
  const calendarMonday = React.useMemo(() => getMondayOfWeek(calendarDate), [calendarDate]);
  
  const calendarEvents = React.useMemo(() => {
    if (!scheduleData) return [];
    return convertLessonsToCalendarEvents(scheduleData.lessons, calendarMonday);
  }, [scheduleData, calendarMonday]);
  
  const timeRange = React.useMemo(
    () => scheduleData
      ? { minTime: scheduleData.time.from, maxTime: scheduleData.time.to }
      : { minTime: "04:00:00", maxTime: "20:00:00" },
    [scheduleData]
  );
  
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
  
  const availabilityEvents = React.useMemo(
    () => scheduleData?.availability
      ? convertAvailabilityEvents(scheduleData.availability, calendarMonday)
      : [],
    [scheduleData, calendarMonday]
  );

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
    if (date) {
      setCalendarDate(getMondayOfWeek(date));
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined, setter: (date: Date | undefined) => void, closePicker: () => void) => {
    if (selectedDate) {
      setter(selectedDate);
      if (selectedTeacherId) {
        setCalendarDate(getMondayOfWeek(selectedDate));
      }
      closePicker();
    }
  };

  // Calculate duration from time range
  const calculateDuration = React.useCallback((start: Date, end: Date): string => {
    const startMinutes = start.getHours() * 60 + start.getMinutes();
    const endMinutes = end.getHours() * 60 + end.getMinutes();
    const diffMinutes = endMinutes - startMinutes;
    const durationHours = Math.floor(diffMinutes / 60);
    const durationMins = diffMinutes % 60;
    
    // Round minutes to nearest 15-minute increment
    const roundedMinutes = Math.round(durationMins / 15) * 15;
    const finalMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
    const finalHours = roundedMinutes >= 60 ? durationHours + 1 : durationHours;
    
    return formatDuration(finalHours, finalMinutes);
  }, [formatDuration]);

  // Calculate date for selected day of week with time
  const calculateSelectedDate = React.useCallback(
    (resourceId: number, slotStart: Date): Date => {
      const monday = getMondayOfWeek(calendarDate);
      const selectedDayDate = new Date(monday);
      const daysToAdd = resourceId - 1; // resourceId is 1-7 (Monday-Sunday)
      selectedDayDate.setDate(monday.getDate() + daysToAdd);
      return createDateWithTime(selectedDayDate, slotStart);
    },
    [calendarDate]
  );

  const handleSelectSlot = React.useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
      if (!slotInfo.start) return;
      
      const duration = calculateDuration(slotInfo.start, slotInfo.end);
      setDuration(duration);
      
      const resourceId = parseResourceId(slotInfo.resourceId);
      const selectedDate = calculateSelectedDate(resourceId, slotInfo.start);
      setDate(selectedDate);
    },
    [calculateDuration, calculateSelectedDate]
  );

  const handleSave = () => {
    const formData: LessonFormData = {
      programId: selectedProgramId,
      programName: selectedProgramName,
      teacherId: selectedTeacherId,
      teacherName: selectedTeacherName,
      duration,
      date: date ? formatDateString(date) : undefined,
      isOnline,
      showAll,
      goToDate: goToDate ? formatDateString(goToDate) : undefined,
    };
    onSave?.(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Lesson</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Form Fields - Single Row */}
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <SearchableSelect
                id="program"
                options={programOptions}
                value={selectedProgramId}
                onValueChange={setSelectedProgramId}
                placeholder="Program"
                searchPlaceholder="Search programs..."
                emptyText="No programs available"
                loadingText="Loading programs..."
                noResultsText="No programs found"
                className="w-full"
                disabled={loadingPrograms}
                isLoading={loadingPrograms}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="teacher">Teacher Name</Label>
              <SearchableSelect
                id="teacher"
                options={teacherOptions}
                value={selectedTeacherId}
                onValueChange={handleTeacherChange}
                placeholder="Teacher Name"
                searchPlaceholder="Search teachers..."
                emptyText="No teachers available"
                loadingText="Loading teachers..."
                noResultsText="No teachers found"
                className="w-full"
                disabled={loadingTeachers}
                isLoading={loadingTeachers}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
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
            
             <div className="space-y-2">
               <DatePickerField
                 label="Date"
                 date={date}
                 onDateSelect={(selectedDate) => handleDateSelect(selectedDate, setDate, () => setDatePickerOpen(false))}
                 isOpen={datePickerOpen}
                 onOpenChange={setDatePickerOpen}
                 disabled={true}
               />
             </div>
          </div>
          
          {/* Checkboxes */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="is-online"
                checked={isOnline}
                onCheckedChange={(checked) => setIsOnline(checked === true)}
              />
              <Label htmlFor="is-online" className="text-sm font-normal cursor-pointer">
                Is Online
              </Label>
            </div>
          </div>
          
          {/* Date Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center py-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all"
                checked={showAll}
                onCheckedChange={(checked) => setShowAll(checked === true)}
              />
              <Label htmlFor="show-all" className="text-sm font-normal cursor-pointer">
                Show All
              </Label>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-lg font-semibold whitespace-nowrap">{dateRange}</p>
            </div>
            <div className="flex items-center justify-end">
              <Popover open={goToDatePickerOpen} onOpenChange={setGoToDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9">
                    Go to Date
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={goToDate}
                    defaultMonth={goToDate || new Date()}
                    onSelect={(date) => {
                      if (date) {
                        setGoToDate(date);
                        setCalendarDate(getMondayOfWeek(date));
                        setGoToDatePickerOpen(false);
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
          
          {/* Calendar */}
          <div className="border rounded-lg overflow-hidden">
            {loadingCalendar ? (
              <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">Loading schedule...</p>
              </div>
            ) : !selectedTeacherId ? (
              <div className="flex items-center justify-center h-[60vh]">
                <p className="text-muted-foreground">Please select a teacher to view schedule</p>
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
        </div>
        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


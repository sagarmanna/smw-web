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
import { MonthPicker } from "@/components/ui/month-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, startOfWeek, endOfWeek, parse } from "date-fns";
import { cn } from "@/lib/utils";
import { EnrolmentSchedule } from "../../types";
import {
  getPermanentScheduleChangePreview,
  postPermanentScheduleChangeReschedule,
  getPermanentScheduleChangeReview,
  confirmLessons,
  PermanentScheduleChangeDetailBody,
  PermanentScheduleChangePreviewBody,
  PermanentScheduleChangeRescheduleBody,
} from "../../[id]/enrolment-details.api";
import {
  NewEnrolmentReviewModal,
  type LessonPreview,
  type EnrolmentReviewDetails,
} from "@/components/EnrolmentWizard/NewEnrolmentReviewModal";
import {
  ReactBigCalendarWrapper,
  CalendarEvent,
} from "@/components/Calendar/ReactBigCalendarWrapper";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleAvailabilityEvent,
  type TeacherScheduleLessonEvent,
} from "../../../teachers/[id]/teachers-details-tabs.api";
import { toast } from "sonner";

interface PermanentScheduleChangeModalProps {
  open: boolean;
  onClose: () => void;
  schedule: EnrolmentSchedule | null;
  saving?: boolean;
  location: string;
  enrolmentId: string;
  onSuccess?: () => Promise<void>;
}

type Step = "start" | "detail" | "review";

const DAY_RESOURCES = [
  { id: 1, title: "Monday" },
  { id: 2, title: "Tuesday" },
  { id: 3, title: "Wednesday" },
  { id: 4, title: "Thursday" },
  { id: 5, title: "Friday" },
  { id: 6, title: "Saturday" },
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

export function PermanentScheduleChangeModal({
  open,
  onClose,
  schedule,
  saving = false,
  location,
  enrolmentId,
  onSuccess,
}: PermanentScheduleChangeModalProps) {
  const [step, setStep] = React.useState<Step>("start");
  const [startMonth, setStartMonth] = React.useState<Date | undefined>(undefined);
  const [previewData, setPreviewData] = React.useState<PermanentScheduleChangePreviewBody | null>(null);
  const [detailData, setDetailData] = React.useState<PermanentScheduleChangeDetailBody | null>(null);
  const [rescheduleResult, setRescheduleResult] = React.useState<PermanentScheduleChangeRescheduleBody | null>(null);
  const [formError, setFormError] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  // Calendar view state
  const [selectedTeacherId, setSelectedTeacherId] = React.useState<string>("");
  const [day, setDay] = React.useState<string>("");
  const [startTime, setStartTime] = React.useState<string>("");
  const [duration, setDuration] = React.useState<string>("");
  const [rescheduleBeginDate, setRescheduleBeginDate] = React.useState<Date | undefined>(undefined);
  const [goToDate, setGoToDate] = React.useState<Date | undefined>(undefined);
  const [showAll, setShowAll] = React.useState<boolean>(false);
  const [calendarDate, setCalendarDate] = React.useState<Date>(new Date());
  const [scheduleData, setScheduleData] = React.useState<TeacherScheduleData | null>(null);
  const [loadingCalendar, setLoadingCalendar] = React.useState(false);
  const [startDatePickerOpen, setStartDatePickerOpen] = React.useState(false);
  const [goToDatePickerOpen, setGoToDatePickerOpen] = React.useState(false);

  // Review modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [lessonPreviews, setLessonPreviews] = React.useState<LessonPreview[]>([]);
  const [unscheduledLessonPreviews, setUnscheduledLessonPreviews] = React.useState<LessonPreview[]>([]);
  const [rescheduledLessonPreviews, setRescheduledLessonPreviews] = React.useState<LessonPreview[]>([]);
  const [reviewDetails, setReviewDetails] = React.useState<EnrolmentReviewDetails | undefined>(undefined);
  const [courseId, setCourseId] = React.useState<number | undefined>(undefined);

  // Helpers
  const formatMonthParam = (date?: Date) => (date ? format(new Date(date.getFullYear(), date.getMonth(), 1), "yyyy-MM") : "");
  const formatDateForReschedule = (date?: Date) => (date ? format(date, "MMM d, yyyy") : "");

  const isExpanded = !!selectedTeacherId;

  React.useEffect(() => {
    if (open) {
      if (schedule?.startDate) {
        const parsed = new Date(schedule.startDate);
        if (!isNaN(parsed.getTime())) {
          setStartMonth(parsed);
        }
      }
      setStep("start");
      setFormError("");
      setPreviewData(null);
      setDetailData(null);
      setRescheduleResult(null);
      setSelectedTeacherId("");
      setDay("");
      setStartTime("");
      setDuration("");
      setRescheduleBeginDate(undefined);
      setGoToDate(undefined);
      setShowAll(false);
      setScheduleData(null);
      setIsReviewModalOpen(false);
      setLessonPreviews([]);
      setReviewDetails(undefined);
      setCourseId(undefined);
    } else {
      setFormError("");
    }
  }, [open, schedule]);

  // Load calendar data when teacher is selected
  React.useEffect(() => {
    if (!selectedTeacherId || !open || step !== "detail") {
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
  }, [selectedTeacherId, calendarDate, location, open, showAll, step]);

  const handleLoadDetail = async () => {
    if (!startMonth) {
      setFormError("Date to change schedule cannot be blank.");
      return;
    }
    setFormError("");
    setLoading(true);
    try {
      // Use merged API - pass startMonth to get detail data with validations
      const response = await getPermanentScheduleChangePreview(location, enrolmentId, formatMonthParam(startMonth));
      if (!response?.success || !response.data?.body) {
        throw new Error(response?.message || "Failed to load data");
      }
      const body = response.data.body;
      
      // Set both preview and detail data (they're the same now)
      setPreviewData(body);
      setDetailData(body);
      setCourseId(body.courseId);

      // Prefill form fields
      setSelectedTeacherId(String(body.currentTeacherId || ""));
      const dayTimeParts = body.currentDayTime?.split(" ") || [];
      setDay(dayTimeParts[0] || "");
      setStartTime(dayTimeParts.slice(1).join(" ") || "");
      setDuration(body.currentDuration || "");
      const beginDate = startMonth
        ? new Date(startMonth.getFullYear(), startMonth.getMonth(), 1)
        : undefined;
      setRescheduleBeginDate(beginDate);
      setGoToDate(beginDate);
      if (beginDate) {
        setCalendarDate(getMondayOfWeek(beginDate));
      }

      setStep("detail");
    } catch (error) {
      console.error("Error loading permanent schedule change detail:", error);
      toast.error(error instanceof Error ? error.message : "Failed to load detail data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!detailData) {
      setFormError("Please complete the details first.");
      return;
    }
    if (!selectedTeacherId || !day || !startTime || !duration || !rescheduleBeginDate) {
      setFormError("All fields are required.");
      return;
    }
    if (!startMonth) {
      setFormError("Start month is required.");
      return;
    }

    setFormError("");
    setLoading(true);
    try {
      // Convert startTime from "hh:mm AM/PM" to "HH:mm" for API
      const timeMatch = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!timeMatch) {
        throw new Error("Invalid time format. Please use format like '04:00 PM'");
      }
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2];
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === 'PM' && hours !== 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      // time24 is calculated but not used - kept for potential future use
      // const time24 = `${String(hours).padStart(2, '0')}:${minutes}`;

      // Use dateToChangeSchedule from detailData if available, otherwise generate from startMonth
      const dateToChangeSchedule = detailData.dateToChangeSchedule || formatMonthParam(startMonth);
      if (!dateToChangeSchedule) {
        throw new Error("Date to change schedule is required.");
      }

      const payload = {
        dateToChangeSchedule,
        teacherId: Number(selectedTeacherId),
        dayTime: `${day} ${startTime}`,
        duration: duration,
        rescheduleBeginDate: formatDateForReschedule(rescheduleBeginDate),
      };

      const resp = await postPermanentScheduleChangeReschedule(location, enrolmentId, payload);
      if (!resp?.success || !resp.data?.body) {
        throw new Error(resp?.message || "Failed to reschedule lessons");
      }
      setRescheduleResult(resp.data.body);

      // Fetch lesson review data using the permanent schedule change review API
      if (courseId && resp.data.body) {
        const reviewResult = await getPermanentScheduleChangeReview(location, enrolmentId, {
          courseId,
          rescheduleBeginDate: resp.data.body.rescheduleBeginDate,
          rescheduleEndDate: resp.data.body.rescheduleEndDate,
          isTeacherOnlyChanged: resp.data.body.isTeacherOnlyChanged,
          showAllReviewLessons: false,
        });
        if (reviewResult?.success && reviewResult.data) {
          const reviewData = reviewResult.data;
          
          // Transform review lessons to LessonPreview format
          const previews: LessonPreview[] = reviewData.lessons.map((lesson, index) => {
            const lessonDate = new Date(lesson.date);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[lessonDate.getDay()];
            
            const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
            const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
            const startTime = `${utcHours}:${utcMinutes}`;
            
            return {
              index: index + 1,
              id: lesson.id,
              date: lessonDate.toISOString().split('T')[0],
              day: dayName,
              startTime: startTime,
              duration: lesson.duration,
              conflict: lesson.conflict,
              isHolidayConflict: lesson.isHolidayConflict,
              isConflict: lesson.isConflict,
              isUnscheduled: lesson.isUnscheduled,
            };
          });

          setLessonPreviews(previews);

          // Transform unscheduled lessons
          const unscheduledPreviews: LessonPreview[] = (reviewData.unscheduledLessons || []).map((lesson, index) => {
            const lessonDate = new Date(lesson.date);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[lessonDate.getDay()];
            const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
            const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
            const startTime = `${utcHours}:${utcMinutes}`;
            
            return {
              index: index + 1,
              id: lesson.id,
              date: lessonDate.toISOString().split('T')[0],
              day: dayName,
              startTime: startTime,
              duration: lesson.duration,
            };
          });
          setUnscheduledLessonPreviews(unscheduledPreviews);

          // Transform rescheduled lessons
          const rescheduledPreviews: LessonPreview[] = (reviewData.rescheduledLessons || []).map((lesson, index) => {
            const lessonDate = new Date(lesson.date);
            const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const dayName = dayNames[lessonDate.getDay()];
            const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
            const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
            const startTime = `${utcHours}:${utcMinutes}`;
            
            return {
              index: index + 1,
              id: lesson.id,
              date: lessonDate.toISOString().split('T')[0],
              day: dayName,
              startTime: startTime,
              duration: lesson.duration,
            };
          });
          setRescheduledLessonPreviews(rescheduledPreviews);

          setReviewDetails({
            studentName: reviewData.studentName,
            programName: reviewData.programName,
            teacherName: reviewData.teacherName,
            teacherId: Number(selectedTeacherId),
            startDate: reviewData.startDate,
            endDate: reviewData.endDate,
            startTime: reviewData.startTime,
          });
        }
      }

      setStep("review");
      setIsReviewModalOpen(true);
      toast.success("Lessons rescheduled. Please review.");
    } catch (error) {
      console.error("Error in permanent schedule reschedule:", error);
      toast.error(error instanceof Error ? error.message : "Failed to reschedule lessons. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherChange = (value: string) => {
    setSelectedTeacherId(value);
    if (rescheduleBeginDate) {
      setCalendarDate(getMondayOfWeek(rescheduleBeginDate));
    }
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
    
    const resourceId = typeof slotInfo.resourceId === 'string' 
      ? parseInt(slotInfo.resourceId) 
      : slotInfo.resourceId || 1;
    
    if (resourceId >= 1 && resourceId <= 7) {
      setDay(DAY_NAMES[resourceId]);
    }
    
    const selectedHours = slotInfo.start.getHours();
    const selectedMinutes = slotInfo.start.getMinutes();
    
    const calendarMonday = getMondayOfWeek(calendarDate);
    const selectedDayDate = new Date(calendarMonday);
    const daysToAdd = resourceId - 1;
    selectedDayDate.setDate(calendarMonday.getDate() + daysToAdd);
    selectedDayDate.setHours(selectedHours, selectedMinutes, 0, 0);
    
    setRescheduleBeginDate(selectedDayDate);
    setGoToDate(selectedDayDate);
    
    const minutes = String(selectedMinutes).padStart(2, '0');
    
    // Convert to 12-hour format with AM/PM
    const displayHours = selectedHours % 12 || 12;
    const ampm = selectedHours >= 12 ? 'PM' : 'AM';
    setStartTime(`${displayHours}:${minutes} ${ampm}`);
  }, [calendarDate]);

  const teacherOptions = React.useMemo(() => 
    (detailData?.teachers || previewData?.teachers || []).map((t) => ({ 
      value: t.id.toString(), 
      label: t.name 
    })), 
    [detailData?.teachers, previewData?.teachers]
  );

  const calendarMonday = React.useMemo(() => getMondayOfWeek(calendarDate), [calendarDate]);
  const calendarEvents = React.useMemo(() => {
    if (!scheduleData) return [];
    const events = convertLessonsToCalendarEvents(scheduleData.lessons, calendarMonday);
    
    // Add preview event for selected slot
    if (day && startTime && selectedTeacherId && duration) {
      const timeMatch = startTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        const ampm = timeMatch[3].toUpperCase();
        if (ampm === 'PM' && hours !== 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;
        
        const dayIndex = DAY_NAMES.indexOf(day);
        const resourceId = dayIndex >= 1 && dayIndex <= 7 ? dayIndex : null;
        
        if (resourceId) {
          const [durationHoursStr, durationMinutesStr] = duration.split(':');
          const durationHours = parseInt(durationHoursStr || '0', 10);
          const durationMinutes = parseInt(durationMinutesStr || '0', 10);
          
          const startTimeMinutes = hours * 60 + minutes;
          const totalDurationMinutes = durationHours * 60 + durationMinutes;
          const endTimeMinutes = startTimeMinutes + totalDurationMinutes;
          
          const endHours = Math.floor(endTimeMinutes / 60);
          const endMinutes = endTimeMinutes % 60;
          
          const previewStartAdjusted = new Date(calendarMonday);
          previewStartAdjusted.setHours(hours, minutes, 0, 0);
          
          const previewEndAdjusted = new Date(calendarMonday);
          previewEndAdjusted.setHours(endHours, endMinutes, 0, 0);
          
          const formatTime = (h: number, m: number) => {
            const displayH = h % 12 || 12;
            const mStr = m.toString().padStart(2, '0');
            const ampm = h >= 12 ? 'PM' : 'AM';
            return `${displayH}:${mStr} ${ampm}`;
          };
          
          const startTimeFormatted = formatTime(hours, minutes);
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
    }
    
    return events;
  }, [scheduleData, calendarMonday, day, startTime, selectedTeacherId, duration]);

  const timeRange = React.useMemo(() => 
    scheduleData ? { minTime: scheduleData.time.from, maxTime: scheduleData.time.to } : { minTime: "04:00:00", maxTime: "20:00:00" }, 
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

  const availabilityEvents = React.useMemo(() => 
    scheduleData?.availability ? convertAvailabilityEvents(scheduleData.availability, calendarMonday) : [], 
    [scheduleData, calendarMonday]
  );

  const renderStartStep = () => (
    <div className={cn("space-y-2 p-3 rounded-md border", formError ? "border-red-500" : "border-transparent")}>
      <label className={cn("text-sm font-semibold", formError ? "text-red-600 dark:text-red-400" : "text-foreground")}>
        Date To Change Schedule
      </label>
      <MonthPicker
        id="starting-date"
        label="Starting Date"
        value={startMonth}
        onSelect={(date) => {
          setStartMonth(date ?? undefined);
          setFormError("");
        }}
        placeholder="Pick a month"
        fromYear={2005}
        toYear={2125}
      />
      {formError && <p className="text-sm text-red-500">{formError}</p>}
    </div>
  );

  const renderDetailStep = () => (
    <div className="space-y-4">
      <div className="rounded-md border p-3">
        <p className="text-sm font-semibold mb-1">Current Schedule</p>
        <p className="text-sm text-muted-foreground">
          Teacher: {detailData?.currentTeacherName || "N/A"} • {detailData?.currentDayTime || "N/A"} • {detailData?.currentDuration || "N/A"}
        </p>
      </div>

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
          />
        </div>
        <DatePickerField 
          label="Reschedule Begin Date" 
          date={rescheduleBeginDate} 
          onDateSelect={(date) => handleDateSelect(date, setRescheduleBeginDate, () => setStartDatePickerOpen(false))} 
          isOpen={startDatePickerOpen} 
          onOpenChange={setStartDatePickerOpen} 
        />
        <div className="space-y-2">
          <Label htmlFor="day">Day</Label>
          <Input 
            id="day" 
            type="text" 
            value={day} 
            onChange={(e) => setDay(e.target.value)} 
            className="w-full" 
            placeholder="Day" 
            disabled={!isExpanded} 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="start-time">Start Time</Label>
          <Input 
            id="start-time" 
            type="text" 
            value={startTime} 
            onChange={(e) => setStartTime(e.target.value)} 
            className="w-full" 
            placeholder="04:00 PM"
            disabled={!isExpanded} 
          />
        </div>
        {isExpanded && (
          <DatePickerField 
            label="Go to Date" 
            date={goToDate} 
            onDateSelect={(date) => handleDateSelect(date, setGoToDate, () => setGoToDatePickerOpen(false))} 
            isOpen={goToDatePickerOpen} 
            onOpenChange={setGoToDatePickerOpen} 
          />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (HH:mm)</Label>
          <Input
            id="duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="01:00"
          />
        </div>
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

      {formError && <p className="text-sm text-red-500">{formError}</p>}
    </div>
  );

  const renderBody = () => {
    switch (step) {
      case "start":
        return renderStartStep();
      case "detail":
        return renderDetailStep();
      default:
        return null;
    }
  };

  const primaryLabel = step === "start" ? "Next" : step === "detail" ? "Preview lessons" : "Close";

  const handlePrimary = async () => {
    if (step === "start") {
      await handleLoadDetail();
    } else if (step === "detail") {
      await handleReschedule();
    } else {
      onClose();
    }
  };

  const canGoBack = step === "detail";

  const handleReviewBack = () => {
    setIsReviewModalOpen(false);
    setStep("detail");
  };

  const handleReviewConfirm = async () => {
    if (!courseId || !rescheduleResult) {
      toast.error("Missing required data for confirmation");
      return;
    }

    setLoading(true);
    try {
      // Convert dates from "MMM D, Y" format to "d-m-Y" format for API
      // rescheduleResult.rescheduleBeginDate is in "MMM D, Y" format (e.g., "Feb 1, 2026")
      // API expects "d-m-Y" format (e.g., "01-02-2026")
      const parseDateToDMY = (dateStr: string): string => {
        try {
          // Try parsing "MMM d, yyyy" format first (e.g., "Feb 1, 2026")
          let date = parse(dateStr, "MMM d, yyyy", new Date());
          if (isNaN(date.getTime())) {
            // Try "MMM dd, yyyy" format (e.g., "Feb 01, 2026")
            date = parse(dateStr, "MMM dd, yyyy", new Date());
          }
          if (isNaN(date.getTime())) {
            // Try standard Date parsing as fallback
            date = new Date(dateStr);
          }
          if (isNaN(date.getTime())) {
            throw new Error(`Invalid date format: ${dateStr}`);
          }
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        } catch (error) {
          console.error("Error parsing date:", dateStr, error);
          throw new Error(`Failed to parse date: ${dateStr}`);
        }
      };

      const confirmResult = await confirmLessons(location, {
        courseId,
        rescheduleBeginDate: parseDateToDMY(rescheduleResult.rescheduleBeginDate),
        rescheduleEndDate: parseDateToDMY(rescheduleResult.rescheduleEndDate),
      });

      if (!confirmResult?.success) {
        throw new Error(confirmResult?.message || "Failed to confirm lessons");
      }

      // Close review modal and main modal
      setIsReviewModalOpen(false);
      onClose();
      if (onSuccess) {
        await onSuccess();
      }
      toast.success("Permanent schedule change completed successfully.");
    } catch (error: unknown) {
      console.error("Error confirming lessons:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to confirm lessons";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewLessonUpdated = async () => {
    // Refresh lesson review data after lesson update
    if (courseId && rescheduleResult) {
      const reviewResult = await getPermanentScheduleChangeReview(location, enrolmentId, {
        courseId,
        rescheduleBeginDate: rescheduleResult.rescheduleBeginDate,
        rescheduleEndDate: rescheduleResult.rescheduleEndDate,
        isTeacherOnlyChanged: rescheduleResult.isTeacherOnlyChanged,
        showAllReviewLessons: false,
      });
      if (reviewResult?.success && reviewResult.data) {
        const reviewData = reviewResult.data;
        const previews: LessonPreview[] = reviewData.lessons.map((lesson, index) => {
          const lessonDate = new Date(lesson.date);
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = dayNames[lessonDate.getDay()];
          const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
          const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
          const startTime = `${utcHours}:${utcMinutes}`;
          
          return {
            index: index + 1,
            id: lesson.id,
            date: lessonDate.toISOString().split('T')[0],
            day: dayName,
            startTime: startTime,
            duration: lesson.duration,
            conflict: lesson.conflict,
            isHolidayConflict: lesson.isHolidayConflict,
            isConflict: lesson.isConflict,
            isUnscheduled: lesson.isUnscheduled,
          };
        });
        setLessonPreviews(previews);

        // Refresh unscheduled lessons
        const unscheduledPreviews: LessonPreview[] = (reviewData.unscheduledLessons || []).map((lesson, index) => {
          const lessonDate = new Date(lesson.date);
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = dayNames[lessonDate.getDay()];
          const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
          const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
          const startTime = `${utcHours}:${utcMinutes}`;
          
          return {
            index: index + 1,
            id: lesson.id,
            date: lessonDate.toISOString().split('T')[0],
            day: dayName,
            startTime: startTime,
            duration: lesson.duration,
          };
        });
        setUnscheduledLessonPreviews(unscheduledPreviews);

        // Refresh rescheduled lessons
        const rescheduledPreviews: LessonPreview[] = (reviewData.rescheduledLessons || []).map((lesson, index) => {
          const lessonDate = new Date(lesson.date);
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const dayName = dayNames[lessonDate.getDay()];
          const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
          const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
          const startTime = `${utcHours}:${utcMinutes}`;
          
          return {
            index: index + 1,
            id: lesson.id,
            date: lessonDate.toISOString().split('T')[0],
            day: dayName,
            startTime: startTime,
            duration: lesson.duration,
          };
        });
        setRescheduledLessonPreviews(rescheduledPreviews);
      }
    }
  };

  return (
    <>
      <Dialog open={open && !isReviewModalOpen} onOpenChange={(value) => !value && onClose()}>
        <DialogContent className={cn(
          step === "start" && "sm:max-w-[600px]",
          step === "detail" && "max-w-5xl max-h-[90vh] overflow-y-auto",
          isExpanded && step === "detail" && "max-w-7xl"
        )}>
          <DialogHeader>
            <DialogTitle>Permanent Schedule Change</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {renderBody()}

            <DialogFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={saving || loading}>
                  Cancel
                </Button>
                {canGoBack && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setStep("start");
                    }}
                    disabled={saving || loading}
                  >
                    Back
                  </Button>
                )}
              </div>
              <Button type="button" onClick={handlePrimary} disabled={saving || loading || (step === "detail" && (!day || !startTime))}>
                {loading ? "Working..." : primaryLabel}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Review Modal */}
      {isReviewModalOpen && courseId && (
        <NewEnrolmentReviewModal
          open={isReviewModalOpen}
          onOpenChange={setIsReviewModalOpen}
          lessons={lessonPreviews}
          details={reviewDetails}
          onBack={handleReviewBack}
          onConfirm={handleReviewConfirm}
          isLoading={loading}
          onLessonUpdated={handleReviewLessonUpdated}
          location={location}
          courseId={courseId}
          unscheduledLessons={unscheduledLessonPreviews}
          rescheduledLessons={rescheduledLessonPreviews}
          isPermanentScheduleChange={false}
        />
      )}
    </>
  );
}

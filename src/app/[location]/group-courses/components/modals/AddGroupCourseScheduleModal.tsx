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
import { Plus, Minus, CalendarIcon } from "lucide-react";
import { GroupCourseRow } from "../../types";
import { cn } from "@/lib/utils";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleAvailabilityEvent,
  type TeacherScheduleLessonEvent,
} from "@/app/[location]/teachers/[id]/teachers-details-tabs.api";
import { format, parse, startOfWeek, endOfWeek } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  createGroupCourse,
  reviewGroupCourseLesson,
  confirmGroupCourse,
  deleteReviewLesson,
} from "../../groupCourses.api";
import { NewEnrolmentReviewModal, type LessonPreview, type EnrolmentReviewDetails } from "@/components/EnrolmentWizard/NewEnrolmentReviewModal";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

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
  location: string;
  onCourseConfirmed?: () => void; // Callback to refresh the listing
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

export function AddGroupCourseScheduleModal({
  open,
  onOpenChange,
  onBack,
  course,
  location,
  onCourseConfirmed,
}: AddGroupCourseScheduleModalProps) {
  const router = useRouter();
  const [rows, setRows] = React.useState<ScheduleRow[]>([
    { id: "row-1", day: "", time: "" },
  ]);
  const [calendarModalOpen, setCalendarModalOpen] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  const [calendarDate, setCalendarDate] = React.useState<Date>(new Date());
  const [scheduleData, setScheduleData] = React.useState<TeacherScheduleData | null>(null);
  const [loadingCalendar, setLoadingCalendar] = React.useState(false);
  const [showAll, setShowAll] = React.useState(false);
  const [goToDate, setGoToDate] = React.useState<Date | undefined>(new Date());
  const [goToDatePickerOpen, setGoToDatePickerOpen] = React.useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [lessonPreviews, setLessonPreviews] = React.useState<LessonPreview[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);
  const [createdCourseId, setCreatedCourseId] = React.useState<number | null>(null);
  const [reviewDetails, setReviewDetails] = React.useState<EnrolmentReviewDetails>({});

  type ReviewResult = Awaited<ReturnType<typeof reviewGroupCourseLesson>>;

  const applyReviewResultToState = React.useCallback(
    (reviewResult: ReviewResult, courseParam: Partial<GroupCourseRow> | null) => {
      if (!reviewResult?.success || !reviewResult.data?.lessons) return;

      const parseDateString = (dateStr: string): { date: Date; time: string } | null => {
        if (!dateStr) return null;
        const match = dateStr.match(/(\w+ \d+, \d+) at (\d+):(\d+) (AM|PM)/i);
        if (match) {
          const datePart = match[1];
          const hour = parseInt(match[2], 10);
          const minute = parseInt(match[3], 10);
          const ampm = match[4].toUpperCase();
          let hour24 = hour;
          if (ampm === "PM" && hour !== 12) hour24 = hour + 12;
          else if (ampm === "AM" && hour === 12) hour24 = 0;
          const date = new Date(datePart);
          date.setHours(hour24, minute, 0, 0);
          const timeStr = `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
          return { date, time: timeStr };
        }
        return null;
      };

      const parsePeriod = (periodStr: string): { startDate?: string; endDate?: string } => {
        if (!periodStr) return {};
        const parts = periodStr.split(" - ");
        if (parts.length === 2) {
          try {
            const startDate = parse(parts[0].trim(), "MMM dd, yyyy", new Date());
            const endDate = parse(parts[1].trim(), "MMM dd, yyyy", new Date());
            if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
              return {
                startDate: format(startDate, "yyyy-MM-dd"),
                endDate: format(endDate, "yyyy-MM-dd"),
              };
            }
          } catch {
            // ignore
          }
        }
        return {};
      };

      const parseTime = (timeStr: string): string | undefined => {
        if (!timeStr) return undefined;
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (match) {
          let hour = parseInt(match[1], 10);
          const minute = match[2];
          const ampm = match[3].toUpperCase();
          if (ampm === "PM" && hour !== 12) hour += 12;
          else if (ampm === "AM" && hour === 12) hour = 0;
          return `${String(hour).padStart(2, "0")}:${minute}`;
        }
        return undefined;
      };

      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const previews: LessonPreview[] = reviewResult.data.lessons.map((lesson, index) => {
        const parsed = parseDateString(lesson.date);
        if (!parsed) {
          return {
            index: index + 1,
            id: lesson.id,
            date: "",
            day: "",
            startTime: "",
            duration: lesson.duration || "",
            isHolidayConflict: lesson.isHolidayConflict,
            isConflict: lesson.isConflict,
            isUnscheduled: lesson.isUnscheduled,
          };
        }
        const { date: lessonDate, time: startTime } = parsed;
        if (isNaN(lessonDate.getTime())) {
          return {
            index: index + 1,
            id: lesson.id,
            date: "",
            day: "",
            startTime: "",
            duration: lesson.duration || "",
            isHolidayConflict: lesson.isHolidayConflict,
            isConflict: lesson.isConflict,
            isUnscheduled: lesson.isUnscheduled,
          };
        }
        const dayName = dayNames[lessonDate.getDay()];
        return {
          index: index + 1,
          id: lesson.id,
          date: format(lessonDate, "yyyy-MM-dd"),
          day: dayName,
          startTime,
          duration: lesson.duration || "",
          isHolidayConflict: lesson.isHolidayConflict,
          isConflict: lesson.isConflict,
          isUnscheduled: lesson.isUnscheduled,
        };
      });

      setLessonPreviews(previews);

      const { startDate, endDate } = parsePeriod(reviewResult.data.period);
      const startTime = parseTime(reviewResult.data.time);
      const details: EnrolmentReviewDetails = {
        programName: reviewResult.data.program,
        teacherName: reviewResult.data.teacher,
        teacherId: courseParam?.teacherId,
        startDate,
        endDate,
        startTime,
      };
      setReviewDetails(details);
    },
    []
  );

  const handleLessonUpdated = React.useCallback(async () => {
    if (!createdCourseId) return;
    try {
      const reviewResult = await reviewGroupCourseLesson(location, createdCourseId);
      applyReviewResultToState(reviewResult, course);
    } catch (e) {
      console.error("Error refetching review after lesson update:", e);
    }
  }, [location, createdCourseId, course, applyReviewResultToState]);

  const handleDeleteLesson = React.useCallback(
    async (lessonId: number): Promise<boolean> => {
      if (!createdCourseId) return false;
      const result = await deleteReviewLesson(location, lessonId, createdCourseId);
      if (result.success) {
        await handleLessonUpdated();
        return true;
      }
      toast.error(result.message || "Failed to delete lesson");
      return false;
    },
    [location, createdCourseId, handleLessonUpdated]
  );

  React.useEffect(() => {
    if (open) {
      setRows([{ id: "row-1", day: "", time: "" }]);
      setCalendarModalOpen(false);
      setSelectedRowId(null);
      setCalendarDate(new Date());
      setScheduleData(null);
      setShowAll(false);
      setIsReviewModalOpen(false);
      setLessonPreviews([]);
      setIsLoadingPreview(false);
      setCreatedCourseId(null);
      setReviewDetails({});
      setGoToDate(new Date());
      setGoToDatePickerOpen(false);
    }
  }, [open]);

  // Initialize goToDate when calendar modal opens
  React.useEffect(() => {
    if (calendarModalOpen && !goToDate) {
      setGoToDate(new Date());
    }
  }, [calendarModalOpen, goToDate]);

  // Fetch schedule data when calendar modal opens and teacher is available
  React.useEffect(() => {
    if (!calendarModalOpen || !course?.teacherId || !open) {
      setScheduleData(null);
      return;
    }
    setLoadingCalendar(true);
    const monday = getMondayOfWeek(calendarDate);
    getTeacherScheduleEvents(location, course.teacherId, formatDateString(monday), showAll)
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
  }, [calendarModalOpen, course?.teacherId, calendarDate, location, open, showAll]);

  const handleAddRow = () => {
    setRows((prev) => [
      ...prev,
      { id: `row-${prev.length + 1}`, day: "", time: "" },
    ]);
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => (prev.length <= 1 ? prev : prev.filter((r) => r.id !== id)));
  };

  const handleOpenCalendar = (rowId: string) => {
    if (!course?.teacherId) {
      return;
    }
    setSelectedRowId(rowId);
    setCalendarModalOpen(true);
  };

  const handleDateSelect = (date: Date | undefined, setter: (date: Date | undefined) => void, closePicker: () => void) => {
    if (date) {
      setter(date);
      setCalendarDate(getMondayOfWeek(date));
      closePicker();
    }
  };

  const handleSelectSlot = React.useCallback((slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
    if (!slotInfo.start || !slotInfo.resourceId || !selectedRowId) return;
    
    const resourceId = typeof slotInfo.resourceId === 'string' 
      ? parseInt(slotInfo.resourceId) 
      : slotInfo.resourceId || 1;
    
    if (resourceId >= 1 && resourceId <= 7) {
      const dayName = DAY_NAMES[resourceId];
      const selectedHours = slotInfo.start.getHours();
      const selectedMinutes = slotInfo.start.getMinutes();
      const hours = String(selectedHours).padStart(2, '0');
      const minutes = String(selectedMinutes).padStart(2, '0');
      const timeString = `${hours}:${minutes}`;
      
      // Format time for display (12-hour format with AM/PM)
      const formatTime = (h: number, m: number) => {
        const hour = h % 12 || 12;
        const min = m.toString().padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${hour}:${min} ${ampm}`;
      };
      
      setRows((prev) =>
        prev.map((r) =>
          r.id === selectedRowId ? { ...r, day: dayName, time: formatTime(selectedHours, selectedMinutes) } : r
        )
      );
      setCalendarModalOpen(false);
      setSelectedRowId(null);
    }
  }, [selectedRowId]);

  const calendarMonday = React.useMemo(() => getMondayOfWeek(calendarDate), [calendarDate]);
  const calendarEvents = React.useMemo(() => {
    if (!scheduleData) return [];
    return convertLessonsToCalendarEvents(scheduleData.lessons, calendarMonday);
  }, [scheduleData, calendarMonday]);
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

  // Convert time from "07:30 PM" to "HH:mm:ss"
  const convertTimeTo24Hour = (timeStr: string): string | null => {
    if (!timeStr) return null;
    
    // Try to parse 12-hour format (e.g., "07:30 PM")
    const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = match[2];
      const ampm = match[3].toUpperCase();
      
      if (ampm === "PM" && hours !== 12) {
        hours += 12;
      } else if (ampm === "AM" && hours === 12) {
        hours = 0;
      }
      
      return `${String(hours).padStart(2, '0')}:${minutes}:00`;
    }
    
    // If already in 24-hour format, try to parse it
    const time24Match = timeStr.match(/(\d{2}):(\d{2})/);
    if (time24Match) {
      return `${time24Match[1]}:${time24Match[2]}:00`;
    }
    
    return null;
  };

  // Convert duration from "HH:mm" to "HH:mm:ss"
  const convertDurationToSeconds = (duration: string): string => {
    if (!duration) return "00:00:00";
    
    // If already in HH:mm:ss format, return as is
    if (duration.match(/^\d{2}:\d{2}:\d{2}$/)) {
      return duration;
    }
    
    // If in HH:mm format, add :00
    if (duration.match(/^\d{2}:\d{2}$/)) {
      return `${duration}:00`;
    }
    
    return "00:00:00";
  };

  const handlePreviewLessons = async () => {
    if (!course?.programId || !course?.teacherId || !course?.duration || !course?.numberOfWeeks) {
      toast.error("Please complete all required fields");
      return;
    }

    // Validate schedules
    const validSchedules = rows.filter((row) => row.day && row.time);
    if (validSchedules.length === 0) {
      toast.error("Please add at least one schedule with day and time");
      return;
    }

    setIsLoadingPreview(true);
    try {
      // Convert schedules to API format
      const schedules = validSchedules.map((row) => {
        const fromTime = convertTimeTo24Hour(row.time);
        if (!fromTime) {
          throw new Error(`Invalid time format: ${row.time}`);
        }
        return {
          day: row.day,
          fromTime,
        };
      });

      // Create the course
      const createPayload = {
        programId: course.programId,
        teacherId: course.teacherId,
        duration: convertDurationToSeconds(course.duration),
        isOnline: course.isOnline ? 1 : 0,
        weeksCount: course.numberOfWeeks,
        schedules,
      };

      const createResult = await createGroupCourse(location, createPayload);

      if (!createResult || !createResult.success || !createResult.data?.courseId) {
        toast.error(createResult?.message || "Failed to create group course");
        setIsLoadingPreview(false);
        return;
      }

      const courseId = createResult.data.courseId;
      setCreatedCourseId(courseId);

      // Review lessons
      const reviewResult = await reviewGroupCourseLesson(location, courseId);

      if (!reviewResult || !reviewResult.success || !reviewResult.data?.lessons) {
        toast.error(reviewResult?.message || "Failed to review lessons");
        setIsLoadingPreview(false);
        return;
      }

      applyReviewResultToState(reviewResult, course);
      setIsReviewModalOpen(true);
      setIsLoadingPreview(false);
    } catch (error: unknown) {
      console.error("Error previewing lessons:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to preview lessons";
      toast.error(errorMessage);
      setIsLoadingPreview(false);
    }
  };

  const handleConfirmLessons = async () => {
    if (!createdCourseId) {
      toast.error("Course ID not available");
      return;
    }

    setIsLoadingPreview(true);
    try {
      const confirmResult = await confirmGroupCourse(location, createdCourseId);

      if (!confirmResult || !confirmResult.success) {
        toast.error(confirmResult?.message || "Failed to confirm group course");
        setIsLoadingPreview(false);
        return;
      }

      toast.success(confirmResult.message || "Group course confirmed successfully");
      setIsReviewModalOpen(false);
      onOpenChange(false);
      
      // Trigger refresh callback if provided
      onCourseConfirmed?.();
      
      // Navigate to group courses listing page
      router.push(`/${location}/group-courses`);
    } catch (error: unknown) {
      console.error("Error confirming group course:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to confirm group course";
      toast.error(errorMessage);
      setIsLoadingPreview(false);
    }
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
            {rows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[80px,1fr,1fr,80px] items-center gap-3 px-2"
              >
                <div className="flex items-center justify-center">
                  <button
                    type="button"
                    onClick={() => handleOpenCalendar(row.id)}
                    disabled={!course?.teacherId}
                    className={cn(
                      "h-9 w-9 rounded-md border border-input bg-background flex items-center justify-center",
                      course?.teacherId
                        ? "text-foreground hover:bg-accent cursor-pointer"
                        : "text-muted-foreground opacity-50 cursor-not-allowed"
                    )}
                    title={course?.teacherId ? "Select day and time from calendar" : "Teacher not selected"}
                  >
                    <CalendarIcon className="h-4 w-4" />
                  </button>
                </div>
                <Input
                  placeholder="Day"
                  value={row.day}
                  disabled
                  readOnly
                />
                <Input
                  placeholder="Time (e.g. 07:30 PM)"
                  value={row.time}
                  disabled
                  readOnly
                />
                <div className="flex items-center justify-center gap-2">
                  {index === 0 && (
                    <Button
                      type="button"
                      size="icon"
                      className="h-8 w-8 bg-primary hover:bg-primary/90"
                      onClick={handleAddRow}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
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
            <Button type="button" onClick={handlePreviewLessons} disabled={isLoadingPreview}>
              {isLoadingPreview && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Preview Lessons
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Calendar Modal */}
      <Dialog open={calendarModalOpen} onOpenChange={setCalendarModalOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Choose Date, Day and Time
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="show-all" checked={showAll} onCheckedChange={(checked) => setShowAll(checked === true)} />
                <Label htmlFor="show-all" className="text-sm font-normal cursor-pointer">Show All</Label>
              </div>
              <div className="space-y-2">
                <Label>Go to Date</Label>
                <Popover open={goToDatePickerOpen} onOpenChange={setGoToDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !goToDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {goToDate ? format(goToDate, "MMM dd, yyyy") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-2 border-b">
                      <Button variant="outline" size="sm" onClick={() => handleDateSelect(new Date(), setGoToDate, () => setGoToDatePickerOpen(false))} className="w-full h-8 text-xs">Today</Button>
                    </div>
                    <Calendar mode="single" selected={goToDate} onSelect={(date) => handleDateSelect(date, setGoToDate, () => setGoToDatePickerOpen(false))} defaultMonth={goToDate || new Date()} captionLayout="dropdown" fromYear={2005} toYear={2125} />
                  </PopoverContent>
                </Popover>
              </div>
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCalendarModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Review Modal */}
      <NewEnrolmentReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        lessons={lessonPreviews}
        details={reviewDetails}
        onBack={() => {
          setIsReviewModalOpen(false);
        }}
        onConfirm={handleConfirmLessons}
        isLoading={isLoadingPreview}
        location={location}
        courseId={createdCourseId || undefined}
        onLessonUpdated={handleLessonUpdated}
        onDeleteLesson={handleDeleteLesson}
      />
    </Dialog>
  );
}



"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ReactBigCalendarWrapper,
  CalendarEvent,
} from "@/components/Calendar/ReactBigCalendarWrapper";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays } from "date-fns";
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
import { DurationPicker } from "@/components/DurationPicker";
import { parseDuration } from "@/utils/durationUtils";
import {
  mockGetTeacherSchedule,
  type TeacherScheduleData,
  type LessonEvent,
  type ScheduleAvailabilityEvent,
} from "../../../teachers/[id]/mockScheduleData";
import { toast } from "sonner";
import { PrivateLessonDetails } from "../../types";

// Mock teachers list for development
const MOCK_TEACHERS = [
  { id: 1, title: "John Smith" },
  { id: 2, title: "Emma Johnson" },
  { id: 3, title: "Michael Brown" },
  { id: 4, title: "Sarah Davis" },
  { id: 5, title: "Robert Wilson" },
];

const DAY_RESOURCES = [
  { id: 1, title: "Monday" },
  { id: 2, title: "Tuesday" },
  { id: 3, title: "Wednesday" },
  { id: 4, title: "Thursday" },
  { id: 5, title: "Friday" },
  { id: 6, title: "Saturday" },
  { id: 7, title: "Sunday" },
];

interface EditScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  details: PrivateLessonDetails | null;
}

export function EditScheduleModal({
  open,
  onOpenChange,
  details,
}: EditScheduleModalProps) {
  const [scheduleData, setScheduleData] = useState<TeacherScheduleData | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [showAllModal, setShowAllModal] = useState<boolean>(false);
  const [goToDateOpen, setGoToDateOpen] = useState<boolean>(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const detailsRef = useRef(details);
  detailsRef.current = details;

  const getMonday = useCallback((date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const convertLessonsToEvents = useCallback(
    (lessons: LessonEvent[], mondayDate: Date): CalendarEvent[] => {
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
    (availability: ScheduleAvailabilityEvent[], mondayDate: Date) => {
      return availability.map((avail) => {
        const originalStart = new Date(avail.start);
        const originalEnd = new Date(avail.end);

        const availStart = new Date(mondayDate);
        availStart.setHours(
          originalStart.getHours(),
          originalStart.getMinutes(),
          originalStart.getSeconds(),
          0
        );

        const availEnd = new Date(mondayDate);
        availEnd.setHours(
          originalEnd.getHours(),
          originalEnd.getMinutes(),
          originalEnd.getSeconds(),
          0
        );

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

        const teacherIdToUse = targetTeacherId || details?.schedule.teacherId || 1;
        const result = await mockGetTeacherSchedule(teacherIdToUse, dateString, showAllModal);
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
    [details?.schedule.teacherId, showAllModal]
  );

  // Initialize when modal opens or the lesson changes.
  // detailsRef holds the latest details without being a dependency,
  // so this only re-runs on open toggle or lesson id change.
  useEffect(() => {
    if (!open || !detailsRef.current) return;

    setSelectedTeacherId(detailsRef.current.schedule.teacherId);
    setDuration(detailsRef.current.schedule.duration || "");
    setSelectedDate(new Date());
    setRescheduleDate(null);
    setShowAllModal(false);
    setGoToDateOpen(false);
  }, [open, details?.id]);

  // Load schedule when modal opens or date/teacher changes
  useEffect(() => {
    if (!open) return;
    const teacherIdToUse = selectedTeacherId || details?.schedule.teacherId || 1;
    fetchSchedule(selectedDate, teacherIdToUse);
  }, [open, selectedDate, selectedTeacherId, details?.schedule.teacherId, fetchSchedule]);

  const mondayDate = useMemo(() => getMonday(selectedDate), [selectedDate, getMonday]);

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    if (!scheduleData) return [];
    const lessons = convertLessonsToEvents(scheduleData.lessons, mondayDate);

    if (rescheduleDate && details && duration && selectedTeacherId) {
      const { hours, minutes } = parseDuration(duration);

      const startHours = rescheduleDate.getHours();
      const startMinutes = rescheduleDate.getMinutes();
      const startSeconds = rescheduleDate.getSeconds();

      const endTime = new Date(rescheduleDate);
      endTime.setHours(endTime.getHours() + hours);
      endTime.setMinutes(endTime.getMinutes() + minutes);

      const dayOfWeek = rescheduleDate.getDay();
      const resourceId = dayOfWeek === 0 ? 7 : dayOfWeek;

      const previewStart = new Date(mondayDate);
      previewStart.setHours(startHours, startMinutes, startSeconds, 0);

      const previewEnd = new Date(mondayDate);
      previewEnd.setHours(endTime.getHours(), endTime.getMinutes(), endTime.getSeconds(), 0);

      const previewEvent: CalendarEvent = {
        id: "preview-reschedule",
        title: details.student || "Rescheduled Lesson",
        start: previewStart,
        end: previewEnd,
        resourceId,
        backgroundColor: "#3d85c6",
        borderColor: "#3d85c6",
        className: "lesson-rescheduled-preview",
        extendedProps: { lessonId: "preview" },
      };

      return [...lessons, previewEvent];
    }

    return lessons;
  }, [
    scheduleData,
    convertLessonsToEvents,
    mondayDate,
    rescheduleDate,
    details,
    duration,
    selectedTeacherId,
  ]);

  const calendarAvailability = useMemo(() => {
    if (!scheduleData) return [];
    return convertAvailabilityToBackground(scheduleData.availability || [], mondayDate);
  }, [scheduleData, convertAvailabilityToBackground, mondayDate]);

  const timeRange = useMemo(() => {
    if (scheduleData?.time) {
      return { minTime: scheduleData.time.from, maxTime: scheduleData.time.to };
    }
    return { minTime: "08:00:00", maxTime: "23:30:00" };
  }, [scheduleData]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
      if (!selectedTeacherId) {
        toast.error("Please select a teacher first");
        return;
      }

      const resourceId =
        typeof slotInfo.resourceId === "string"
          ? parseInt(slotInfo.resourceId)
          : slotInfo.resourceId || 1;

      const selectedHours = slotInfo.start.getHours();
      const selectedMinutes = slotInfo.start.getMinutes();
      const selectedSeconds = slotInfo.start.getSeconds();

      const selectedDayDate = new Date(mondayDate);
      selectedDayDate.setDate(mondayDate.getDate() + (resourceId - 1));
      selectedDayDate.setHours(selectedHours, selectedMinutes, selectedSeconds, 0);

      setRescheduleDate(selectedDayDate);
    },
    [selectedTeacherId, mondayDate]
  );

  const handleSave = useCallback(async () => {
    if (!selectedTeacherId || !rescheduleDate) {
      toast.error("Please select a teacher and reschedule date");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Lesson rescheduled successfully");
      onOpenChange(false);
    } catch {
      toast.error("Failed to reschedule lesson. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedTeacherId, rescheduleDate, onOpenChange]);

  // Build teachers list: current lesson's teacher + mock list (no duplicates)
  const teachers = useMemo(() => {
    const mockList = [...MOCK_TEACHERS];
    const currentId = details?.schedule.teacherId;
    const currentName = details?.schedule.teacher;
    if (currentId && currentName && !mockList.find((t) => t.id === currentId)) {
      mockList.unshift({ id: currentId, title: currentName });
    }
    return mockList;
  }, [details?.schedule.teacherId, details?.schedule.teacher]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] overflow-auto">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-lg font-semibold">Edit schedule</DialogTitle>

          <div className="grid grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <DurationPicker
                value={duration}
                onChange={setDuration}
                label="Duration"
                className="w-full"
              />
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
                  {teachers.map((t) => (
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
                value={details?.schedule.expiryDate ?? ""}
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
                  const teacherIdToUse = selectedTeacherId || details?.schedule.teacherId || 1;
                  fetchSchedule(selectedDate, teacherIdToUse);
                }}
              />
              <label htmlFor="show-all-modal" className="text-sm">
                Show All
              </label>
            </div>
            <div className="flex items-center justify-center">
              <div className="text-base font-semibold text-foreground text-center">
                {format(mondayDate, "dd-MMM-yyyy, EEEE")} –{" "}
                {format(addDays(mondayDate, 6), "dd-MMM-yyyy, EEEE")}
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
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !selectedTeacherId || !rescheduleDate}
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

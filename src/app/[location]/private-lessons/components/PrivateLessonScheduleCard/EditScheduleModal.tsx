"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
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
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleLessonEvent,
  type TeacherScheduleAvailabilityEvent,
} from "../../../teachers/[id]/teachers-details-tabs.api";
import { getTeacherView, getTeachersList } from "@/app/[location]/schedule/schedule.api";
import { editLessonSchedule } from "../../[id]/private-lesson-details.api";
import { extractErrorMessage, resolveMessage } from "../../utils/errorUtils";
import { toast } from "sonner";
import { PrivateLessonDetails } from "../../types";

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
  onSuccess?: () => void;
}

export function EditScheduleModal({
  open,
  onOpenChange,
  location,
  details,
  onSuccess,
}: EditScheduleModalProps) {
  const [scheduleData, setScheduleData] = useState<TeacherScheduleData | null>(null);
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [rescheduleDate, setRescheduleDate] = useState<Date | null>(null);
  const [showAllModal, setShowAllModal] = useState(false);
  const [goToDateOpen, setGoToDateOpen] = useState(false);
  const [eligibleTeachers, setEligibleTeachers] = useState<Array<{ id: number; title: string }>>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | undefined>(undefined);
  const [duration, setDuration] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
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

  const toDateString = useCallback((date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  // ─── Fetch eligible teachers by programId (or all teachers as fallback) ──────
  const fetchEligibleTeachers = useCallback(
    async (programId?: number, date?: Date) => {
      try {
        if (programId) {
          const dateStr = toDateString(date ?? new Date());
          const response = await getTeacherView(
            location,
            dateStr,
            false,
            programId.toString(),
            undefined,
            "all-teachers-by-program"
          );
          setEligibleTeachers(response?.data?.resources ?? []);
        } else {
          const response = await getTeachersList(location);
          if (response?.success && response.data) {
            setEligibleTeachers(response.data.map((t) => ({ id: t.id, title: t.name })));
          } else {
            setEligibleTeachers([]);
          }
        }
      } catch (err) {
        console.error("Error fetching eligible teachers:", err);
        setEligibleTeachers([]);
      }
    },
    [location, toDateString]
  );

  // ─── Fetch teacher schedule events ───────────────────────────────────────────
  const fetchSchedule = useCallback(
    async (baseDate: Date, teacherId: number) => {
      setScheduleLoading(true);
      setScheduleError(null);
      try {
        const result = await getTeacherScheduleEvents(location, teacherId, toDateString(baseDate));
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
    [location, toDateString]
  );

  // ─── Initialise when modal opens ─────────────────────────────────────────────
  useEffect(() => {
    if (!open || !detailsRef.current) return;

    const d = detailsRef.current;
    setSelectedTeacherId(d.schedule.teacherId);
    setDuration(d.schedule.duration || "");
    setSelectedDate(new Date());
    setRescheduleDate(null);
    setShowAllModal(false);
    setGoToDateOpen(false);

    fetchEligibleTeachers(d.programId, new Date());
  }, [open, details?.id, fetchEligibleTeachers]);

  // ─── Reload schedule when date or teacher changes ────────────────────────────
  useEffect(() => {
    if (!open) return;
    const teacherId = selectedTeacherId ?? details?.schedule.teacherId;
    if (!teacherId) return;
    fetchSchedule(selectedDate, teacherId);
  }, [open, selectedDate, selectedTeacherId, details?.schedule.teacherId, fetchSchedule]);

  const mondayDate = useMemo(() => getMonday(selectedDate), [selectedDate, getMonday]);

  // ─── Convert API lessons → CalendarEvent[] ───────────────────────────────────
  const convertLessonsToEvents = useCallback(
    (lessons: TeacherScheduleLessonEvent[], monday: Date): CalendarEvent[] =>
      lessons.map((lesson) => {
        const s = new Date(lesson.start);
        const e = new Date(lesson.end);
        const start = new Date(monday);
        start.setHours(s.getHours(), s.getMinutes(), s.getSeconds(), 0);
        const end = new Date(monday);
        end.setHours(e.getHours(), e.getMinutes(), e.getSeconds(), 0);
        return {
          id: `lesson-${lesson.lessonId}`,
          title: lesson.title,
          start,
          end,
          resourceId: lesson.resourceId,
          backgroundColor: lesson.backgroundColor,
          borderColor: lesson.backgroundColor,
          className: lesson.className,
          extendedProps: { lessonId: lesson.lessonId.toString(), url: lesson.url },
        };
      }),
    []
  );

  // ─── Convert API availability → background events ────────────────────────────
  const convertAvailabilityToBackground = useCallback(
    (availability: TeacherScheduleAvailabilityEvent[], monday: Date) =>
      availability.map((avail) => {
        const s = new Date(avail.start);
        const e = new Date(avail.end);
        const start = new Date(monday);
        start.setHours(s.getHours(), s.getMinutes(), s.getSeconds(), 0);
        const end = new Date(monday);
        end.setHours(e.getHours(), e.getMinutes(), e.getSeconds(), 0);
        return {
          resourceId: avail.resourceId,
          title: "",
          start: start.toISOString(),
          end: end.toISOString(),
          rendering: avail.rendering,
          className: avail.className,
          backgroundColor: avail.backgroundColor,
        };
      }),
    []
  );

  const calendarEvents = useMemo<CalendarEvent[]>(() => {
    if (!scheduleData) return [];
    const lessons = convertLessonsToEvents(scheduleData.lessons, mondayDate);

    if (rescheduleDate && details && duration && selectedTeacherId) {
      const { hours, minutes } = parseDuration(duration);
      const endTime = new Date(rescheduleDate);
      endTime.setHours(endTime.getHours() + hours, endTime.getMinutes() + minutes);

      const dayOfWeek = rescheduleDate.getDay();
      const resourceId = dayOfWeek === 0 ? 7 : dayOfWeek;

      const previewStart = new Date(mondayDate);
      previewStart.setHours(rescheduleDate.getHours(), rescheduleDate.getMinutes(), 0, 0);
      const previewEnd = new Date(mondayDate);
      previewEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

      const preview: CalendarEvent = {
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

      return [...lessons, preview];
    }

    return lessons;
  }, [scheduleData, convertLessonsToEvents, mondayDate, rescheduleDate, details, duration, selectedTeacherId]);

  const calendarAvailability = useMemo(
    () => convertAvailabilityToBackground(scheduleData?.availability ?? [], mondayDate),
    [scheduleData, convertAvailabilityToBackground, mondayDate]
  );

  const timeRange = useMemo(
    () =>
      scheduleData?.time
        ? { minTime: scheduleData.time.from, maxTime: scheduleData.time.to }
        : { minTime: "08:00:00", maxTime: "23:30:00" },
    [scheduleData]
  );

  // ─── Slot click → set reschedule date ────────────────────────────────────────
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
      if (!selectedTeacherId) {
        toast.error("Please select a teacher first");
        return;
      }
      const resourceId =
        typeof slotInfo.resourceId === "string"
          ? parseInt(slotInfo.resourceId)
          : slotInfo.resourceId ?? 1;

      const day = new Date(mondayDate);
      day.setDate(mondayDate.getDate() + (resourceId - 1));
      day.setHours(slotInfo.start.getHours(), slotInfo.start.getMinutes(), 0, 0);
      setRescheduleDate(day);
    },
    [selectedTeacherId, mondayDate]
  );

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!details?.id || !selectedTeacherId || !rescheduleDate || !duration) {
      toast.error("Please select a teacher and reschedule date");
      return;
    }

    // Format date: "YYYY-MM-DD hh:mm a" → e.g. "2025-02-27 07:00 AM"
    const dateForApi = format(rescheduleDate, "yyyy-MM-dd hh:mm a");

    // Format duration: DurationPicker gives "HH:mm", API expects "HH:MM:SS"
    const durationParts = duration.split(":");
    const durationForApi = durationParts.length === 2 ? `${duration}:00` : duration;

    setIsSubmitting(true);
    try {
      const result = await editLessonSchedule(location, details.id, {
        date: dateForApi,
        duration: durationForApi,
      });
      toast.success(resolveMessage(result.message, "Lesson rescheduled successfully"));
      onOpenChange(false);
      onSuccess?.();

      // Redirect using the lesson ID from the response URL.
      // Response URL format: "admin/v2/{location}/private-lesson/{lessonId}"
      const lessonId = result.data?.url?.split("/").pop();
      if (lessonId) {
        router.push(`/${location}/private-lessons/${lessonId}`);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error, "Failed to reschedule lesson. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  }, [details?.id, selectedTeacherId, rescheduleDate, duration, location, router, onOpenChange, onSuccess]);

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
              <Input value={details?.schedule.expiryDate ?? ""} readOnly className="h-10" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all-modal"
                checked={showAllModal}
                onCheckedChange={(checked) => {
                  setShowAllModal(Boolean(checked));
                  const teacherId = selectedTeacherId ?? details?.schedule.teacherId;
                  if (teacherId) fetchSchedule(selectedDate, teacherId);
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
            <div className="flex flex-col items-end gap-1">
              <div className="text-xs text-muted-foreground font-semibold">Go to Date</div>
              <Popover open={goToDateOpen} onOpenChange={setGoToDateOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 w-full justify-start font-normal">
                    {format(selectedDate, "MMM dd, yyyy")}
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
              onNavigate={(newDate) => setSelectedDate(getMonday(newDate))}
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
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

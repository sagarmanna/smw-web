"use client";

import { useState, useEffect, useMemo } from "react";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import {
  getTeacherScheduleEvents,
  type TeacherScheduleData,
  type TeacherScheduleLessonEvent,
  type TeacherScheduleAvailabilityEvent,
} from "../../../../[id]/teachers-details-tabs.api";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleTabProps {
  location: string;
  teacherId: number;
}

// Day resources (Monday-Sunday)
const DAY_RESOURCES = [
  { id: 1, title: "Monday" },
  { id: 2, title: "Tuesday" },
  { id: 3, title: "Wednesday" },
  { id: 4, title: "Thursday" },
  { id: 5, title: "Friday" },
  { id: 6, title: "Saturday" },
  { id: 7, title: "Sunday" },
];

/**
 * Convert lesson events to calendar events format
 * Note: API now returns resourceId as day of week (1-7) for teacher schedule view
 * Simple approach: Always set event date to Monday of the week, keep the time
 * Events will show in correct column based on resourceId
 */
function convertLessonsToCalendarEvents(
  lessons: TeacherScheduleLessonEvent[],
  mondayDate: Date // Monday of the visible week
): CalendarEvent[] {
  return lessons.map((lesson) => {
    // Parse original date to extract time only
    const originalStart = new Date(lesson.start);
    const originalEnd = new Date(lesson.end);
    
    // Extract time components
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
    
    // API now returns resourceId as day of week (1-7), use it directly
    const resourceId = lesson.resourceId; // Should be 1-7 (Monday-Sunday)
    
    // Convert isOnline from number to boolean if needed
    const isOnline = typeof lesson.isOnline === 'number' 
      ? lesson.isOnline === 1 
      : lesson.isOnline;

    return {
      id: `lesson-${lesson.lessonId}`,
      title: lesson.title,
      start: eventStart,
      end: eventEnd,
      resourceId, // Use resourceId directly from API (day of week 1-7)
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
}


export function ScheduleTab({ location, teacherId }: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerDisplayDate, setDatePickerDisplayDate] = useState<Date>(new Date()); // Date to show in picker (user's actual selection)
  const [scheduleData, setScheduleData] = useState<TeacherScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isSyncingDate, setIsSyncingDate] = useState<boolean>(false);
  const [datePickerOpen, setDatePickerOpen] = useState<boolean>(false);

  // Load data on mount and when teacherId or date changes
  useEffect(() => {
    if (!isSyncingDate) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, location, selectedDate, showAll]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Format date as YYYY-MM-DD using local timezone (not UTC)
      // This prevents timezone shifts that could change the date
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      console.log('[ScheduleTab] Loading data with date:', dateString, 'from selectedDate:', selectedDate.toISOString());
      const data = await getTeacherScheduleEvents(location, teacherId, dateString, showAll);
      
      if (!data) {
        throw new Error("Failed to load schedule data");
      }
      
      // Sync calendar date to the Monday of the week from API response
      // React-big-calendar with Views.DAY and resources shows a week view
      // The date prop should be set to Monday of that week for events to be visible
      if (data.date?.from && !isSyncingDate) {
        // Parse the API week start date (should be Monday) - use new Date() like schedule page
        const apiWeekStart = new Date(data.date.from + 'T00:00:00');
        
        // Get Monday of current selectedDate's week
        const currentDate = new Date(selectedDate);
        const currentDay = currentDate.getDay(); // 0-6 (Sunday-Saturday)
        const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay; // Convert to Monday
        const currentWeekStart = new Date(currentDate);
        currentWeekStart.setDate(currentDate.getDate() + daysToMonday);
        currentWeekStart.setHours(0, 0, 0, 0);
        apiWeekStart.setHours(0, 0, 0, 0);
        
        // If weeks don't match (more than 12 hours difference), update to API week Monday
        if (Math.abs(apiWeekStart.getTime() - currentWeekStart.getTime()) > 12 * 60 * 60 * 1000) {
          console.log('[ScheduleTab] Syncing date to API week:', apiWeekStart.toISOString());
          setIsSyncingDate(true);
          setSelectedDate(apiWeekStart);
          // ScheduleData will be set on next load
          setIsLoading(false);
          return;
        }
      }
      
      console.log('[ScheduleTab] Setting schedule data');
      setScheduleData(data);
      setIsSyncingDate(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load schedule data";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSyncingDate(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Monday of the week for the calendar date
  // React-big-calendar with Views.DAY and resources shows a week view
  // The date prop should always be Monday of that week
  const calendarDate = useMemo(() => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay(); // 0-6 (Sunday-Saturday)
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Convert to Monday
    const monday = new Date(date);
    monday.setDate(date.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [selectedDate]);

  // Convert schedule data to calendar events
  // Note: Availability is passed separately as a prop, not mixed with events
  const calendarEvents = useMemo(() => {
    if (!scheduleData) {
      return [];
    }

    // Always use Monday date for all events, keep the time
    const lessonEvents = convertLessonsToCalendarEvents(scheduleData.lessons, calendarDate);
    
    // Availability is passed separately as a prop to ReactBigCalendarWrapper
    // It's used by slotPropGetter to color time slots, not as events

    return lessonEvents;
  }, [scheduleData, calendarDate]);

  // Handle event click (navigate to lesson or show info)
  const handleEventClick = (event: CalendarEvent) => {
    const url = event.extendedProps?.url as string | undefined;
    const lessonId = event.extendedProps?.lessonId;
    const title = event.title;

    // If URL is available, navigate to lesson (similar to ScheduleClient)
    if (url) {
      // Uncomment to enable navigation:
      window.open(url, '_self');
    } 
  };

  // Handle bulk reschedule (placeholder)
  const handleBulkReschedule = () => {
    toast.info("Bulk reschedule feature coming soon");
  };

  // Get time range from schedule data
  const timeRange = useMemo(() => {
    if (!scheduleData) {
      return { minTime: "08:00:00", maxTime: "20:00:00" };
    }
    return {
      minTime: scheduleData.time.from,
      maxTime: scheduleData.time.to,
    };
  }, [scheduleData]);

  // Format week range for display
  const weekRangeDisplay = useMemo(() => {
    if (!scheduleData?.date) return "";
    const startDate = new Date(scheduleData.date.from);
    const endDate = new Date(scheduleData.date.to);
    const startFormatted = format(startDate, "dd-MMM-yyyy, EEEE");
    const endFormatted = format(endDate, "dd-MMM-yyyy, EEEE");
    return `${startFormatted} – ${endFormatted}`;
  }, [scheduleData]);

  // Handle date picker selection
  const handleDateSelect = (newDate: Date) => {
    // Reset syncing flag to allow API call
    setIsSyncingDate(false);
    
    // Store the actual selected date for display in the picker
    setDatePickerDisplayDate(newDate);
    
    // Set to Monday of the selected week for calendar display
    const dayOfWeek = newDate.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(newDate);
    monday.setDate(newDate.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    
    // Update selected date (Monday) - this will trigger useEffect to call API
    setSelectedDate(monday);
    setDatePickerOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <LoadingAnimation size="lg" text="Loading schedule calendar..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <p className="text-red-600 mb-2">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded"
            />
            <span>Show All Hours</span>
          </label>
          {weekRangeDisplay && (
            <p className="text-sm text-muted-foreground">
              {weekRangeDisplay}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "w-[140px] justify-start text-left font-normal",
                  !datePickerDisplayDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {datePickerDisplayDate ? format(datePickerDisplayDate, "MMM dd, yyyy") : "Go to Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={datePickerDisplayDate}
                defaultMonth={datePickerDisplayDate}
                onSelect={(date) => {
                  if (date) {
                    handleDateSelect(date);
                  }
                }}
                captionLayout="dropdown"
                fromYear={2005}
                toYear={2125}
              />
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleBulkReschedule}
            variant="default"
            size="sm"
          >
            Bulk Reschedule
          </Button>
        </div>
      </div>

       <div className="border rounded-lg overflow-hidden">
         <ReactBigCalendarWrapper
           events={calendarEvents}
           resources={DAY_RESOURCES}
          date={calendarDate}
          onNavigate={(newDate) => {
            // When user navigates, ensure we set to Monday of that week
            const dayOfWeek = newDate.getDay();
            const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(newDate);
            monday.setDate(newDate.getDate() + daysToMonday);
            monday.setHours(0, 0, 0, 0);
            setSelectedDate(monday);
          }}
          onEventClick={handleEventClick}
          editable={false}
          minTime={timeRange.minTime}
          maxTime={timeRange.maxTime}
           availability={scheduleData?.availability.map(avail => {
             // Parse original availability time
             const originalStart = new Date(avail.start);
             const originalEnd = new Date(avail.end);
             
             // Extract time components
             const startHours = originalStart.getHours();
             const startMinutes = originalStart.getMinutes();
             const startSeconds = originalStart.getSeconds();
             const endHours = originalEnd.getHours();
             const endMinutes = originalEnd.getMinutes();
             const endSeconds = originalEnd.getSeconds();
             
             // Always use Monday date, but keep the time
             const availStart = new Date(calendarDate);
             availStart.setHours(startHours, startMinutes, startSeconds, 0);
             
             const availEnd = new Date(calendarDate);
             availEnd.setHours(endHours, endMinutes, endSeconds, 0);
             
             return {
               resourceId: avail.resourceId,
               title: "", // Availability doesn't need title
               start: availStart.toISOString(), // Convert to ISO string for slotPropGetter
               end: availEnd.toISOString(), // Convert to ISO string for slotPropGetter
               rendering: avail.rendering,
               className: avail.className,
             };
           }) || []}
          viewType="teacher"
          height="600px"
        />
      </div>
    </div>
  );
}


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
 * Get day of week (1-7, Monday-Sunday) from a date
 */
function getDayOfWeek(date: Date): number {
  const day = date.getDay(); // 0-6 (Sunday-Saturday)
  return day === 0 ? 7 : day; // Convert to 1-7 (Monday-Sunday)
}

/**
 * Convert lesson events to calendar events format
 * Note: API returns resourceId as teacherId, but we need day of week (1-7) for the calendar
 */
function convertLessonsToCalendarEvents(
  lessons: TeacherScheduleLessonEvent[]
): CalendarEvent[] {
  return lessons.map((lesson) => {
    const startDate = new Date(lesson.start);
    const endDate = new Date(lesson.end);
    const dayOfWeek = getDayOfWeek(startDate);
    
    // Convert isOnline from number to boolean if needed
    const isOnline = typeof lesson.isOnline === 'number' 
      ? lesson.isOnline === 1 
      : lesson.isOnline;

    return {
      id: `lesson-${lesson.lessonId}`,
      title: lesson.title,
      start: startDate,
      end: endDate,
      resourceId: dayOfWeek, // Use day of week (1-7) instead of teacherId
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

/**
 * Convert availability events to calendar events format (background)
 * Note: API returns resourceId as teacherId, but we need day of week (1-7) for the calendar
 */
function convertAvailabilityToCalendarEvents(
  availability: TeacherScheduleAvailabilityEvent[]
): CalendarEvent[] {
  return availability.map((avail, index) => {
    const startDate = new Date(avail.start);
    const dayOfWeek = getDayOfWeek(startDate);
    
    return {
      id: `availability-${dayOfWeek}-${index}`,
      title: "",
      start: startDate,
      end: new Date(avail.end),
      resourceId: dayOfWeek, // Use day of week (1-7) instead of teacherId
      backgroundColor: avail.backgroundColor,
      borderColor: avail.backgroundColor,
      className: avail.className,
      extendedProps: {
        // Availability events are background only, no lesson-specific props needed
      },
    };
  });
}

export function ScheduleTab({ location, teacherId }: ScheduleTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [scheduleData, setScheduleData] = useState<TeacherScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [isSyncingDate, setIsSyncingDate] = useState<boolean>(false);

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
      const dateString = selectedDate.toISOString().split("T")[0];
      const data = await getTeacherScheduleEvents(location, teacherId, dateString, showAll);
      
      if (!data) {
        throw new Error("Failed to load schedule data");
      }
      
      // Sync calendar date to the week from API response
      // This ensures events are visible (react-big-calendar filters by visible week)
      if (data.time?.from && !isSyncingDate) {
        const apiWeekStart = new Date(data.time.from + 'T00:00:00');
        // Get Monday of current selectedDate's week
        const currentDate = new Date(selectedDate);
        const currentDay = currentDate.getDay();
        const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const currentWeekStart = new Date(currentDate);
        currentWeekStart.setDate(currentDate.getDate() + daysToMonday);
        currentWeekStart.setHours(0, 0, 0, 0);
        apiWeekStart.setHours(0, 0, 0, 0);
        
        // If weeks don't match, update to API week
        if (Math.abs(apiWeekStart.getTime() - currentWeekStart.getTime()) > 12 * 60 * 60 * 1000) {
          setIsSyncingDate(true);
          setSelectedDate(apiWeekStart);
          // ScheduleData will be set on next load
          setIsLoading(false);
          return;
        }
      }
      
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

  // Convert schedule data to calendar events
  const calendarEvents = useMemo(() => {
    if (!scheduleData) return [];

    const lessonEvents = convertLessonsToCalendarEvents(scheduleData.lessons);
    const availabilityEvents = convertAvailabilityToCalendarEvents(scheduleData.availability);

    // Combine availability events (background) first, then lesson events (on top)
    return [...availabilityEvents, ...lessonEvents];
  }, [scheduleData]);

  // Handle event click (navigate to lesson or show info)
  const handleEventClick = (event: CalendarEvent) => {
    const url = event.extendedProps?.url as string | undefined;
    const lessonId = event.extendedProps?.lessonId;
    const title = event.title;

    // If URL is available, navigate to lesson (similar to ScheduleClient)
    if (url) {
      // For legacy URLs, we might need to handle them differently
      // For now, show info and log the URL
      console.log('Lesson URL:', url);
      toast.info(`Opening lesson: ${title}`, {
        duration: 2000,
      });
      // Uncomment to enable navigation:
      // window.open(url, '_self');
    } else {
      // Show lesson info if no URL
      const info = [
        `Lesson: ${title}`,
        lessonId ? `ID: ${lessonId}` : '',
      ].filter(Boolean).join(' | ');

      toast.info(info, {
        duration: 3000,
      });
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
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          View teacher schedule with lessons and availability for the week. Click on lessons to view details.
        </p>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showAll}
              onChange={(e) => setShowAll(e.target.checked)}
              className="rounded"
            />
            <span>Show All Hours</span>
          </label>
          <Button
            onClick={handleBulkReschedule}
            variant="default"
            size="sm"
            className="ml-auto"
          >
            Bulk Reschedule
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ReactBigCalendarWrapper
          events={calendarEvents}
          resources={DAY_RESOURCES}
          date={selectedDate}
          onNavigate={setSelectedDate}
          onEventClick={handleEventClick}
          editable={false}
          minTime={timeRange.minTime}
          maxTime={timeRange.maxTime}
          viewType="teacher"
          height="600px"
        />
      </div>
    </div>
  );
}


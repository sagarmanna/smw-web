"use client";

import { useState, useEffect, useMemo } from "react";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import { AvailabilityFormModal } from "../../../modals/AvailabilityFormModal";
import {
  getTeacherAvailability,
  type TeacherScheduleData,
  type TeacherScheduleLessonEvent,
} from "../../../../[id]/teachers-details-tabs.api";
import { getClassroomViewResources } from "@/app/[location]/schedule/schedule.api";
import type { Classroom } from "../../../../[id]/mockAvailabilityData";
import { deleteTeacherAvailability } from "@/lib/api/legacyApiAdapter";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { modifyTeacherAvailability } from "@/app/[location]/teachers/[id]/teachers-details.api";

interface AvailabilityCalendarTabProps {
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
 * Note: API returns resourceId as day of week (1-7) for teacher availability view
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
    
    // API returns resourceId as day of week (1-7), use it directly
    const resourceId = lesson.resourceId; // Should be 1-7 (Monday-Sunday)

    return {
      id: `availability-${lesson.lessonId}`,
      title: lesson.title,
      start: eventStart,
      end: eventEnd,
      resourceId, // Use resourceId directly from API (day of week 1-7)
      backgroundColor: lesson.backgroundColor,
      borderColor: lesson.backgroundColor,
      className: lesson.className,
      extendedProps: {
        availabilityId: lesson.lessonId.toString(), // Use lessonId as availabilityId
        lessonId: lesson.lessonId.toString(),
        tooltip: lesson.title,
      },
    };
  });
}

/**
 * Format time from Date to HH:mm:ss string
 */
function formatTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
}

export function AvailabilityCalendarTab({
  location,
  teacherId,
}: AvailabilityCalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilityData, setAvailabilityData] = useState<TeacherScheduleData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSyncingDate, setIsSyncingDate] = useState<boolean>(false);

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingAvailability, setEditingAvailability] = useState<TeacherScheduleLessonEvent | null>(null);
  const [modalInitialData, setModalInitialData] = useState<{
    day?: number;
    fromTime?: string;
    toTime?: string;
    classroomId?: number;
    id?: string;
  } | null>(null);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);

  // Load data on mount and when teacherId or date changes
  useEffect(() => {
    if (!isSyncingDate) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, location, selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Format date as YYYY-MM-DD using local timezone (not UTC)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      const data = await getTeacherAvailability(location, teacherId, dateString);
      
      if (!data) {
        throw new Error("Failed to load availability data");
      }
      
      // Sync calendar date to the Monday of the week from API response
      if (data.date?.from && !isSyncingDate) {
        const apiWeekStart = new Date(data.date.from + 'T00:00:00');
        
        const currentDate = new Date(selectedDate);
        const currentDay = currentDate.getDay();
        const daysToMonday = currentDay === 0 ? -6 : 1 - currentDay;
        const currentWeekStart = new Date(currentDate);
        currentWeekStart.setDate(currentDate.getDate() + daysToMonday);
        currentWeekStart.setHours(0, 0, 0, 0);
        apiWeekStart.setHours(0, 0, 0, 0);
        
        if (Math.abs(apiWeekStart.getTime() - currentWeekStart.getTime()) > 12 * 60 * 60 * 1000) {
          setIsSyncingDate(true);
          setSelectedDate(apiWeekStart);
          setIsLoading(false);
          return;
        }
      }
      
      setAvailabilityData(data);
      setIsSyncingDate(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load availability data";
      setError(errorMessage);
      toast.error(errorMessage);
      setIsSyncingDate(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate Monday of the week for the calendar date
  const calendarDate = useMemo(() => {
    const date = new Date(selectedDate);
    const dayOfWeek = date.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(date);
    monday.setDate(date.getDate() + daysToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }, [selectedDate]);

  // Convert availability data to calendar events
  const calendarEvents = useMemo(() => {
    if (!availabilityData) {
      return [];
    }

    const lessonEvents = convertLessonsToCalendarEvents(availabilityData.lessons, calendarDate);
    return lessonEvents;
  }, [availabilityData, calendarDate]);

  // Load classrooms from API
  const loadClassrooms = async () => {
    if (classrooms.length > 0) return; // Already loaded
    
    try {
      const response = await getClassroomViewResources(location);
      if (response?.success && response.data?.resources) {
        // Map ClassroomViewResource to Classroom format
        const mappedClassrooms: Classroom[] = response.data.resources.map((resource) => ({
          id: resource.id,
          name: resource.title,
        }));
        setClassrooms(mappedClassrooms);
      }
    } catch (error) {
      console.error("Error loading classrooms:", error);
      toast.error("Failed to load classrooms");
    }
  };

  // Handle slot selection (create new availability)
  const handleSelectSlot = async (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
    const day = typeof slotInfo.resourceId === "string" 
      ? parseInt(slotInfo.resourceId) 
      : slotInfo.resourceId || 1;
    
    const fromTime = formatTimeFromDate(slotInfo.start);
    const toTime = formatTimeFromDate(slotInfo.end);

    // Load classrooms before opening modal
    await loadClassrooms();

    setModalMode("add");
    setEditingAvailability(null);
    setModalInitialData({
      day,
      fromTime,
      toTime,
    });
    setShowModal(true);
  };

  // Handle event click (edit existing availability)
  const handleEventClick = async (event: CalendarEvent) => {
    const availabilityId = event.extendedProps?.availabilityId as string | undefined;
    if (!availabilityId || !availabilityData) return;

    const existingLesson = availabilityData.lessons.find(
      (l) => l.lessonId.toString() === availabilityId
    );
    if (!existingLesson) return;

    // Load classrooms before opening modal
    await loadClassrooms();

    setModalMode("edit");
    setEditingAvailability(existingLesson);
    
    // Extract day from resourceId
    const day = existingLesson.resourceId;
    
    // Extract time from start/end strings
    const startTime = new Date(existingLesson.start);
    const endTime = new Date(existingLesson.end);
    const fromTime = formatTimeFromDate(startTime);
    const toTime = formatTimeFromDate(endTime);

    // Extract classroomId if available (from title or other field)
    // Note: The API might not return classroomId directly, so we'll need to check
    // For now, we'll try to match by title if needed
    const classroomId = undefined; // TODO: Extract from existingLesson if available

    setModalInitialData({
      id: availabilityId,
      day,
      fromTime,
      toTime,
      classroomId,
    });
    setShowModal(true);
  };

  // Handle event resize (open edit modal with new time)
  const handleEventResize = async (event: CalendarEvent) => {
    const availabilityId = event.extendedProps?.availabilityId as string | undefined;
    if (!availabilityId || !availabilityData) return;

    const existingLesson = availabilityData.lessons.find(
      (l) => l.lessonId.toString() === availabilityId
    );
    if (!existingLesson) return;

    await loadClassrooms();

    const day = typeof event.resourceId === "string"
      ? parseInt(event.resourceId)
      : event.resourceId || 1;

    const fromTime = formatTimeFromDate(event.start);
    const toTime = formatTimeFromDate(event.end);

    setModalMode("edit");
    setEditingAvailability(existingLesson);
    setModalInitialData({
      id: availabilityId,
      day,
      fromTime,
      toTime,
      classroomId: event.extendedProps?.classroomId
        ? Number(event.extendedProps.classroomId)
        : undefined,
    });
    setShowModal(true);
  };

  // Handle event drop (drag to move/change day/time) - open edit modal with new values
  const handleEventDrop = async (event: CalendarEvent) => {
    const availabilityId = event.extendedProps?.availabilityId as string | undefined;
    if (!availabilityId || !availabilityData) return;

    const existingLesson = availabilityData.lessons.find(
      (l) => l.lessonId.toString() === availabilityId
    );
    if (!existingLesson) return;

    await loadClassrooms();

    const day = typeof event.resourceId === "string"
      ? parseInt(event.resourceId)
      : event.resourceId || 1;

    const fromTime = formatTimeFromDate(event.start);
    const toTime = formatTimeFromDate(event.end);

    setModalMode("edit");
    setEditingAvailability(existingLesson);
    setModalInitialData({
      id: availabilityId,
      day,
      fromTime,
      toTime,
      classroomId: event.extendedProps?.classroomId
        ? Number(event.extendedProps.classroomId)
        : undefined,
    });
    setShowModal(true);
  };

  // Handle form submit (create or update)
  const handleFormSubmit = async (formData: {
    day: number;
    fromTime: string; // Format: "HH:mm:ss"
    toTime: string; // Format: "HH:mm:ss"
    classroomId?: number;
  }): Promise<{ success: boolean; errors?: Record<string, string[]> }> => {
    try {
      // Determine availability ID (0 for create, actual ID for update)
      const availabilityId = modalMode === "edit" && editingAvailability 
        ? editingAvailability.lessonId 
        : 0;

      // Call new API to modify teacher availability
      const response = await modifyTeacherAvailability(
        location,
        teacherId,
        availabilityId,
        {
          day: formData.day,
          fromTime: formData.fromTime,
          toTime: formData.toTime,
          classroomId: formData.classroomId,
        }
      );

      if (response && response.success) {
        toast.success(
          modalMode === "edit" 
            ? "Availability updated successfully" 
            : "Availability created successfully"
        );
        await loadData();
        return { success: true };
      } else {
        // Show error message in toast
        const errorMessage = response?.message || "Failed to modify teacher availability";
        toast.error(errorMessage);
        return { success: false, errors: { _general: [errorMessage] } };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save availability";
      toast.error(errorMessage);
      return { success: false };
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      if (!availabilityData) {
        throw new Error("Availability data not loaded");
      }

      // Find the availability to get its data
      const existingLesson = availabilityData.lessons.find(
        (l) => l.lessonId.toString() === id
      );
      
      if (!existingLesson) {
        throw new Error("Availability not found");
      }

      // Extract day and times from the existing lesson
      const day = existingLesson.resourceId;
      const startTime = new Date(existingLesson.start);
      const endTime = new Date(existingLesson.end);
      const fromTime = formatTimeFromDate(startTime);
      const toTime = formatTimeFromDate(endTime);

      // Call legacy API to delete teacher availability
      const response = await deleteTeacherAvailability(
        location,
        parseInt(id),
        {
          day,
          fromTime,
          toTime,
          // classroomId is optional and may not be available
        }
      );

      if (response.status) {
        toast.success("Availability deleted successfully");
        await loadData();
        setShowModal(false);
      } else {
        throw new Error(response.message || "Failed to delete availability");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete availability";
      toast.error(errorMessage);
    }
  };

  // Get time range from availability data
  const timeRange = useMemo(() => {
    if (!availabilityData) {
      return { minTime: "08:00:00", maxTime: "20:00:00" };
    }
    return {
      minTime: availabilityData.time.from,
      maxTime: availabilityData.time.to,
    };
  }, [availabilityData]);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <LoadingAnimation size="lg" text="Loading availability calendar..." />
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
      {/* <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
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
        </div>
      </div> */}

      {/* <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Click on the calendar to add availability. Click on existing availability to edit or delete.
        </p>
      </div> */}

      <div className="border rounded-lg overflow-hidden">
        <ReactBigCalendarWrapper
          events={calendarEvents}
          resources={DAY_RESOURCES}
          date={calendarDate}
          onNavigate={(newDate) => {
            const dayOfWeek = newDate.getDay();
            const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(newDate);
            monday.setDate(newDate.getDate() + daysToMonday);
            monday.setHours(0, 0, 0, 0);
            setSelectedDate(monday);
          }}
          onEventClick={handleEventClick}
          onEventResize={handleEventResize}
          onEventDrop={handleEventDrop}
          onSelectSlot={handleSelectSlot}
          editable={true}
          minTime={timeRange.minTime}
          maxTime={timeRange.maxTime}
          availability={availabilityData?.availability.map(avail => {
            const originalStart = new Date(avail.start);
            const originalEnd = new Date(avail.end);
            
            const startHours = originalStart.getHours();
            const startMinutes = originalStart.getMinutes();
            const startSeconds = originalStart.getSeconds();
            const endHours = originalEnd.getHours();
            const endMinutes = originalEnd.getMinutes();
            const endSeconds = originalEnd.getSeconds();
            
            const availStart = new Date(calendarDate);
            availStart.setHours(startHours, startMinutes, startSeconds, 0);
            
            const availEnd = new Date(calendarDate);
            availEnd.setHours(endHours, endMinutes, endSeconds, 0);
            
            return {
              resourceId: avail.resourceId,
              title: "",
              start: availStart.toISOString(),
              end: availEnd.toISOString(),
              rendering: avail.rendering,
              className: avail.className,
            };
          }) || []}
          viewType="availability"
          height="600px"
        />
      </div>

      {/* Availability Form Modal */}
      <AvailabilityFormModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setModalInitialData(null);
          setEditingAvailability(null);
        }}
        onSubmit={handleFormSubmit}
        onDelete={handleDelete}
        initialData={modalInitialData}
        classrooms={classrooms}
        mode={modalMode}
        existingAvailabilities={[]} // TODO: Convert lessons to old format if needed
      />
    </div>
  );
}

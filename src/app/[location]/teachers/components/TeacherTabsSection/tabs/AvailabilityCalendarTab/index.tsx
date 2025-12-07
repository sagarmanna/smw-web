"use client";

import { useState, useEffect, useMemo } from "react";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import { AvailabilityFormModal } from "../../../modals/AvailabilityFormModal";
import {
  mockGetAvailability,
  mockCreateAvailability,
  mockUpdateAvailability,
  mockDeleteAvailability,
  mockGetClassrooms,
  mockGetLocationHours,
  type AvailabilityEvent,
  type AvailabilityFormData,
  type Classroom,
  type LocationHours,
} from "../../../../[id]/mockAvailabilityData";
import { toast } from "sonner";
import { LoadingAnimation } from "@/components/LoadingAnimation";

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
 * Get the date for a specific day of week in the current week
 */
function getDateForDay(baseDate: Date, dayOfWeek: number): Date {
  const date = new Date(baseDate);
  const currentDay = date.getDay(); // 0-6 (Sunday-Saturday)
  // Convert to Monday=1, Sunday=7
  const currentDayAdjusted = currentDay === 0 ? 7 : currentDay;
  const diff = dayOfWeek - currentDayAdjusted;
  date.setDate(date.getDate() + diff);
  return date;
}

/**
 * Combine date and time string (HH:mm:ss) into a Date object
 */
function combineDateAndTime(date: Date, timeString: string): Date {
  const [hours, minutes, seconds] = timeString.split(":").map(Number);
  const newDate = new Date(date);
  newDate.setHours(hours, minutes, seconds || 0, 0);
  return newDate;
}

/**
 * Format time from Date to HH:mm:ss string
 */
function formatTimeFromDate(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}:00`;
}

/**
 * Convert availability events to calendar events format
 */
function convertToCalendarEvents(
  availability: AvailabilityEvent[],
  selectedDate: Date
): CalendarEvent[] {
  return availability.map((avail) => {
    // Get the date for this week's day
    const eventDate = getDateForDay(selectedDate, avail.day);
    const start = combineDateAndTime(eventDate, avail.fromTime);
    const end = combineDateAndTime(eventDate, avail.toTime);

    return {
      id: avail.id,
      title: avail.classroomName || "Available",
      start,
      end,
      resourceId: avail.day,
      backgroundColor: "#97ef83", // Green like legacy
      borderColor: "#97ef83",
      className: "availability-event",
      extendedProps: {
        availabilityId: avail.id,
        classroomId: avail.classroomId,
        classroomName: avail.classroomName,
      },
    };
  });
}

export function AvailabilityCalendarTab({
  location,
  teacherId,
}: AvailabilityCalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availabilityEvents, setAvailabilityEvents] = useState<AvailabilityEvent[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [locationHours, setLocationHours] = useState<LocationHours | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingAvailability, setEditingAvailability] = useState<AvailabilityEvent | null>(null);
  const [modalInitialData, setModalInitialData] = useState<{
    day?: number;
    fromTime?: string;
    toTime?: string;
    classroomId?: number;
    id?: string;
  } | null>(null);

  // Load data on mount and when teacherId changes
  useEffect(() => {
    loadData();
  }, [teacherId, location]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all data in parallel
      const [availability, classroomsData, hours] = await Promise.all([
        mockGetAvailability(teacherId),
        mockGetClassrooms(location),
        mockGetLocationHours(location),
      ]);

      setAvailabilityEvents(availability);
      setClassrooms(classroomsData);
      setLocationHours(hours);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load availability data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert availability to calendar events
  const calendarEvents = useMemo(() => {
    return convertToCalendarEvents(availabilityEvents, selectedDate);
  }, [availabilityEvents, selectedDate]);

  // Handle slot selection (create new availability)
  const handleSelectSlot = (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
    const day = typeof slotInfo.resourceId === "string" 
      ? parseInt(slotInfo.resourceId) 
      : slotInfo.resourceId || 1;
    
    const fromTime = formatTimeFromDate(slotInfo.start);
    const toTime = formatTimeFromDate(slotInfo.end);

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
  const handleEventClick = (event: CalendarEvent) => {
    const availabilityId = event.extendedProps?.availabilityId as string | undefined;
    if (!availabilityId) return;

    const existingEvent = availabilityEvents.find((a) => a.id === availabilityId);
    if (!existingEvent) return;

    setModalMode("edit");
    setEditingAvailability(existingEvent);
    setModalInitialData({
      id: existingEvent.id,
      day: existingEvent.day,
      fromTime: existingEvent.fromTime,
      toTime: existingEvent.toTime,
      classroomId: existingEvent.classroomId,
    });
    setShowModal(true);
  };

  // Handle event resize (update time)
  const handleEventResize = async (event: CalendarEvent) => {
    const availabilityId = event.extendedProps?.availabilityId as string | undefined;
    if (!availabilityId) return;

    const existingEvent = availabilityEvents.find((a) => a.id === availabilityId);
    if (!existingEvent) return;

    const fromTime = formatTimeFromDate(event.start);
    const toTime = formatTimeFromDate(event.end);

    try {
      await mockUpdateAvailability(teacherId, availabilityId, {
        day: existingEvent.day,
        fromTime,
        toTime,
        classroomId: existingEvent.classroomId,
      });

      toast.success("Availability time updated successfully");
      await loadData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update availability";
      toast.error(errorMessage);
    }
  };

  // Handle form submit (create or update)
  const handleFormSubmit = async (formData: AvailabilityFormData) => {
    try {
      if (modalMode === "edit" && editingAvailability) {
        await mockUpdateAvailability(teacherId, editingAvailability.id, formData);
        toast.success("Availability updated successfully");
      } else {
        await mockCreateAvailability(teacherId, formData);
        toast.success("Availability created successfully");
      }

      await loadData();
      setShowModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save availability";
      toast.error(errorMessage);
    }
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    try {
      await mockDeleteAvailability(teacherId, id);
      toast.success("Availability deleted successfully");
      await loadData();
      setShowModal(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete availability";
      toast.error(errorMessage);
    }
  };

  // Get time range from location hours
  const timeRange = useMemo(() => {
    if (!locationHours) {
      return { minTime: "08:00:00", maxTime: "20:00:00" };
    }
    return {
      minTime: locationHours.minTime,
      maxTime: locationHours.maxTime,
    };
  }, [locationHours]);

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
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Click on the calendar to add availability. Click on existing availability to edit or delete.
        </p>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ReactBigCalendarWrapper
          events={calendarEvents}
          resources={DAY_RESOURCES}
          date={selectedDate}
          onNavigate={setSelectedDate}
          onEventClick={handleEventClick}
          onEventResize={handleEventResize}
          onSelectSlot={handleSelectSlot}
          editable={true}
          minTime={timeRange.minTime}
          maxTime={timeRange.maxTime}
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
        existingAvailabilities={availabilityEvents}
      />
    </div>
  );
}

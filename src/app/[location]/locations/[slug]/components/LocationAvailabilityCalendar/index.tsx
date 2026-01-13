"use client";

import * as React from "react";
import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";

export type LocationTimeBlock = {
  id: string;
  resourceId: number; // 1-7 (Mon-Sun)
  fromTime: string; // "HH:mm"
  toTime: string; // "HH:mm"
};

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

const pad2 = (n: number) => String(n).padStart(2, "0");

const toHHmm = (d: Date) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

const toDateAtMonday = (monday: Date, hhmm: string) => {
  const [hh, mm] = hhmm.split(":").map((v) => Number.parseInt(v, 10));
  const next = new Date(monday);
  next.setHours(hh || 0, mm || 0, 0, 0);
  return next;
};

const getMondayOfWeek = (date: Date) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0-6 (Sun-Sat)
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(d);
  monday.setDate(d.getDate() + daysToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const formatShortTime = (d: Date) => {
  // Example: 14:00 -> "2:00"
  const hours24 = d.getHours();
  const hours12 = ((hours24 + 11) % 12) + 1;
  const minutes = pad2(d.getMinutes());
  return `${hours12}:${minutes}`;
};

interface LocationAvailabilityCalendarProps {
  blocks: LocationTimeBlock[];
  onBlocksChange: (next: LocationTimeBlock[]) => void;
  editable?: boolean;
  height?: string;
}

export function LocationAvailabilityCalendar({
  blocks,
  onBlocksChange,
  editable = true,
  height = "600px",
}: LocationAvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const mondayDate = React.useMemo(() => getMondayOfWeek(selectedDate), [selectedDate]);

  const events = React.useMemo<CalendarEvent[]>(() => {
    return blocks.map((b) => {
      const start = toDateAtMonday(mondayDate, b.fromTime);
      const end = toDateAtMonday(mondayDate, b.toTime);
      return {
        id: b.id,
        title: `${formatShortTime(start)} - ${formatShortTime(end)}`,
        start,
        end,
        resourceId: b.resourceId,
        backgroundColor: "#86efac", // light green (matches screenshot vibe)
        borderColor: "#22c55e",
        className: "location-availability-block",
      };
    });
  }, [blocks, mondayDate]);

  const updateFromCalendarEvent = React.useCallback(
    (event: CalendarEvent) => {
      const resourceId =
        typeof event.resourceId === "number"
          ? event.resourceId
          : Number.parseInt(String(event.resourceId), 10);
      const next = blocks.map((b) =>
        b.id === event.id
          ? {
              ...b,
              resourceId: Number.isFinite(resourceId) ? resourceId : b.resourceId,
              fromTime: toHHmm(event.start),
              toTime: toHHmm(event.end),
            }
          : b
      );
      onBlocksChange(next);
    },
    [blocks, onBlocksChange]
  );

  const handleSelectSlot = React.useCallback(
    (slotInfo: { start: Date; end: Date; resourceId?: number | string }) => {
      if (!editable) return;

      const resourceId =
        typeof slotInfo.resourceId === "number"
          ? slotInfo.resourceId
          : Number.parseInt(String(slotInfo.resourceId || "1"), 10);

      const id = `loc-avail-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next: LocationTimeBlock = {
        id,
        resourceId: Number.isFinite(resourceId) ? resourceId : 1,
        fromTime: toHHmm(slotInfo.start),
        toTime: toHHmm(slotInfo.end),
      };
      onBlocksChange([...blocks, next]);
    },
    [blocks, editable, onBlocksChange]
  );

  return (
    <div className="border rounded-lg overflow-hidden">
      <ReactBigCalendarWrapper
        events={events}
        resources={DAY_RESOURCES}
        date={mondayDate}
        onNavigate={(newDate) => setSelectedDate(getMondayOfWeek(newDate))}
        onEventDrop={updateFromCalendarEvent}
        onEventResize={updateFromCalendarEvent}
        onSelectSlot={handleSelectSlot}
        editable={editable}
        viewType="availability"
        stepMinutes={60}
        timeslots={1}
        minTime="00:00:00"
        maxTime="23:00:00"
        height={height}
      />
    </div>
  );
}



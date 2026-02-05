"use client";

import * as React from "react";
import type { EventProps } from "react-big-calendar";
import { X } from "lucide-react";

import { ReactBigCalendarWrapper, CalendarEvent } from "@/components/Calendar/ReactBigCalendarWrapper";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { Button } from "@/components/ui/button";

export type LocationTimeBlock = {
  id: string;
  resourceId: number; // 1-7 (Mon-Sun)
  fromTime: string; // "HH:mm"
  toTime: string; // "HH:mm"
  backgroundColor?: string;
  className?: string;
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

const formatTimeRange = (start: Date, end: Date) =>
  `${formatShortTime(start)} - ${formatShortTime(end)}`;

type AvailabilityEventComponentProps = EventProps<CalendarEvent> & {
  onEventDelete?: (event: CalendarEvent) => void;
};

function AvailabilityEventWithDelete({ event, onEventDelete }: AvailabilityEventComponentProps) {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setShowDeleteModal(true);
    },
    []
  );

  const handleConfirmDelete = React.useCallback(() => {
    onEventDelete?.(event);
    setShowDeleteModal(false);
  }, [event, onEventDelete]);

  return (
    <>
      <div className="relative h-full w-full overflow-hidden px-1 py-0.5 flex items-start cursor-default">
        <span className="text-[10px] font-semibold text-white flex-shrink-0">
          {formatTimeRange(event.start, event.end)}
        </span>
        {onEventDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6 min-w-6 rounded-sm opacity-90 hover:opacity-100 text-red-500 hover:text-red-400 hover:bg-red-500/20"
            aria-label="Delete time slot"
            onClick={handleDeleteClick}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
      <DeleteConfirmationModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete time slot?"
        description="This time slot will be removed. This cannot be undone."
        onConfirm={handleConfirmDelete}
        confirmLabel="Delete"
      />
    </>
  );
}

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
        // The shared calendar event renderer already prints the time range.
        // Keep the title empty to avoid showing the same time range twice.
        title: "",
        start,
        end,
        resourceId: b.resourceId,
        backgroundColor: b.backgroundColor || "#86efac",
        borderColor: "#22c55e",
        className: b.className || "location-availability-block",
      };
    });
  }, [blocks, mondayDate]);

  const handleEventDelete = React.useCallback(
    (event: CalendarEvent) => {
      const next = blocks.filter((b) => b.id !== event.id);
      onBlocksChange(next);
    },
    [blocks, onBlocksChange]
  );

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
        onEventDelete={handleEventDelete}
        onSelectSlot={handleSelectSlot}
        editable={editable}
        viewType="availability"
        availabilityEventComponent={AvailabilityEventWithDelete}
        stepMinutes={60}
        timeslots={1}
        minTime="00:00:00"
        maxTime="23:00:00"
        height={height}
      />
    </div>
  );
}



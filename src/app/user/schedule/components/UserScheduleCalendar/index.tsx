"use client";

import * as React from "react";
import { format } from "date-fns";

import { ReactBigCalendarWrapper } from "@/components/Calendar/ReactBigCalendarWrapper";
import { getMockScheduleEvents } from "../mockScheduleData";

interface UserScheduleCalendarProps {
  selectedDate: Date;
  onNavigate: (date: Date) => void;
}

export default function UserScheduleCalendar({ selectedDate, onNavigate }: UserScheduleCalendarProps) {
  const events = React.useMemo(() => getMockScheduleEvents(selectedDate), [selectedDate]);
  const resources = React.useMemo(
    // Use a non "day-of-week" resource id so the calendar header shows full title (e.g. "Wednesday")
    // instead of the special "Mon 1/26" formatting used for ids 1-7 in the wrapper.
    () => [{ id: 0, title: format(selectedDate, "EEEE") }],
    [selectedDate]
  );

  return (
    <ReactBigCalendarWrapper
      events={events}
      resources={resources}
      date={selectedDate}
      onNavigate={onNavigate}
      editable={false}
      viewType="teacher"
      minTime="15:00:00"
      maxTime="21:00:00"
      stepMinutes={30}
      timeslots={1}
      height="75vh"
    />
  );
}


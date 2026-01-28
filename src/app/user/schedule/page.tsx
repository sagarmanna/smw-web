"use client";

import * as React from "react";

import UserScheduleCalendar from "./components/UserScheduleCalendar";
import UserScheduleToolbar from "./components/UserScheduleToolbar";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = React.useState<Date>(() => new Date());

  return (
    <div className="flex flex-col gap-3">
      <UserScheduleToolbar
        selectedDate={selectedDate}
        onSelectedDateChange={setSelectedDate}
      />

      <UserScheduleCalendar selectedDate={selectedDate} onNavigate={setSelectedDate} />
    </div>
  );
}


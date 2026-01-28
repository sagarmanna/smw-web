"use client";

import * as React from "react";

import { createMockLessonRows } from "./components/mockInvoicedLessonsData";
import type { DateRange } from "./components/types";
import UserInvoicedLessonsTable from "./components/UserInvoicedLessonsTable";
import UserInvoicedLessonsToolbar from "./components/UserInvoicedLessonsToolbar";

export default function InvoicedLessonsPage() {
  const [dateRange, setDateRange] = React.useState<DateRange>(() => ({
    from: new Date(2026, 0, 19),
    to: new Date(2026, 0, 24),
  }));
  const lessons = React.useMemo(() => createMockLessonRows(), []);

  return (
    <div className="flex flex-col gap-4">
      <UserInvoicedLessonsToolbar dateRange={dateRange} onDateRangeChange={setDateRange} />
      <UserInvoicedLessonsTable lessons={lessons} dateRange={dateRange} />
    </div>
  );
}


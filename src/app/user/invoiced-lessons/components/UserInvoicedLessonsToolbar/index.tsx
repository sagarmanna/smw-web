"use client";

import * as React from "react";

import { DateRangePicker } from "@/components/DateRangePicker";
import type { DateRange } from "../types";

interface UserInvoicedLessonsToolbarProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

export default function UserInvoicedLessonsToolbar({
  dateRange,
  onDateRangeChange,
}: UserInvoicedLessonsToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-semibold">Invoiced Lessons</h1>
      <div className="w-full">
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} preset="privateLessons" />
      </div>
    </div>
  );
}


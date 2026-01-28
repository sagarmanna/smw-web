"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface UserScheduleToolbarProps {
  selectedDate: Date;
  onSelectedDateChange: (date: Date) => void;
}

export default function UserScheduleToolbar({
  selectedDate,
  onSelectedDateChange,
}: UserScheduleToolbarProps) {
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [recentDates, setRecentDates] = React.useState<Date[]>([]);

  const pushRecentDate = React.useCallback((date: Date) => {
    const dateStr = date.toDateString();
    setRecentDates((prev) => {
      const existingIndex = prev.findIndex((d) => d.toDateString() === dateStr);
      const withoutExisting = existingIndex >= 0 ? prev.filter((_, i) => i !== existingIndex) : prev;
      const next = [date, ...withoutExisting];
      return next.slice(0, 5);
    });
  }, []);

  const handleDateSelect = React.useCallback(
    (date: Date) => {
      onSelectedDateChange(date);
      pushRecentDate(date);
      setDatePickerOpen(false);
    },
    [onSelectedDateChange, pushRecentDate]
  );

  const goToToday = React.useCallback(() => {
    handleDateSelect(new Date());
  }, [handleDateSelect]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="h-8"
        >
          Today
        </Button>

        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-10 min-w-[180px] justify-start font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex">
              {/* Recent Dates Sidebar (same UX as ScheduleClient) */}
              <div className="hidden sm:block w-32 p-2 border-r bg-gray-50 dark:bg-gray-800">
                <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
                  Recent Dates
                </div>
                <div className="space-y-1">
                  {recentDates.length === 0 ? (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      No recent dates
                    </div>
                  ) : (
                    recentDates.map((date) => (
                      <Button
                        key={date.toDateString()}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDateSelect(date)}
                        className="w-full h-6 text-xs justify-start p-1 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {format(date, "MMM dd, yyyy")}
                      </Button>
                    ))
                  )}
                </div>
              </div>

              {/* Main Calendar */}
              <div className="flex-1">
                <div className="p-2 border-b">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="w-full h-8 text-xs"
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    Today
                  </Button>
                </div>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  defaultMonth={selectedDate}
                  onSelect={(date) => {
                    if (date) handleDateSelect(date);
                  }}
                  captionLayout="dropdown"
                  fromYear={2005}
                  toYear={2125}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Day title now renders inside the calendar header */}
    </div>
  );
}


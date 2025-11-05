"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { format, startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import type { DateRange as CalendarDateRange } from "react-day-picker";

interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangePickerProps {
  value?: DateRange;
  onChange?: (range: DateRange) => void;
  className?: string;
  preset?: "default" | "payments";
}

const defaultQuickOptions = [
  {
    label: "Last 7 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 6)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 29)),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "This month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
];

const paymentsQuickOptions = [
  {
    label: "Today",
    getValue: () => ({
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  },
  {
    label: "Yesterday",
    getValue: () => ({
      from: startOfDay(subDays(new Date(), 1)),
      to: endOfDay(subDays(new Date(), 1)),
    }),
  },
  {
    label: "This Week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: endOfWeek(new Date(), { weekStartsOn: 1 }),
    }),
  },
  {
    label: "Last Week",
    getValue: () => {
      const lastWeekDate = subWeeks(new Date(), 1);
      return {
        from: startOfWeek(lastWeekDate, { weekStartsOn: 1 }),
        to: endOfWeek(lastWeekDate, { weekStartsOn: 1 }),
      };
    },
  },
  {
    label: "This Month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date()),
    }),
  },
  {
    label: "Last Month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
];

export function DateRangePicker({ value, onChange, className, preset = "default" }: DateRangePickerProps) {
  const quickOptions = preset === "payments" ? paymentsQuickOptions : defaultQuickOptions;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(value);
  const [tempRange, setTempRange] = useState<DateRange | undefined>(value);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setSelectedRange(value);
      setTempRange(value);
    }
  }, [value]);

  const handleQuickOption = (option: typeof quickOptions[0]) => {
    const range = option.getValue();
    setSelectedRange(range);
    setTempRange(range);
    onChange?.(range);
    setIsOpen(false);
  };

  const handleCalendarSelect = (range: CalendarDateRange | undefined) => {
    if (range?.from && range?.to) {
      setTempRange({ from: range.from, to: range.to });
    } else {
      setTempRange(undefined);
    }
  };

  const handleApply = () => {
    if (tempRange) {
      setSelectedRange(tempRange);
      onChange?.(tempRange);
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempRange(selectedRange);
    setIsOpen(false);
  };

  const formatDateRange = (range: DateRange | undefined) => {
    if (!range) return "Select date range";
    return `${format(range.from, "MMM dd")} - ${format(range.to, "MMM dd, yyyy")}`;
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedRange && "text-muted-foreground"
            )}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {formatDateRange(selectedRange)}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" ref={popoverRef}>
          <div className="flex">
            {/* Quick Options - Hidden on mobile */}
            <div className="hidden md:block border-r p-3 w-[140px]">
              <h4 className="text-sm font-medium mb-3">Quick Options</h4>
              <div className="space-y-1">
                {quickOptions.map((option) => (
                  <Button
                    key={option.label}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs h-7 hover:bg-accent"
                    onClick={() => handleQuickOption(option)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Calendar */}
            <div className="p-3">
              <h4 className="text-sm font-medium mb-3">Custom Range</h4>
              {/* Mobile: Single month */}
              <div className="block md:hidden">
                <CalendarComponent
                  mode="range"
                  defaultMonth={tempRange?.from}
                  selected={tempRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={1}
                  showOutsideDays={false}
                  className="rounded-lg border shadow-sm"
                />
              </div>
              {/* Desktop: Two months */}
              <div className="hidden md:block">
                <CalendarComponent
                  mode="range"
                  defaultMonth={tempRange?.from}
                  selected={tempRange}
                  onSelect={handleCalendarSelect}
                  numberOfMonths={2}
                  showOutsideDays={false}
                  className="rounded-lg border shadow-sm"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 mt-4 pt-3 border-t">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApply}
                  disabled={!tempRange}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

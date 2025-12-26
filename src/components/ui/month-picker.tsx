"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export interface MonthPickerProps {
  /** Selected date value (will use month/year) */
  value?: Date;
  /** Callback when month is selected */
  onSelect?: (date: Date | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** HTML id for the month picker */
  id?: string;
  /** Whether the month picker is disabled */
  disabled?: boolean;
  /** Whether to show error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Minimum year for the dropdown */
  fromYear?: number;
  /** Maximum year for the dropdown */
  toYear?: number;
  /** Custom className for the button */
  className?: string;
  /** Whether the popover is controlled externally */
  open?: boolean;
  /** Callback when popover open state changes */
  onOpenChange?: (open: boolean) => void;
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr",
  "May", "Jun", "Jul", "Aug",
  "Sep", "Oct", "Nov", "Dec"
];

/**
 * Reusable MonthPicker component with month grid popover
 * Maintains UI consistency with DatePicker
 */
export function MonthPicker({
  value,
  onSelect,
  placeholder = "Pick a month",
  label,
  id,
  disabled = false,
  error = false,
  errorMessage,
  fromYear = 2005,
  toYear = 2125,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: MonthPickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [selectedYear, setSelectedYear] = React.useState<number>(
    value ? value.getFullYear() : new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(
    value ? value.getMonth() : null
  );

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  // Update selected year/month when value changes
  React.useEffect(() => {
    if (value) {
      setSelectedYear(value.getFullYear());
      setSelectedMonth(value.getMonth());
    } else {
      setSelectedMonth(null);
    }
  }, [value]);

  const handleMonthSelect = (monthIndex: number) => {
    const newDate = new Date(selectedYear, monthIndex, 1);
    onSelect?.(newDate);
    setSelectedMonth(monthIndex);
    
    // Close popover after selection
    if (controlledOnOpenChange) {
      controlledOnOpenChange(false);
    } else {
      setInternalOpen(false);
    }
  };

  const handleYearChange = (delta: number) => {
    const newYear = selectedYear + delta;
    if (newYear >= fromYear && newYear <= toYear) {
      setSelectedYear(newYear);
    }
  };

  const formatDisplayValue = (): string => {
    if (!value) return placeholder;
    return format(value, "MMMM yyyy");
  };

  const buttonContent = (
    <Button
      variant="outline"
      className={cn(
        "w-full justify-start text-left font-normal",
        !value && "text-muted-foreground",
        error && "border-red-500",
        className
      )}
      type="button"
      disabled={disabled}
      id={id}
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {formatDisplayValue()}
    </Button>
  );

  const monthPickerContent = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {/* Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleYearChange(-1)}
              disabled={selectedYear <= fromYear}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium px-4">
              {selectedYear}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleYearChange(1)}
              disabled={selectedYear >= toYear}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-4 gap-1">
            {MONTHS.map((month, index) => {
              const isSelected = selectedMonth === index && value?.getFullYear() === selectedYear;
              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "h-10 w-16 text-xs font-normal",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );

  if (label) {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        {monthPickerContent}
        {error && errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <>
      {monthPickerContent}
      {error && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </>
  );
}


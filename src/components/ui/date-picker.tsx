"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export interface DatePickerProps {
  /** Selected date value */
  value?: Date;
  /** Callback when date is selected */
  onSelect?: (date: Date | undefined) => void;
  /** Placeholder text when no date is selected */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** HTML id for the date picker */
  id?: string;
  /** Whether the date picker is disabled */
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

/**
 * Reusable DatePicker component with Calendar popover
 * Supports dropdown year/month selection and consistent styling
 */
export function DatePicker({
  value,
  onSelect,
  placeholder = "Pick a date",
  label,
  id,
  disabled = false,
  error = false,
  errorMessage,
  fromYear = 1955,
  toYear = 2125,
  className,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: DatePickerProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);

  // Use controlled open state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = controlledOnOpenChange || setInternalOpen;

  const handleSelect = (date: Date | undefined) => {
    onSelect?.(date);
    // Close popover after selection
    if (controlledOnOpenChange) {
      controlledOnOpenChange(false);
    } else {
      setInternalOpen(false);
    }
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
      {value ? format(value, "MMM dd, yyyy") : placeholder}
    </Button>
  );

  const calendarContent = (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{buttonContent}</PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          defaultMonth={value}
          onSelect={handleSelect}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );

  if (label) {
    return (
      <div className="space-y-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        {calendarContent}
        {error && errorMessage && (
          <p className="text-sm text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }

  return (
    <>
      {calendarContent}
      {error && errorMessage && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}
    </>
  );
}


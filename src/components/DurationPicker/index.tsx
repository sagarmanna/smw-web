"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { parseDuration, formatDuration } from "@/utils/durationUtils";
import { cn } from "@/lib/utils";

export interface DurationPickerProps {
  /**
   * Duration value in HH:mm format (e.g., "01:30")
   */
  value: string;
  /**
   * Callback fired when duration changes
   * @param value - New duration value in HH:mm format
   */
  onChange: (value: string) => void;
  /**
   * Whether the picker is disabled
   */
  disabled?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Minute increment options (default: 15)
   * - 15: 00, 15, 30, 45
   * - 30: 00, 30
   * - 60: 00 only
   */
  minuteIncrement?: 15 | 30 | 60;
  /**
   * Maximum hours (default: 23)
   */
  maxHours?: number;
  /**
   * Optional label for the duration picker
   */
  label?: string;
  /**
   * Optional error message to display
   */
  error?: string;
}

/**
 * DurationPicker - A reusable component for selecting duration in hours and minutes
 * 
 * @example
 * ```tsx
 * <DurationPicker
 *   value={formData.duration}
 *   onChange={(value) => setFormData({ ...formData, duration: value })}
 *   label="Duration"
 * />
 * ```
 */
export function DurationPicker({
  value,
  onChange,
  disabled = false,
  className,
  minuteIncrement = 15,
  maxHours = 23,
  label,
  error,
}: DurationPickerProps) {
  // Parse current duration value
  const { hours, minutes } = React.useMemo(() => {
    return parseDuration(value);
  }, [value]);

  // Handle hour change
  const handleHourChange = React.useCallback(
    (newHours: number) => {
      const clampedHours = Math.max(0, Math.min(maxHours, newHours));
      const newDuration = formatDuration(clampedHours, minutes);
      onChange(newDuration);
    },
    [minutes, maxHours, onChange]
  );

  // Handle minute change with increment rounding
  const handleMinuteChange = React.useCallback(
    (newMinutes: number) => {
      // Round to nearest increment
      const roundedMinutes = Math.round(newMinutes / minuteIncrement) * minuteIncrement;
      // Handle overflow (if roundedMinutes >= 60, wrap to 0 and increment hour)
      const clampedMinutes = roundedMinutes >= 60 ? 0 : roundedMinutes;
      const newDuration = formatDuration(hours, clampedMinutes);
      onChange(newDuration);
    },
    [hours, minuteIncrement, onChange]
  );

  // Generate minute options based on increment
  const minuteOptions = React.useMemo(() => {
    const options: number[] = [];
    for (let i = 0; i < 60; i += minuteIncrement) {
      options.push(i);
    }
    return options;
  }, [minuteIncrement]);

  // Generate hour options
  const hourOptions = React.useMemo(() => {
    return Array.from({ length: maxHours + 1 }, (_, i) => i);
  }, [maxHours]);

  const pickerContent = (
    <div className={cn("flex items-center gap-2 border rounded-md h-10 px-3 bg-background", className, error && "border-red-500")}>
      {/* Hours */}
      <Select
        value={hours.toString()}
        onValueChange={(val) => handleHourChange(parseInt(val))}
        disabled={disabled}
      >
        <SelectTrigger className="w-16 h-8 px-2 py-0 border-0 focus:ring-0 text-base font-medium shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[200px]" style={{ maxHeight: "200px" }}>
          {hourOptions.map((hour) => (
            <SelectItem key={hour} value={hour.toString()}>
              {hour.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-xl font-semibold text-foreground">:</span>
      {/* Minutes */}
      <Select
        value={minutes.toString()}
        onValueChange={(val) => handleMinuteChange(parseInt(val))}
        disabled={disabled}
      >
        <SelectTrigger className="w-16 h-8 px-2 py-0 border-0 focus:ring-0 text-base font-medium shadow-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((minute) => (
            <SelectItem key={minute} value={minute.toString()}>
              {minute.toString().padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  if (label) {
    return (
      <div className="space-y-2">
        <label className={cn("text-sm font-medium", error && "text-red-600 dark:text-red-400")}>
          {label}
        </label>
        {pickerContent}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return pickerContent;
}


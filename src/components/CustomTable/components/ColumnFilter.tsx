"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Filter, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ColumnFilter } from "../CustomTable";

interface ColumnFilterProps {
  filter: ColumnFilter;
  value: unknown;
  onValueChange: (value: unknown) => void;
  onClear: () => void;
  onEnter?: () => void;
  className?: string;
}

export function ColumnFilterComponent({
  filter,
  value,
  onValueChange,
  onClear,
  onEnter,
  className,
}: ColumnFilterProps) {
  const [open, setOpen] = React.useState(false);
  
  // Use the actual value, or initial value only if value is truly undefined
  const currentValue = value !== undefined ? value : filter.initialValue;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onValueChange(date);
      setOpen(false);
    }
  };

  const handleStringChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange(e.target.value);
  };

  const handleDropdownChange = (selectedValue: string) => {
    onValueChange(selectedValue);
    setOpen(false);
  };

  const hasValue = currentValue !== null && currentValue !== undefined && currentValue !== "";
  
  // Type guards for better type safety
  const isDate = (value: unknown): value is Date => value instanceof Date;
  const isString = (value: unknown): value is string => typeof value === 'string';

  const renderFilterContent = () => {
    switch (filter.type) {
      case "date":
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 w-full px-1 text-xs justify-center font-normal",
                  !hasValue && "text-muted-foreground",
                  className
                )}
              >
                {hasValue && isDate(currentValue) ? format(currentValue, "yyyy-MM-dd") : "Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onValueChange(new Date());
                    setOpen(false);
                  }}
                  className="w-full h-6 text-xs"
                >
                  Today
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={isDate(value) ? value : undefined}
                defaultMonth={isDate(value) ? value : new Date()}
                onSelect={handleDateSelect}
                captionLayout="dropdown"
                disabled={filter.disabled}
              />
            </PopoverContent>
          </Popover>
        );

      case "string":
        return (
          <Input
            value={isString(currentValue) ? currentValue : ""}
            onChange={handleStringChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && onEnter) {
                onEnter();
              }
            }}
            className={cn("h-6 text-xs", className)}
          />
        );

      case "dropdown":
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 w-full px-1 text-xs justify-center font-normal",
                  !hasValue && "text-muted-foreground",
                  className
                )}
              >
                <Filter className="mr-1 h-3 w-3" />
                {hasValue 
                  ? filter.options?.find(opt => opt.value === currentValue)?.label || (isString(currentValue) ? currentValue : String(currentValue))
                  : "Filter"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-1">
                {filter.options?.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDropdownChange(option.value)}
                    className="w-full h-6 text-xs justify-start"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );

      case "date-range":
        // For now, we'll implement this as a simple date picker
        // In the future, this could be expanded to support date ranges
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "h-6 w-full px-1 text-xs justify-center font-normal",
                  !hasValue && "text-muted-foreground",
                  className
                )}
              >
                {hasValue && isDate(currentValue) ? format(currentValue, "yyyy-MM-dd") : "Date Range"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-2 border-b">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onValueChange(new Date());
                    setOpen(false);
                  }}
                  className="w-full h-6 text-xs"
                >
                  Today
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={isDate(currentValue) ? currentValue : undefined}
                defaultMonth={isDate(currentValue) ? currentValue : new Date()}
                onSelect={handleDateSelect}
                captionLayout="dropdown"
                fromYear={2005}
                toYear={2125}
                disabled={filter.disabled}
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex items-center gap-1">
      {renderFilterContent()}
      {hasValue && filter.type !== "date" && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 w-6 p-0 hover:bg-muted"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

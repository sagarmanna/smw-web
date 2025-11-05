"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Filter, X, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ColumnFilter } from "../CustomTable";
import { DateRangePicker } from "@/components/DateRangePicker";

interface ColumnFilterProps {
  filter: ColumnFilter;
  value: unknown;
  onValueChange: (value: unknown) => void;
  onClear: () => void;
  onEnter?: () => void;
  className?: string;
  placeholder?: string;
}

export function ColumnFilterComponent({
  filter,
  value,
  onValueChange,
  onClear,
  onEnter,
  className,
  placeholder = "Filter...",
}: ColumnFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [dropdownSearch, setDropdownSearch] = React.useState("");
  
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
  const isDateRange = (val: unknown): val is { from?: Date; to?: Date } => {
    if (val === null || typeof val !== 'object') return false;
    return (
      'from' in (val as { from?: unknown }) ||
      'to' in (val as { to?: unknown })
    );
  };

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
                  "h-8 w-full px-2 text-sm justify-center font-normal",
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
                  className="w-full h-8 text-sm"
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
            placeholder={placeholder}
            className={cn(
              "h-8 text-sm text-foreground placeholder:text-muted-foreground/80 placeholder:font-normal focus-visible:ring-1 focus-visible:ring-ring/30 focus-visible:ring-offset-0 border-border/50 focus-visible:border-ring/50",
              className
            )}
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
                  "h-8 w-full px-2 text-sm justify-center font-normal",
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
            <PopoverContent className="w-56 p-0" align="start">
              <div className="p-2 border-b">
                <div className="relative">
                  <Search className="h-3 w-3 absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    className="h-7 w-full rounded border border-input bg-background pl-6 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    placeholder="Search..."
                    value={dropdownSearch}
                    onChange={(e) => setDropdownSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-auto p-1">
                {filter.options?.filter(opt => opt.label.toLowerCase().includes(dropdownSearch.toLowerCase())).map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDropdownChange(option.value)}
                    className="w-full h-8 text-sm justify-start"
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        );

      case "date-range":
        return (
          <DateRangePicker
            preset={filter.quickPreset}
            value={(() => {
              const from = isDateRange(currentValue) ? currentValue.from : undefined;
              const to = isDateRange(currentValue) ? currentValue.to : undefined;
              return from && to ? { from, to } : undefined;
            })()}
            onChange={(range) => {
              onValueChange(range);
            }}
            className="min-w-[240px]"
          />
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
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

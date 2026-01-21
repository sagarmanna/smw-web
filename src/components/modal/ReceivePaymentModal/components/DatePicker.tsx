// components/DatePicker.tsx
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { CALENDAR_CONFIG } from '../constants';

interface DatePickerProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

/**
 * Date picker component with calendar popup
 * Following Single Responsibility Principle - handles only date selection
 */
export const DatePicker: React.FC<DatePickerProps> = ({ date, onDateChange }) => {
  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate);
    }
  };

  const setToday = () => {
    onDateChange(new Date());
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="h-9 w-full justify-start text-left font-normal"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>{format(date, 'MMM dd, yyyy')}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={setToday}
            className="w-full h-8 text-xs"
          >
            Today
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          onSelect={handleSelect}
          captionLayout={CALENDAR_CONFIG.captionLayout}
          fromYear={CALENDAR_CONFIG.fromYear}
          toYear={CALENDAR_CONFIG.toYear}
        />
      </PopoverContent>
    </Popover>
  );
};

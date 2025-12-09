"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface EnrolmentStartDateFormData {
  startDate: string;
  paymentCycleEffectiveDate: string;
  isOnline: boolean;
}

interface EnrolmentStartDateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onNext?: (data: EnrolmentStartDateFormData) => void;
  initialData?: EnrolmentStartDateFormData;
  location?: string;
}

interface DatePickerFieldProps {
  label: string;
  date: Date | undefined;
  error: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDateSelect: (date: Date | undefined) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, date, error, isOpen, onOpenChange, onDateSelect }) => (
  <div className="flex flex-col space-y-2">
    <Label className={cn("font-semibold", error ? "text-red-600 dark:text-red-400" : "text-foreground")}>
      {label}
    </Label>
    <div className="flex flex-col space-y-1">
      <Popover open={isOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-64 justify-start text-left font-normal",
              !date && "text-muted-foreground",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "MMM dd, yyyy") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-2 border-b">
            <Button variant="outline" size="sm" onClick={() => onDateSelect(new Date())} className="w-full h-8 text-xs">
              Today
            </Button>
          </div>
          <Calendar mode="single" selected={date} onSelect={onDateSelect} defaultMonth={date || new Date()} captionLayout="dropdown" fromYear={2005} toYear={2125} />
        </PopoverContent>
      </Popover>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  </div>
);

export function EnrolmentStartDateModal({
  open,
  onOpenChange,
  onBack,
  onNext,
  initialData,
  location: _location,
}: EnrolmentStartDateModalProps) {
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };

  const formatDateToString = (date: Date | undefined): string => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  const [startDate, setStartDate] = React.useState<Date | undefined>(parseDate(initialData?.startDate || ""));
  const [paymentCycleEffectiveDate, setPaymentCycleEffectiveDate] = React.useState<Date | undefined>(parseDate(initialData?.paymentCycleEffectiveDate || ""));
  const [isOnline, setIsOnline] = React.useState<boolean>(initialData?.isOnline || false);
  const [startDateError, setStartDateError] = React.useState<string>("");
  const [paymentCycleEffectiveDateError, setPaymentCycleEffectiveDateError] = React.useState<string>("");
  const [startDatePickerOpen, setStartDatePickerOpen] = React.useState(false);
  const [paymentCycleDatePickerOpen, setPaymentCycleDatePickerOpen] = React.useState(false);

  React.useEffect(() => {
    if (open && initialData) {
      setStartDate(parseDate(initialData.startDate || ""));
      setPaymentCycleEffectiveDate(parseDate(initialData.paymentCycleEffectiveDate || ""));
      setIsOnline(initialData.isOnline || false);
    } else if (!open) {
      setStartDate(undefined);
      setPaymentCycleEffectiveDate(undefined);
      setIsOnline(false);
      setStartDateError("");
      setPaymentCycleEffectiveDateError("");
      setStartDatePickerOpen(false);
      setPaymentCycleDatePickerOpen(false);
    }
  }, [open, initialData]);

  const handleDateSelect = (date: Date | undefined, setter: (date: Date | undefined) => void, errorSetter: (error: string) => void, closePicker: () => void) => {
    setter(date);
    errorSetter("");
    if (date) closePicker();
  };

  const validateForm = (): boolean => {
    let isValid = true;
    if (!startDate) {
      setStartDateError("Start Date cannot be blank.");
      isValid = false;
    } else {
      setStartDateError("");
    }
    if (!paymentCycleEffectiveDate) {
      setPaymentCycleEffectiveDateError("Payment Cycle Start Date cannot be blank.");
      isValid = false;
    } else {
      setPaymentCycleEffectiveDateError("");
    }
    return isValid;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    onNext?.({
      startDate: formatDateToString(startDate),
      paymentCycleEffectiveDate: formatDateToString(paymentCycleEffectiveDate),
      isOnline,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Enrolment Start Date</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <DatePickerField
            label="Start Date"
            date={startDate}
            error={startDateError}
            isOpen={startDatePickerOpen}
            onOpenChange={setStartDatePickerOpen}
            onDateSelect={(date) => handleDateSelect(date, setStartDate, setStartDateError, () => setStartDatePickerOpen(false))}
          />
          <DatePickerField
            label="Payment Cycle Effective Date"
            date={paymentCycleEffectiveDate}
            error={paymentCycleEffectiveDateError}
            isOpen={paymentCycleDatePickerOpen}
            onOpenChange={setPaymentCycleDatePickerOpen}
            onDateSelect={(date) => handleDateSelect(date, setPaymentCycleEffectiveDate, setPaymentCycleEffectiveDateError, () => setPaymentCycleDatePickerOpen(false))}
          />
          <div className="flex items-center gap-2">
            <Checkbox id="is-online" checked={isOnline} onCheckedChange={(checked) => setIsOnline(checked === true)} />
            <Label htmlFor="is-online" className="text-sm font-normal cursor-pointer">Is Online</Label>
          </div>
        </div>
        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          <Button variant="outline" onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600">Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">Next</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

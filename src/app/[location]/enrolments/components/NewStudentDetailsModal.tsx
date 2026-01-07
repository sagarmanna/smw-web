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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface NewStudentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBack?: () => void;
  onNext?: (data: StudentDetailsFormData) => void;
  /**
   * Optional initial data (typically from Customer Details modal)
   * Used to pre-fill first/last name while still validating locally.
   */
  initialData?: Partial<StudentDetailsFormData>;
  /**
   * Loading state for when APIs are being called
   */
  isLoading?: boolean;
}

export interface StudentDetailsFormData {
  firstName: string;
  lastName: string;
  birthDate?: string;
  gender: string;
}

const defaultFormData: StudentDetailsFormData = {
  firstName: "",
  lastName: "",
  birthDate: undefined,
  gender: "Not Specified",
};

const GENDER_OPTIONS = ["Not Specified", "Male", "Female"];

export function NewStudentDetailsModal({
  open,
  onOpenChange,
  onBack,
  onNext,
  initialData,
  isLoading = false,
}: NewStudentDetailsModalProps) {
  const [formData, setFormData] = React.useState<StudentDetailsFormData>({
    ...defaultFormData,
    ...initialData,
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [birthDate, setBirthDate] = React.useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);

  // Reset / hydrate form when modal opens or initialData changes
  React.useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...defaultFormData,
        ...prev,
        ...initialData,
      }));
    } else {
      setFormData(defaultFormData);
      setErrors({});
      setBirthDate(undefined);
    }
  }, [open, initialData]);

  const handleFieldChange = (field: keyof StudentDetailsFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setBirthDate(date);
    if (date) {
      handleFieldChange("birthDate", format(date, "yyyy-MM-dd"));
    } else {
      handleFieldChange("birthDate", "");
    }
    setIsDatePickerOpen(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName?.trim()) newErrors.firstName = "First name cannot be blank.";
    if (!formData.lastName?.trim()) newErrors.lastName = "Last name cannot be blank.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    onNext?.(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">Student Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* First Name */}
          <div className="flex items-center gap-4">
            <Label htmlFor="firstName" className={cn("text-sm font-semibold w-40", errors.firstName && "text-red-600 dark:text-red-400")}>
              First Name
            </Label>
            <div className="flex-1">
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleFieldChange("firstName", e.target.value)}
                placeholder="First Name"
                className={cn("w-full", errors.firstName && "border-red-500")}
              />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
          </div>

          {/* Last Name */}
          <div className="flex items-center gap-4">
            <Label htmlFor="lastName" className={cn("text-sm font-semibold w-40", errors.lastName && "text-red-600 dark:text-red-400")}>
              Last Name
            </Label>
            <div className="flex-1">
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleFieldChange("lastName", e.target.value)}
                placeholder="Last Name"
                className={cn("w-full", errors.lastName && "border-red-500")}
              />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Birth Date */}
          <div className="flex items-center gap-4">
            <Label className="text-sm font-semibold w-40">Birth Date</Label>
            <div className="flex-1">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthDate && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthDate ? format(birthDate, "MMM dd, yyyy") : "Select Date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-2 border-b">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDateSelect(new Date())}
                      className="w-full h-8 text-xs"
                    >
                      Today
                    </Button>
                  </div>
                  <Calendar
                    mode="single"
                    selected={birthDate}
                    onSelect={handleDateSelect}
                    defaultMonth={birthDate || new Date()}
                    captionLayout="dropdown"
                    fromYear={1955}
                    toYear={2125}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Gender */}
          <div className="flex items-start gap-4">
            <Label className="text-sm font-semibold w-40 pt-2">Gender</Label>
            <div className="flex-1">
              <div className="space-y-2">
                {GENDER_OPTIONS.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleFieldChange("gender", option)}
                      className={cn(
                        "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        formData.gender === option
                          ? "border-primary bg-primary"
                          : "border-input hover:border-primary/50"
                      )}
                    >
                      {formData.gender === option && (
                        <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFieldChange("gender", option)}
                      className={cn(
                        "text-sm font-normal text-left transition-colors",
                        formData.gender === option
                          ? "text-primary font-medium"
                          : "text-foreground hover:text-primary/80"
                      )}
                    >
                      {option}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="!flex !flex-row !justify-between !items-center gap-2">
          <Button onClick={onBack} disabled={isLoading}>Back</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancel</Button>
            <Button onClick={handleNext} disabled={isLoading}>
              {isLoading ? "Loading..." : "Preview Lessons"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


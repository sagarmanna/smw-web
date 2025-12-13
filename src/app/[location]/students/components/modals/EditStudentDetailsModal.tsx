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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { StudentBasicDetails } from "../../types";
import { parse, isValid } from "date-fns";
import { genderDisplayToApi } from "../../[id]/students-details.api";

function formatDateToISO(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function convertToISOFormat(dateStr: string): string {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  try {
    let parsedDate = parse(dateStr, "MMM dd, yyyy", new Date());
    if (!isValid(parsedDate)) parsedDate = parse(dateStr, "MMM d, yyyy", new Date());
    if (isValid(parsedDate)) return formatDateToISO(parsedDate);
  } catch (error) {
    console.warn("Failed to parse date:", dateStr, error);
  }
  const date = new Date(dateStr);
  return !isNaN(date.getTime()) ? formatDateToISO(date) : "";
}

interface EditStudentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: StudentBasicDetails | null;
  onSubmit: (details: StudentBasicDetails) => Promise<boolean>;
  saving?: boolean;
}

export function EditStudentDetailsModal({
  open,
  onClose,
  details,
  onSubmit,
  saving = false,
}: EditStudentDetailsModalProps) {
  const [formData, setFormData] = React.useState({
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    notes: "",
  });
  const [birthdayDate, setBirthdayDate] = React.useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [touched, setTouched] = React.useState({ firstName: false, lastName: false });
  const [showError, setShowError] = React.useState(false);

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  React.useEffect(() => {
    if (details) {
      const raw = details.birthday ?? "";
      const isoDate = raw ? convertToISOFormat(raw) : "";
      
      // Convert ISO date string to Date object for Calendar component
      let dateObj: Date | undefined = undefined;
      if (isoDate) {
        try {
          if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
            const [year, month, day] = isoDate.split('-').map(Number);
            dateObj = new Date(year, month - 1, day);
            if (isNaN(dateObj.getTime())) {
              dateObj = undefined;
            }
          } else {
            dateObj = new Date(isoDate);
            if (isNaN(dateObj.getTime())) {
              dateObj = undefined;
            }
          }
        } catch {
          dateObj = undefined;
        }
      }
      
      // Gender is already in display format from the API transformation
      setFormData({
        firstName: details.firstName ?? "",
        lastName: details.lastName ?? "",
        birthday: isoDate,
        gender: details.gender ?? "",
        notes: details.notes ?? "",
      });
      setBirthdayDate(dateObj);
    } else {
      setFormData({ firstName: "", lastName: "", birthday: "", gender: "", notes: "" });
      setBirthdayDate(undefined);
    }
    if (open) {
      setTouched({ firstName: false, lastName: false });
      setShowError(false);
      setIsDatePickerOpen(false);
    }
  }, [details, open]);

  const validateField = (value: string): boolean => (value?.trim() ?? "") !== "";
  const isFirstNameValid = validateField(formData.firstName);
  const isLastNameValid = validateField(formData.lastName);
  const isFormValid = isFirstNameValid && isLastNameValid;
  const fieldLabels = { firstName: "First name", lastName: "Last name" };
  const getFieldError = (field: "firstName" | "lastName", isValid: boolean): string =>
    touched[field] && !isValid ? `${fieldLabels[field]} is required` : "";
  const firstNameError = getFieldError("firstName", isFirstNameValid);
  const lastNameError = getFieldError("lastName", isLastNameValid);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({ firstName: true, lastName: true });
    if (!isFormValid) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (!details) return;
    
    // Keep gender in display format - conversion to API format happens in saveDetails
    const success = await onSubmit({
      id: details.id,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      birthday: formData.birthday || undefined,
      gender: formData.gender || undefined, // Keep in display format
      status: details.status,
      notes: formData.notes || undefined,
    });
    if (success) {
      // Toast is handled in the parent component
      onClose();
      setTouched({ firstName: false, lastName: false });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Convert Date to ISO string (YYYY-MM-DD)
      const isoDate = formatDateToISO(date);
      setBirthdayDate(date);
      updateFormData("birthday", isoDate);
      setIsDatePickerOpen(false);
    }
  };

  const createTextInputHandler = (field: keyof typeof formData) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateFormData(field, event.target.value);
  };

  const createNameInputHandler = (field: "firstName" | "lastName") => (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFormData(field, event.target.value);
    setTouched((prev) => ({ ...prev, [field]: true }));
    setShowError(false);
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Student Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showError && !isFormValid && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Please fix the errors below before submitting.
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student-first-name">First Name</Label>
              <Input
                id="student-first-name"
                value={formData.firstName}
                onChange={createNameInputHandler("firstName")}
                onBlur={() => setTouched((prev) => ({ ...prev, firstName: true }))}
                className={firstNameError ? "border-red-500" : ""}
                placeholder="Enter first name"
              />
              {firstNameError && <p className="text-sm text-red-600">{firstNameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-last-name">Last Name</Label>
              <Input
                id="student-last-name"
                value={formData.lastName}
                onChange={createNameInputHandler("lastName")}
                onBlur={() => setTouched((prev) => ({ ...prev, lastName: true }))}
                className={lastNameError ? "border-red-500" : ""}
                placeholder="Enter last name"
              />
              {lastNameError && <p className="text-sm text-red-600">{lastNameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-birthday">Birthday</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !birthdayDate && "text-muted-foreground"
                    )}
                    type="button"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {birthdayDate ? format(birthdayDate, "MMM dd, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={birthdayDate}
                    defaultMonth={birthdayDate}
                    onSelect={handleDateSelect}
                    captionLayout="dropdown"
                    fromYear={2005}
                    toYear={2125}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => updateFormData("gender", value)}
              >
                <SelectTrigger id="student-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Not Specified">Not Specified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="student-notes">Notes</Label>
              <Textarea
                id="student-notes"
                value={formData.notes}
                onChange={createTextInputHandler("notes")}
                placeholder="Enter notes about the student"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

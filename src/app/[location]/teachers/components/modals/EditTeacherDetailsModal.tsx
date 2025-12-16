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
import { DatePicker } from "@/components/ui/date-picker";
import { formatDateToISO, convertToDate } from "@/utils/dateUtils";
import { TeacherBasicDetails } from "../../types";
import { toast } from "sonner";

interface EditTeacherDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: TeacherBasicDetails | null;
  onSubmit: (details: TeacherBasicDetails) => Promise<boolean>;
  saving?: boolean;
}

export function EditTeacherDetailsModal({
  open,
  onClose,
  details,
  onSubmit,
  saving = false,
}: EditTeacherDetailsModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  // Raw date value we send to API (ISO-like, e.g. 2019-01-16)
  const [birthDate, setBirthDate] = React.useState("");
  // Date object for Calendar component
  const [birthdayDate, setBirthdayDate] = React.useState<Date | undefined>(undefined);
  
  // Field-level validation states
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);
  const [showError, setShowError] = React.useState(false);


  React.useEffect(() => {
    if (details) {
      setFirstName(details.firstName ?? "");
      setLastName(details.lastName ?? "");
      // Keep raw date for API (ISO format)
      const raw = details.birthDate ?? "";
      setBirthDate(raw);
      // Convert to Date object for Calendar component
      const dateObj = convertToDate(raw);
      setBirthdayDate(dateObj);
    } else {
      // Reset form when details are cleared
      setFirstName("");
      setLastName("");
      setBirthDate("");
      setBirthdayDate(undefined);
    }
    // Reset validation states when modal opens/closes
    if (open) {
      setFirstNameTouched(false);
      setLastNameTouched(false);
      setShowError(false);
    }
  }, [details, open]);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      // Convert Date to ISO string (YYYY-MM-DD)
      const isoDate = formatDateToISO(date);
      setBirthdayDate(date);
      setBirthDate(isoDate);
    } else {
      setBirthdayDate(undefined);
      setBirthDate("");
    }
  };

  // Validation helpers
  const isFirstNameValid = (firstName?.trim() ?? "") !== "";
  const isLastNameValid = (lastName?.trim() ?? "") !== "";
  const isFormValid = isFirstNameValid && isLastNameValid;

  const firstNameError = firstNameTouched && !isFirstNameValid ? "First name is required" : "";
  const lastNameError = lastNameTouched && !isLastNameValid ? "Last name is required" : "";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Mark all fields as touched
    setFirstNameTouched(true);
    setLastNameTouched(true);

    if (!isFormValid) {
      setShowError(true);
      return;
    }

    setShowError(false);

    const payload: TeacherBasicDetails = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthDate: birthDate || undefined,
    };

    const success = await onSubmit(payload);
    if (success) {
      toast.success("Teacher details updated successfully");
      onClose();
      // Reset validation states
      setFirstNameTouched(false);
      setLastNameTouched(false);
    } else {
      toast.error("Failed to update teacher details");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Teacher Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {showError && !isFormValid && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Please fix the errors below before submitting.
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-first-name">First Name</Label>
              <Input
                id="teacher-first-name"
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  setFirstNameTouched(true);
                  setShowError(false);
                }}
                onBlur={() => setFirstNameTouched(true)}
                className={firstNameError ? "border-red-500" : ""}
                placeholder="Enter first name"
              />
              {firstNameError && (
                <p className="text-sm text-red-600">{firstNameError}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-last-name">Last Name</Label>
              <Input
                id="teacher-last-name"
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  setLastNameTouched(true);
                  setShowError(false);
                }}
                onBlur={() => setLastNameTouched(true)}
                className={lastNameError ? "border-red-500" : ""}
                placeholder="Enter last name"
              />
              {lastNameError && (
                <p className="text-sm text-red-600">{lastNameError}</p>
              )}
            </div>
            <div className="sm:col-span-2">
              <DatePicker
                id="teacher-birthdate"
                label="Birth Date"
                value={birthdayDate}
                onSelect={handleDateSelect}
                placeholder="Pick a date"
                fromYear={1955}
                toYear={2125}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
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


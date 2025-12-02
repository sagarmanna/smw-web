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
import { TeacherBasicDetails } from "../../types";
import { formatDisplayDate } from "../../utils/dateUtils";
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
  // Display value shown in the input (e.g. "Jan 16, 2019")
  const [birthDateDisplay, setBirthDateDisplay] = React.useState("");
  // Ref for native date input to imperatively open the picker
  type DateInputElement = HTMLInputElement & {
    showPicker?: () => void;
  };
  const dateInputRef = React.useRef<DateInputElement | null>(null);
  
  // Field-level validation states
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    if (details) {
      setFirstName(details.firstName ?? "");
      setLastName(details.lastName ?? "");
      // Keep raw date for API and formatted string for display
      const raw = details.birthDate ?? "";
      setBirthDate(raw);
      setBirthDateDisplay(raw ? formatDisplayDate(raw) : "");
    } else {
      // Reset form when details are cleared
      setFirstName("");
      setLastName("");
      setBirthDate("");
      setBirthDateDisplay("");
    }
    // Reset validation states when modal opens/closes
    if (open) {
      setFirstNameTouched(false);
      setLastNameTouched(false);
      setShowError(false);
    }
  }, [details, open]);

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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="teacher-birthdate">Birth Date</Label>
              <div
                className="relative"
                onClick={() => {
                  // Try to programmatically open the native date picker
                  const inputEl = dateInputRef.current;
                  if (inputEl?.showPicker) {
                    inputEl.showPicker();
                  } else {
                    inputEl?.focus();
                  }
                }}
              >
                {/* Visible formatted field */}
                <Input
                  id="teacher-birthdate-display"
                  type="text"
                  placeholder="Select Date"
                  value={birthDateDisplay}
                  readOnly
                />
                {/* Native date input to provide calendar picker */}
                <input
                  id="teacher-birthdate"
                  type="date"
                  ref={dateInputRef}
                  className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                  value={birthDate}
                  onChange={(event) => {
                    const value = event.target.value; // yyyy-mm-dd
                    setBirthDate(value);
                    setBirthDateDisplay(value ? formatDisplayDate(value) : "");
                  }}
                />
              </div>
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


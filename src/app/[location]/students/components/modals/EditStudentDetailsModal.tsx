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
import { StudentBasicDetails } from "../../types";
import { toast } from "sonner";

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
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [birthday, setBirthday] = React.useState("");
  const [age, setAge] = React.useState("");
  const [gender, setGender] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Field-level validation states
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    if (details) {
      setFirstName(details.firstName ?? "");
      setLastName(details.lastName ?? "");
      setBirthday(details.birthday ?? "");
      setAge(details.age ?? "");
      setGender(details.gender ?? "");
      setNotes(details.notes ?? "");
    } else {
      // Reset form when details are cleared
      setFirstName("");
      setLastName("");
      setBirthday("");
      setAge("");
      setGender("");
      setNotes("");
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

    if (!details) return;

    const payload: StudentBasicDetails = {
      id: details.id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      birthday: birthday || undefined,
      age: age || undefined,
      gender: gender || undefined,
      status: details.status,
      notes: notes || undefined,
    };

    const success = await onSubmit(payload);
    if (success) {
      toast.success("Student details updated successfully");
      onClose();
      // Reset validation states
      setFirstNameTouched(false);
      setLastNameTouched(false);
    } else {
      toast.error("Failed to update student details");
    }
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
              <Label htmlFor="student-last-name">Last Name</Label>
              <Input
                id="student-last-name"
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
            <div className="space-y-2">
              <Label htmlFor="student-birthday">Birthday</Label>
              <Input
                id="student-birthday"
                type="text"
                value={birthday}
                onChange={(event) => setBirthday(event.target.value)}
                placeholder="e.g., Mar 15, 2018"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-age">Age</Label>
              <Input
                id="student-age"
                type="text"
                value={age}
                onChange={(event) => setAge(event.target.value)}
                placeholder="e.g., 6yrs old"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-gender">Gender</Label>
              <Input
                id="student-gender"
                type="text"
                value={gender}
                onChange={(event) => setGender(event.target.value)}
                placeholder="e.g., Female, Male"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="student-notes">Notes</Label>
              <Textarea
                id="student-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Enter notes about the student"
                rows={3}
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


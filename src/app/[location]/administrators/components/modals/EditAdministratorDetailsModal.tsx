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
import { AdministratorBasicDetails } from "../../types";

interface EditAdministratorDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: AdministratorBasicDetails | null;
  onSubmit: (details: AdministratorBasicDetails) => Promise<boolean>;
  saving?: boolean;
}

export function EditAdministratorDetailsModal({
  open,
  onClose,
  details,
  onSubmit,
  saving = false,
}: EditAdministratorDetailsModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  
  // Field-level validation states
  const [firstNameTouched, setFirstNameTouched] = React.useState(false);
  const [lastNameTouched, setLastNameTouched] = React.useState(false);
  const [showError, setShowError] = React.useState(false);

  React.useEffect(() => {
    if (details) {
      setFirstName(details.firstName ?? "");
      setLastName(details.lastName ?? "");
    } else {
      // Reset form when details are cleared
      setFirstName("");
      setLastName("");
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

    const updatedDetails: AdministratorBasicDetails = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: details?.role || "Administrator",
    };

    const success = await onSubmit(updatedDetails);
    if (success) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setShowError(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Administrator Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (firstNameTouched) {
                    setShowError(!isFirstNameValid);
                  }
                }}
                onBlur={() => {
                  setFirstNameTouched(true);
                  setShowError(!isFormValid);
                }}
                placeholder="Enter first name"
                className={firstNameError ? "border-red-500" : ""}
              />
              {firstNameError && (
                <p className="text-sm text-red-500">{firstNameError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (lastNameTouched) {
                    setShowError(!isLastNameValid);
                  }
                }}
                onBlur={() => {
                  setLastNameTouched(true);
                  setShowError(!isFormValid);
                }}
                placeholder="Enter last name"
                className={lastNameError ? "border-red-500" : ""}
              />
              {lastNameError && (
                <p className="text-sm text-red-500">{lastNameError}</p>
              )}
            </div>

            {showError && !isFormValid && (
              <p className="text-sm text-red-500">
                Please fill in all required fields.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !isFormValid}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


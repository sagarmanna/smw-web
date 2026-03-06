"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface WalkInFormData {
  firstName: string;
  lastName: string;
  email: string;
}

export interface WalkInInitialData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface AddWalkInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSaving?: boolean;
  title?: string;
  initialData?: WalkInInitialData;
  onSave: (data: WalkInFormData) => Promise<{ ok: boolean; message?: string }>;
}

export function AddWalkInModal({
  open,
  onOpenChange,
  isSaving = false,
  title = "Add Walkin",
  initialData,
  onSave,
}: AddWalkInModalProps) {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    form?: string;
  }>({});

  const resetForm = React.useCallback(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setErrors({});
  }, []);

  React.useEffect(() => {
    if (open) {
      setFirstName(initialData?.firstName ?? "");
      setLastName(initialData?.lastName ?? "");
      setEmail(initialData?.email ?? "");
      setErrors({});
    } else {
      resetForm();
    }
  }, [open, initialData?.firstName, initialData?.lastName, initialData?.email, resetForm]);

  const handleFirstNameChange = React.useCallback((value: string) => {
    setFirstName(value);
    setErrors((prev) => ({ ...prev, firstName: undefined, form: undefined }));
  }, []);

  const handleLastNameChange = React.useCallback((value: string) => {
    setLastName(value);
    setErrors((prev) => ({ ...prev, lastName: undefined, form: undefined }));
  }, []);

  const handleEmailChange = React.useCallback((value: string) => {
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
  }, []);

  const handleSubmit = React.useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors: typeof errors = {};
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedFirstName) {
      nextErrors.firstName = "First Name cannot be blank.";
    }

    if (!trimmedLastName) {
      nextErrors.lastName = "Last Name cannot be blank.";
    }

    if (trimmedEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedEmail)) {
        nextErrors.email = "Please enter a valid email address.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});

    const result = await onSave({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: trimmedEmail,
    });

    if (result.ok) {
      onOpenChange(false);
      resetForm();
      return;
    }

    const message = result.message || "Failed to add walk-in customer";
    if (message.toLowerCase().includes("email")) {
      setErrors({ email: message });
      return;
    }

    setErrors({ form: message });
  }, [email, errors, firstName, lastName, onOpenChange, onSave, resetForm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle id="add-walkin-modal-title">{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2" aria-labelledby="add-walkin-modal-title">
          <div className="space-y-2">
            <Label htmlFor="walkin-first-name">First Name</Label>
            <Input
              id="walkin-first-name"
              value={firstName}
              onChange={(e) => handleFirstNameChange(e.target.value)}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName ? <p className="text-sm text-destructive">{errors.firstName}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="walkin-last-name">Last Name</Label>
            <Input
              id="walkin-last-name"
              value={lastName}
              onChange={(e) => handleLastNameChange(e.target.value)}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName ? <p className="text-sm text-destructive">{errors.lastName}</p> : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="walkin-email">Email</Label>
            <Input
              id="walkin-email"
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={errors.email ? "border-destructive" : ""}
            />
            {errors.email ? <p className="text-sm text-destructive">{errors.email}</p> : null}
          </div>

          {errors.form ? <p className="text-sm text-destructive">{errors.form}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

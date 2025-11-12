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
  const [birthDate, setBirthDate] = React.useState("");
  const [role, setRole] = React.useState("Teacher");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (details) {
      setFirstName(details.firstName ?? "");
      setLastName(details.lastName ?? "");
      setBirthDate(details.birthDate ?? "");
      setRole(details.role ?? "Teacher");
    }
  }, [details, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    setError(null);

    const payload: TeacherBasicDetails = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role.trim() ? role : "Teacher",
      birthDate: birthDate || undefined,
    };

    const success = await onSubmit(payload);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Teacher Details</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-first-name">First Name</Label>
              <Input
                id="teacher-first-name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                placeholder="Enter first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-last-name">Last Name</Label>
              <Input
                id="teacher-last-name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="teacher-role">Role</Label>
              <Input
                id="teacher-role"
                value={role}
                onChange={(event) => setRole(event.target.value)}
                placeholder="Teacher"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teacher-birthdate">Birth Date</Label>
              <Input
                id="teacher-birthdate"
                type="date"
                value={birthDate ?? ""}
                onChange={(event) => setBirthDate(event.target.value)}
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


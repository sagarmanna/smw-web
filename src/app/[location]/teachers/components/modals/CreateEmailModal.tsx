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
import { Checkbox } from "@/components/ui/checkbox";
import { TeacherEmail } from "../../types";

interface CreateEmailModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: TeacherEmail) => void;
}

export function CreateEmailModal({
  open,
  onClose,
  onSubmit,
}: CreateEmailModalProps) {
  const [label, setLabel] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setLabel("");
    setEmail("");
    setNote("");
    setIsPrimary(false);
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    const newEmail: TeacherEmail = {
      id: crypto.randomUUID(),
      label: label.trim() || "Work",
      email: email.trim(),
      note: note.trim() || undefined,
      isPrimary,
    };

    onSubmit(newEmail);
    resetForm();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Add Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email-label">Label</Label>
              <Input
                id="email-label"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
                placeholder="Work"
              />
            </div>
            <div className="space-y-2 sm:col-span-1 col-span-1">
              <Label htmlFor="email-address">Email</Label>
              <Input
                id="email-address"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-note">Note</Label>
            <Input
              id="email-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="email-primary"
              checked={isPrimary}
              onCheckedChange={(value) => setIsPrimary(Boolean(value))}
            />
            <Label htmlFor="email-primary" className="text-sm text-muted-foreground">
              Set as primary
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Email</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


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
import { TeacherPhone } from "../../types";

interface CreatePhoneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (phone: TeacherPhone) => void;
}

export function CreatePhoneModal({
  open,
  onClose,
  onSubmit,
}: CreatePhoneModalProps) {
  const [label, setLabel] = React.useState("");
  const [number, setNumber] = React.useState("");
  const [extension, setExtension] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = () => {
    setLabel("");
    setNumber("");
    setExtension("");
    setNote("");
    setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!number.trim()) {
      setError("Phone number is required.");
      return;
    }

    const newPhone: TeacherPhone = {
      id: crypto.randomUUID(),
      label: label.trim() || "Mobile",
      number: number.trim(),
      extension: extension.trim() || undefined,
      note: note.trim() || undefined,
    };

    onSubmit(newPhone);
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
          <DialogTitle>Add Phone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone-label">Label</Label>
            <Input
              id="phone-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Mobile"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Phone Number</Label>
            <Input
              id="phone-number"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone-extension">Extension</Label>
              <Input
                id="phone-extension"
                value={extension}
                onChange={(event) => setExtension(event.target.value)}
                placeholder="Ext"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone-note">Note</Label>
              <Input
                id="phone-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional note"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Phone</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


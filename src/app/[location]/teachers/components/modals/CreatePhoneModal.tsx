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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TeacherPhone } from "../../types";

interface CreatePhoneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (phone: TeacherPhone) => void;
  editingPhone?: TeacherPhone | null;
}

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

export function CreatePhoneModal({
  open,
  onClose,
  onSubmit,
  editingPhone = null,
}: CreatePhoneModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [number, setNumber] = React.useState("");
  const [extension, setExtension] = React.useState("");
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editingPhone) {
      setLabel(editingPhone.label || "Home");
      setNumber(editingPhone.number || "");
      setExtension(editingPhone.extension || "");
      setNote(editingPhone.note || "");
    } else {
      setLabel("Home");
      setNumber("");
      setExtension("");
      setNote("");
    }
    setError(null);
  }, [editingPhone, open]);

  const resetForm = () => {
    setLabel("Home");
    setNumber("");
    setExtension("");
    setNote("");
    setError(null);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNumber(formatted);
    if (error) setError(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!number.trim()) {
      setError("Phone number is required.");
      return;
    }

    const newPhone: TeacherPhone = {
      id: editingPhone?.id || crypto.randomUUID(),
      label: label.trim() || "Home",
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
          <DialogTitle>Phone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="phone-number">
              Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone-number"
              type="tel"
              value={number}
              onChange={handlePhoneNumberChange}
              placeholder="(___) ___-____"
              maxLength={14}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-label">Label</Label>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger id="phone-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-extension">Extension</Label>
            <Input
              id="phone-extension"
              type="text"
              value={extension}
              onChange={(event) => setExtension(event.target.value)}
              placeholder="Enter extension"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-note">Note</Label>
            <Textarea
              id="phone-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Enter note"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


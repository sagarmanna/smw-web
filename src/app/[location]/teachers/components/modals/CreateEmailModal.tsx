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
import { TeacherEmail } from "../../types";

interface CreateEmailModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (email: TeacherEmail) => void;
  editingEmail?: TeacherEmail | null;
}

export function CreateEmailModal({
  open,
  onClose,
  onSubmit,
  editingEmail = null,
}: CreateEmailModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [email, setEmail] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (editingEmail) {
      setLabel(editingEmail.label || "Home");
      setEmail(editingEmail.email || "");
      setNote(editingEmail.note || "");
      setIsPrimary(editingEmail.isPrimary || false);
    } else {
      setLabel("Home");
      setEmail("");
      setNote("");
      setIsPrimary(false);
    }
    setError(null);
  }, [editingEmail, open]);

  const resetForm = () => {
    setLabel("Home");
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
      id: editingEmail?.id || crypto.randomUUID(),
      label: label.trim() || "Home",
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
          <DialogTitle>Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email-address">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email-address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-label">Label</Label>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger id="email-label">
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
            <Label htmlFor="email-note">Note</Label>
            <Textarea
              id="email-note"
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


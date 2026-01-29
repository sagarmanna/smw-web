"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { GenericEmail } from "@/components/user-details/types/common";

interface CreateProfileEmailModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (email: GenericEmail) => void;
  editingEmail?: GenericEmail | null;
  // kept for compatibility with UserEmailCard, but unused for UI-only mock
  location: string;
  entityId: number;
  currentEmails?: GenericEmail[];
}

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CreateProfileEmailModal({
  open,
  onClose,
  onSubmit,
  editingEmail,
  currentEmails = [],
}: CreateProfileEmailModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [email, setEmail] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    if (editingEmail) {
      setLabel(editingEmail.label || "Home");
      setEmail(editingEmail.email || "");
      setIsPrimary(!!editingEmail.isPrimary);
    } else {
      setLabel("Home");
      setEmail("");
      setIsPrimary(currentEmails.length === 0);
    }
  }, [open, editingEmail, currentEmails.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    const result: GenericEmail = {
      id: editingEmail?.id || newId(),
      label,
      email: trimmed,
      isPrimary,
    };
    onSubmit?.(result);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Select value={label} onValueChange={setLabel}>
              <SelectTrigger>
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
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} onChange={(ev) => setEmail(ev.target.value)} placeholder="name@example.com" />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isPrimary} onCheckedChange={(v) => setIsPrimary(v === true)} id="primary-email" />
            <Label htmlFor="primary-email" className="text-sm">
              Primary
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingEmail ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


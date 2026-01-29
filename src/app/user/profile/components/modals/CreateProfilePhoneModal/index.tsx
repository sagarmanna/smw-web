"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { GenericPhone } from "@/components/user-details/types/common";

interface CreateProfilePhoneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (phone: GenericPhone) => void;
  editingPhone?: GenericPhone | null;
  // compatibility only
  location: string;
  entityId: number;
}

function newId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function CreateProfilePhoneModal({
  open,
  onClose,
  onSubmit,
  editingPhone,
}: CreateProfilePhoneModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [number, setNumber] = React.useState("");
  const [extension, setExtension] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    if (editingPhone) {
      setLabel(editingPhone.label || "Home");
      setNumber(editingPhone.number || "");
      setExtension(editingPhone.extension || "");
    } else {
      setLabel("Home");
      setNumber("");
      setExtension("");
    }
  }, [open, editingPhone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = number.trim();
    if (!trimmed) return;
    const result: GenericPhone = {
      id: editingPhone?.id || newId(),
      label,
      number: trimmed,
      extension: extension.trim() || undefined,
    };
    onSubmit?.(result);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Phone</DialogTitle>
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
                <SelectItem value="Mobile">Mobile</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-number">Number</Label>
            <Input
              id="phone-number"
              value={number}
              onChange={(ev) => setNumber(ev.target.value)}
              placeholder="(647) 294-6552"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-ext">Extension</Label>
            <Input
              id="phone-ext"
              value={extension}
              onChange={(ev) => setExtension(ev.target.value)}
              placeholder="Optional"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{editingPhone ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


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
import { RichTextEditor } from "@/components/RichTextEditor";

interface EditReminderNoteModalProps {
  open: boolean;
  onClose: () => void;
  location: string;
  value: string;
  onChange: (html: string) => void;
  onUpdate: () => void;
  isSaving?: boolean;
}

export function EditReminderNoteModal({
  open,
  onClose,
  location: _location,
  value,
  onChange,
  onUpdate,
  isSaving = false,
}: EditReminderNoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Update Reminder Notes</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <RichTextEditor
            value={value}
            onChange={onChange}
            mode="full"
            label="Notes"
            minHeight="300px"
            placeholder="Write reminder notes..."
            disabled={isSaving}
          />
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={isSaving}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



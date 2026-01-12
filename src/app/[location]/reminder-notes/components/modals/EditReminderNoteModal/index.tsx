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

import TipTapEmailEditor from "../../../../customers/components/EmailStatementModal/TipTapEmailEditor";
import "../../../../customers/components/EmailStatementModal/tiptap-styles.css";

interface EditReminderNoteModalProps {
  open: boolean;
  onClose: () => void;
  location: string;
  value: string;
  onChange: (html: string) => void;
  onUpdate: () => void;
  isSaving?: boolean;
  title?: string;
  submitLabel?: string;
}

export function EditReminderNoteModal({
  open,
  onClose,
  location,
  value,
  onChange,
  onUpdate,
  isSaving = false,
  title = "Update Reminder Notes",
  submitLabel = "Update",
}: EditReminderNoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <div className="text-sm font-medium">Notes</div>
          <TipTapEmailEditor
            content={value}
            onChange={onChange}
            localStorageKey={`reminder-notes-${location}`}
          />
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onUpdate} disabled={isSaving}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



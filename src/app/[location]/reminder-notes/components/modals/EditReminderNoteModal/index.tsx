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
  location, // required by API; passed but not used in this modal
  value,
  onChange,
  onUpdate,
  isSaving = false,
}: EditReminderNoteModalProps) {
  void location; // satisfy eslint; keep prop for API consistency
  return (
    <Dialog open={open} onOpenChange={(next) => (!next ? onClose() : undefined)}>
      <DialogContent className="sm:max-w-[1000px]">
        <DialogHeader>
          <DialogTitle>Update Reminder Notes</DialogTitle>
        </DialogHeader>

        {/* Editor scroll region: max-h leaves room for header/footer; stable gutter avoids layout shift */}
        <div
          className="max-h-[55vh] overflow-x-hidden overflow-y-scroll rounded-md border border-input [scrollbar-gutter:stable]"
          tabIndex={0}
        >
          <div className="space-y-2 p-4">
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



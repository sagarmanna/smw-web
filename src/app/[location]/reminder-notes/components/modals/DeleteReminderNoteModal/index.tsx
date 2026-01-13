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

interface DeleteReminderNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  confirmDisabled?: boolean;
  isDeleting?: boolean;
}

export function DeleteReminderNoteModal({
  open,
  onOpenChange,
  onConfirm,
  confirmDisabled = false,
  isDeleting = false,
}: DeleteReminderNoteModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Delete note?</DialogTitle>
        </DialogHeader>

        <div className="text-sm text-muted-foreground">
          Are you sure you want to delete this item?
        </div>

        <DialogFooter className="sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={confirmDisabled || isDeleting}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



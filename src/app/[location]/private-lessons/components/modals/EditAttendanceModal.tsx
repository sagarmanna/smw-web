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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EditAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  present: boolean;
  onSubmit: (present: boolean) => Promise<boolean>;
  saving?: boolean;
}

export function EditAttendanceModal({
  open,
  onClose,
  present,
  onSubmit,
  saving = false,
}: EditAttendanceModalProps) {
  const [isPresent, setIsPresent] = React.useState<boolean>(false);

  // Initialize checkbox when modal opens
  React.useEffect(() => {
    if (open) {
      setIsPresent(present);
    }
  }, [open, present]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const success = await onSubmit(isPresent);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Attendance</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center space-x-2 py-4">
            <Checkbox
              id="present"
              checked={isPresent}
              onCheckedChange={(checked) => setIsPresent(checked === true)}
            />
            <Label
              htmlFor="present"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Present
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


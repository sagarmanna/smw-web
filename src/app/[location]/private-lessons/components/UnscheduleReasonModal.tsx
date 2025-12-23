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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface UnscheduleReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (reason: string) => void;
}

const UNSCHEDULE_REASONS = [
  "the student cancelled",
  "the teacher cancelled",
  "the school closed due to the weather",
  "Other",
] as const;

export function UnscheduleReasonModal({
  open,
  onOpenChange,
  onSave,
}: UnscheduleReasonModalProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>("");

  // Reset when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedReason("");
    }
  }, [open]);

  const handleSave = React.useCallback(() => {
    if (!selectedReason) {
      return;
    }
    onSave(selectedReason);
    onOpenChange(false);
  }, [selectedReason, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setSelectedReason("");
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Reason To Unschedule
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-base font-semibold">Reason To Unschedule ?</Label>
          <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
            {UNSCHEDULE_REASONS.map((reason) => (
              <div key={reason} className="flex items-center space-x-2">
                <RadioGroupItem value={reason} id={reason} />
                <Label htmlFor={reason} className="cursor-pointer font-normal">
                  {reason}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!selectedReason}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


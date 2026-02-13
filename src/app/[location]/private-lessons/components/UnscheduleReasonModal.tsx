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
import { getReasonToUnschedule, type ReasonToUnscheduleItem } from "../actionApi/unschedule.api";

interface UnscheduleReasonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  onSave: (reason: string) => Promise<boolean>;
}

export function UnscheduleReasonModal({
  open,
  onOpenChange,
  location,
  onSave,
}: UnscheduleReasonModalProps) {
  const [selectedReason, setSelectedReason] = React.useState<string>("");
  const [reasons, setReasons] = React.useState<ReasonToUnscheduleItem[]>([]);
  const [title, setTitle] = React.useState<string>("Reason To Unschedule");
  const [isLoadingReasons, setIsLoadingReasons] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch reasons from API when modal opens
  React.useEffect(() => {
    if (!open) {
      setSelectedReason("");
      return;
    }

    let isCancelled = false;
    setIsLoadingReasons(true);

    getReasonToUnschedule(location)
      .then((res) => {
        if (isCancelled || !res?.data) return;
        setTitle(res.data.title ?? "Reason To Unschedule");
        setReasons(Array.isArray(res.data.reasons) ? res.data.reasons : []);
      })
      .catch(() => {
        if (!isCancelled) setReasons([]);
      })
      .finally(() => {
        if (!isCancelled) setIsLoadingReasons(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [open, location]);

  const handleSave = React.useCallback(async () => {
    if (!selectedReason) return;
    setIsSaving(true);
    try {
      const success = await onSave(selectedReason);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
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
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Label className="text-base font-semibold">Reason To Unschedule ?</Label>
          {isLoadingReasons ? (
            <p className="text-sm text-muted-foreground">Loading reasons...</p>
          ) : (
            <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
              {reasons.map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.reason} id={`reason-${item.id}`} />
                  <Label
                    htmlFor={`reason-${item.id}`}
                    className="cursor-pointer font-normal"
                  >
                    {item.reason}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!selectedReason || isSaving || isLoadingReasons}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

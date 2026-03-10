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
import { Textarea } from "@/components/ui/textarea";
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
  const [otherReasonNote, setOtherReasonNote] = React.useState<string>("");
  const [reasons, setReasons] = React.useState<ReasonToUnscheduleItem[]>([]);
  const [title, setTitle] = React.useState<string>("Reason To Unschedule");
  const [isLoadingReasons, setIsLoadingReasons] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Fetch reasons from API when modal opens
  React.useEffect(() => {
    if (!open) {
      setSelectedReason("");
      setOtherReasonNote("");
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

  const isOtherReasonSelected = React.useMemo(
    () => selectedReason.trim().toLowerCase() === "other",
    [selectedReason]
  );

  const canSave = React.useMemo(() => {
    if (!selectedReason || isLoadingReasons || isSaving) return false;
    if (!isOtherReasonSelected) return true;
    return otherReasonNote.trim().length > 0;
  }, [selectedReason, isLoadingReasons, isSaving, isOtherReasonSelected, otherReasonNote]);

  const handleSave = React.useCallback(async () => {
    if (!canSave) return;
    const reasonToSave = isOtherReasonSelected ? otherReasonNote.trim() : selectedReason;
    setIsSaving(true);
    try {
      const success = await onSave(reasonToSave);
      if (success) {
        onOpenChange(false);
      }
    } finally {
      setIsSaving(false);
    }
  }, [canSave, isOtherReasonSelected, otherReasonNote, selectedReason, onSave, onOpenChange]);

  const handleCancel = React.useCallback(() => {
    setSelectedReason("");
    setOtherReasonNote("");
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
          {isOtherReasonSelected && (
            <div className="space-y-2">
              <Label htmlFor="unschedule-other-note" className="font-normal">
                Please specify
              </Label>
              <Textarea
                id="unschedule-other-note"
                value={otherReasonNote}
                onChange={(e) => setOtherReasonNote(e.target.value)}
                placeholder="Enter note"
                rows={3}
                disabled={isSaving}
                className="resize-none"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!canSave}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

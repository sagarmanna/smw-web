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
import { Input } from "@/components/ui/input";

interface EditCostModalProps {
  open: boolean;
  onClose: () => void;
  costPerHour: string;
  onSubmit: (data: { costPerHour?: string; cost?: string; price?: string }) => Promise<boolean>;
  saving?: boolean;
}

export function EditCostModal({
  open,
  onClose,
  costPerHour,
  onSubmit,
  saving = false,
}: EditCostModalProps) {
  const [teacherCost, setTeacherCost] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  // Initialize cost when modal opens
  React.useEffect(() => {
    if (open) {
      // Remove $ sign and any formatting for input
      const cleanValue = costPerHour?.replace("$", "").trim() || "";
      setTeacherCost(cleanValue);
      setError("");
    }
  }, [open, costPerHour]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!teacherCost.trim()) {
      setError("Teacher Cost is required.");
      return;
    }

    setError("");

    // Format with $ sign if not already present
    const formattedCost = teacherCost.trim().startsWith("$")
      ? teacherCost.trim()
      : `$${teacherCost.trim()}`;

    const success = await onSubmit({ costPerHour: formattedCost });
    if (success) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTeacherCost(value);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Cost</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teacher-cost" className="font-semibold">
              Teacher Cost
            </Label>
            <Input
              id="teacher-cost"
              type="text"
              value={teacherCost}
              onChange={handleInputChange}
              placeholder="Enter teacher cost"
              className={error ? "border-red-500" : ""}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
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
            <Button type="submit" disabled={saving || !teacherCost.trim()}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


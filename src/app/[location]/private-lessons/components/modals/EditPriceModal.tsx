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

interface EditPriceModalProps {
  open: boolean;
  onClose: () => void;
  lessonRatePerHour: string;
  onSubmit: (rate: string) => Promise<boolean>;
  saving?: boolean;
}

export function EditPriceModal({
  open,
  onClose,
  lessonRatePerHour,
  onSubmit,
  saving = false,
}: EditPriceModalProps) {
  const [rate, setRate] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  // Initialize rate when modal opens
  React.useEffect(() => {
    if (open) {
      // Remove $ sign and any formatting for input
      const cleanValue = lessonRatePerHour?.replace("$", "").trim() || "";
      setRate(cleanValue);
      setError("");
    }
  }, [open, lessonRatePerHour]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!rate.trim()) {
      setError("Program Rate Per Hour is required.");
      return;
    }

    setError("");

    // Format with $ sign if not already present
    const formattedRate = rate.trim().startsWith("$")
      ? rate.trim()
      : `$${rate.trim()}`;

    const success = await onSubmit(formattedRate);
    if (success) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRate(value);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Price</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="program-rate" className="font-semibold">
              Program Rate Per Hour
            </Label>
            <Input
              id="program-rate"
              type="text"
              value={rate}
              onChange={handleInputChange}
              placeholder="Enter rate"
              className={error ? "border-red-500" : "border-green-500"}
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
              Close
            </Button>
            <Button type="submit" disabled={saving || !rate.trim()}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


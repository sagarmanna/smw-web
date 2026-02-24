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

interface EditTaxModalProps {
  open: boolean;
  onClose: () => void;
  tax: string;
  onSubmit: (tax: string) => Promise<boolean>;
  saving?: boolean;
}

export function EditTaxModal({
  open,
  onClose,
  tax,
  onSubmit,
  saving = false,
}: EditTaxModalProps) {
  const [value, setValue] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  // Initialize value when modal opens
  React.useEffect(() => {
    if (open) {
      // Remove $ sign and any formatting for input
      const cleanValue = tax?.replace("$", "").trim() || "";
      setValue(cleanValue);
      setError("");
    }
  }, [open, tax]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!value.trim()) {
      setError("Tax is required.");
      return;
    }

    setError("");

    // Format with $ sign if not already present
    const formattedValue = value.trim().startsWith("$")
      ? value.trim()
      : `$${value.trim()}`;

    const success = await onSubmit(formattedValue);
    if (success) {
      onClose();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Tax</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tax-value" className="font-semibold">
              Tax
            </Label>
            <Input
              id="tax-value"
              type="text"
              value={value}
              onChange={handleInputChange}
              placeholder="Enter tax"
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
            <Button type="submit" disabled={saving || !value.trim()}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

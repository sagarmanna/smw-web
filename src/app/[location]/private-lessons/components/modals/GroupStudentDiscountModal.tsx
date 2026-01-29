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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupStudentDiscountModalProps {
  open: boolean;
  onClose: () => void;
  discount: string;
  onSubmit: (discount: string) => Promise<boolean>;
  saving?: boolean;
}

export function GroupStudentDiscountModal({
  open,
  onClose,
  discount,
  onSubmit,
  saving = false,
}: GroupStudentDiscountModalProps) {
  const [discountType, setDiscountType] = React.useState<"$" | "%">("$");
  const [discountValue, setDiscountValue] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  // Initialize when modal opens
  React.useEffect(() => {
    if (!open) return;

    setError("");

    // Try to infer type/value from existing discount string like "$10.00" or "10%"
    const trimmed = (discount || "").trim();
    if (!trimmed) {
      setDiscountType("$");
      setDiscountValue("");
      return;
    }

    if (trimmed.endsWith("%")) {
      setDiscountType("%");
      setDiscountValue(trimmed.replace("%", "").trim());
    } else if (trimmed.startsWith("$")) {
      setDiscountType("$");
      setDiscountValue(trimmed.replace("$", "").trim());
    } else {
      // Fallback: treat as dollar amount
      setDiscountType("$");
      setDiscountValue(trimmed);
    }
  }, [open, discount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!discountValue.trim()) {
      setError("Discount is required.");
      return;
    }

    setError("");

    const numeric = Number(discountValue);
    if (Number.isNaN(numeric) || numeric < 0) {
      setError("Please enter a valid discount amount.");
      return;
    }

    const formatted =
      discountType === "$"
        ? `$${numeric.toFixed(2)}`
        : `${numeric.toFixed(2)}%`;

    const success = await onSubmit(formatted);
    if (success) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDiscountValue(e.target.value);
    setError("");
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You have entered a non-approved Arcadia discount. All
              non-approved discounts must be submitted in writing and approved
              by Head Office prior to entering a discount, otherwise you are in
              breach of your agreement.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="group-student-discount" className="font-semibold">
              Discount
            </Label>
            <div className="flex items-center gap-3">
              {/* $ / % toggle */}
              <div className="flex gap-1 border rounded-md overflow-hidden bg-background">
                <button
                  type="button"
                  onClick={() => setDiscountType("$")}
                  className={cn(
                    "text-sm px-4 py-1.5 transition-colors",
                    discountType === "$"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType("%")}
                  className={cn(
                    "text-sm px-4 py-1.5 transition-colors",
                    discountType === "%"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  %
                </button>
              </div>

              <div className="flex-1 flex items-center gap-2">
                {discountType === "$" && (
                  <span className="text-muted-foreground">$</span>
                )}
                <Input
                  id="group-student-discount"
                  type="number"
                  step="0.01"
                  value={discountValue}
                  onChange={handleChange}
                  className={error ? "border-red-500" : ""}
                />
                {discountType === "%" && (
                  <span className="text-muted-foreground">%</span>
                )}
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
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
            <Button type="submit" disabled={saving || !discountValue.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


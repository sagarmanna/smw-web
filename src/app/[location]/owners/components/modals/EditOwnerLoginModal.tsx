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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditOwnerLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    pin?: string;
    merge: boolean;
    password?: string;
    confirmPassword?: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

export function EditOwnerLoginModal({
  open,
  onClose,
  onSubmit,
}: EditOwnerLoginModalProps) {
  const [pin, setPin] = React.useState("");
  const [canMerge, setCanMerge] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = React.useCallback(() => {
    setPin("");
    setCanMerge(false);
    setPassword("");
    setConfirmPassword("");
    setError(null);
  }, []);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open, resetForm]);

  const handleClose = React.useCallback(() => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  }, [isSubmitting, resetForm, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedPin = pin.trim();

    // PIN & Can Merge validation
    if (canMerge) {
      // When Can Merge is enabled, PIN is required and must be a 4-digit number between 1111 and 9999
      if (!trimmedPin) {
        setError("Pin must be no less than 1111");
        return;
      }

      if (!/^\d+$/.test(trimmedPin)) {
        setError("PIN must contain only numbers");
        return;
      }

      const pinNumber = parseInt(trimmedPin, 10);

      if (isNaN(pinNumber) || pinNumber < 1111) {
        setError("Pin must be no less than 1111");
        return;
      }

      if (pinNumber > 9999) {
        setError("Pin must be no greater than 9999");
        return;
      }
    } else if (trimmedPin) {
      // When Can Merge is not enabled, PIN is optional but if provided it must still be numeric and up to 4 digits (<= 9999)
      if (!/^\d+$/.test(trimmedPin)) {
        setError("PIN must contain only numbers");
        return;
      }

      if (trimmedPin.length > 4 || parseInt(trimmedPin, 10) > 9999) {
        setError("PIN must not exceed 9999");
        return;
      }
    }

    // Password validation
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        pin: pin.trim() || undefined,
        merge: canMerge,
        password: password.trim() || undefined,
        confirmPassword: confirmPassword.trim() || undefined,
      });

      if (result.success) {
        toast.success(result.message || "Login credentials updated successfully");
        resetForm();
        onClose();
      } else {
        // Use the error message from the API response
        const errorMsg = result.message || "Failed to update login credentials";
        toast.error(errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      // This catch block should rarely be hit since onSubmit handles errors
      // But if it does, try to extract a meaningful message
      let errorMsg = "An error occurred while updating login credentials";
      if (err instanceof Error) {
        errorMsg = err.message;
      } else if (err && typeof err === 'object' && 'message' in err) {
        const errorObj = err as { message?: string | string[] };
        if (Array.isArray(errorObj.message)) {
          errorMsg = errorObj.message.join(", ");
        } else if (typeof errorObj.message === 'string') {
          errorMsg = errorObj.message;
        }
      }
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value && !isSubmitting) {
          handleClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Set Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Password Fields - Always visible */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter password"
                disabled={isSubmitting}
                required
                minLength={6}
                aria-describedby={error ? "password-error" : "password-help"}
              />
              <p id="password-help" className="text-xs text-muted-foreground">
                Minimum 6 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Confirm password"
                disabled={isSubmitting}
                required
                aria-describedby={error ? "confirm-password-error" : undefined}
              />
            </div>
          </div>

          {/* Pin Field */}
          <div className="space-y-2">
            <Label htmlFor="pin" className="text-green-600 dark:text-green-400">
              Pin
            </Label>
            <Input
              id="pin"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={pin}
              onChange={(e) => {
                // Only allow numeric input, max 4 digits
                const value = e.target.value.replace(/\D/g, "").slice(0, 4);
                setPin(value);
                if (error) setError(null);
              }}
              placeholder="Enter PIN (max 4 digits)"
              disabled={isSubmitting}
              maxLength={4}
              aria-describedby={error ? "pin-error" : undefined}
            />
          </div>

          {/* Can Merge Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can-merge"
              checked={canMerge}
              onCheckedChange={(checked) => {
                setCanMerge(checked === true);
                if (error) setError(null);
              }}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="can-merge"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Can Merge
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

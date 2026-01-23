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

interface EditStaffMemberLoginModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    pin?: string;
    canLogin: boolean;
    password?: string;
    confirmPassword?: string;
  }) => Promise<boolean>;
  successMessage?: string;
  errorMessage?: string;
}

export function EditStaffMemberLoginModal({
  open,
  onClose,
  onSubmit,
  successMessage = "Login credentials updated successfully",
  errorMessage = "Failed to update login credentials",
}: EditStaffMemberLoginModalProps) {
  const [pin, setPin] = React.useState("");
  const [canLogin, setCanLogin] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const resetForm = React.useCallback(() => {
    setPin("");
    setCanLogin(false);
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

    // PIN validation - must be numeric if provided
    if (pin.trim() && !/^\d+$/.test(pin.trim())) {
      setError("PIN must contain only numbers");
      return;
    }

    // PIN length validation (reasonable range: 4-10 digits)
    if (pin.trim() && (pin.trim().length < 4 || pin.trim().length > 10)) {
      setError("PIN must be between 4 and 10 digits");
      return;
    }

    // Password validation when canLogin is checked
    if (canLogin) {
      if (!password.trim()) {
        setError("Password is required when 'Can Login' is enabled");
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit({
        pin: pin.trim() || undefined,
        canLogin,
        password: canLogin && password ? password.trim() : undefined,
        confirmPassword: canLogin && confirmPassword ? confirmPassword.trim() : undefined,
      });

      if (success) {
        toast.success(successMessage);
        resetForm();
        onClose();
      } else {
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCanLoginChange = (checked: boolean) => {
    setCanLogin(checked);
    if (!checked) {
      // Clear password fields when unchecked
      setPassword("");
      setConfirmPassword("");
    }
    if (error) setError(null);
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
          <DialogTitle>Edit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400">
              {error}
            </div>
          )}

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
                // Only allow numeric input
                const value = e.target.value.replace(/\D/g, "");
                setPin(value);
                if (error) setError(null);
              }}
              placeholder="Enter PIN (4-10 digits)"
              disabled={isSubmitting}
              maxLength={10}
              aria-describedby={error ? "pin-error" : undefined}
            />
          </div>

          {/* Can Login Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="can-login"
              checked={canLogin}
              onCheckedChange={(checked) => {
                handleCanLoginChange(checked === true);
              }}
              disabled={isSubmitting}
            />
            <Label
              htmlFor="can-login"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Can Login
            </Label>
          </div>

          {/* Password Fields - Only show when Can Login is checked */}
          {canLogin && (
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
                  required={canLogin}
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
                  required={canLogin}
                  aria-describedby={error ? "confirm-password-error" : undefined}
                />
              </div>
            </div>
          )}

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

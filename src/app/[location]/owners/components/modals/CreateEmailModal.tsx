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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OwnerEmail } from "../../types";
import {
  addOwnerEmail,
  updateOwnerEmail,
  validateOwnerEmail,
} from "../../[id]/owners-details.api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CreateEmailModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (email: OwnerEmail) => void;
  editingEmail?: OwnerEmail | null;
  location: string;
  ownerId: number;
  onUpdateEmails?: (emails: OwnerEmail[]) => void;
  currentEmails?: OwnerEmail[];
}

export function CreateEmailModal({
  open,
  onClose,
  onSubmit,
  editingEmail = null,
  location,
  ownerId,
  onUpdateEmails,
  currentEmails = [],
}: CreateEmailModalProps) {
  const [label, setLabel] = React.useState("Work");
  const [email, setEmail] = React.useState("");
  const [note, setNote] = React.useState("");
  const [isPrimary, setIsPrimary] = React.useState(false);
  const [errors, setErrors] = React.useState({ email: "" });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = React.useState(false);

  const emailValidationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (emailValidationTimerRef.current) {
        clearTimeout(emailValidationTimerRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    if (editingEmail) {
      setLabel(editingEmail.label || "Work");
      setEmail(editingEmail.email || "");
      setNote(editingEmail.note || "");
      setIsPrimary(editingEmail.isPrimary || false);
    } else {
      setLabel("Work");
      setEmail("");
      setNote("");
      setIsPrimary((currentEmails ?? []).length === 0);
    }
    setErrors({ email: "" });
  }, [editingEmail, open, currentEmails]);

  const resetForm = () => {
    setLabel("Work");
    setEmail("");
    setNote("");
    setIsPrimary(false);
    setErrors({ email: "" });
  };

  const validateEmailFormat = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const isEmailDuplicate = (value: string) => {
    const normalized = value.trim().toLowerCase();
    return currentEmails.some((e) => {
      if (editingEmail && e.id === editingEmail.id) {
        return false;
      }
      return e.email.toLowerCase() === normalized;
    });
  };

  const validateEmailWithAPI = async (value: string) => {
    try {
      setIsValidatingEmail(true);
      const result = await validateOwnerEmail(location, value);

      if (result?.success) {
        const { exists } = result.data;
        if (exists) {
          setErrors({
            email: "This email is already registered for a user in this location.",
          });
        } else {
          setErrors((prev) => {
            const newErrors = { ...prev };
            if (newErrors.email?.includes("already registered")) {
              newErrors.email = "";
            }
            return newErrors;
          });
        }
      }
    } catch (err) {
      console.error("Error validating owner email:", err);
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (errors.email) setErrors({ email: "" });

    const trimmed = value.trim();

    if (emailValidationTimerRef.current) {
      clearTimeout(emailValidationTimerRef.current);
    }

    if (!trimmed) {
      setIsValidatingEmail(false);
      return;
    }

    if (!validateEmailFormat(trimmed)) {
      setIsValidatingEmail(false);
      return;
    }

    if (isEmailDuplicate(trimmed)) {
      setErrors({
        email:
          "This email is already used on this owner record. Please use a different email.",
      });
      setIsValidatingEmail(false);
      return;
    }

    emailValidationTimerRef.current = setTimeout(() => {
      validateEmailWithAPI(trimmed);
    }, 500);
  };

  const validateForm = () => {
    const newErrors = { email: "" };
    const trimmed = email.trim();

    if (!trimmed) {
      newErrors.email = "Email cannot be blank.";
    } else if (!validateEmailFormat(trimmed)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (isEmailDuplicate(trimmed)) {
      newErrors.email =
        "This email is already used on this owner record. Please use a different email.";
    }

    setErrors(newErrors);
    return newErrors.email === "";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isValidatingEmail) {
      return;
    }

    if (!validateForm()) return;

    setIsSubmitting(true);
    setErrors({ email: "" });

    try {
      const effectiveIsPrimary =
        !editingEmail && (currentEmails ?? []).length === 0 ? true : isPrimary;

      const baseData = {
        email: email.trim(),
        note: note.trim() || undefined,
        label: label.trim() || "Work",
        isPrimary: effectiveIsPrimary,
      };

      const result = editingEmail
        ? await updateOwnerEmail(
            location,
            ownerId,
            Number(editingEmail.id),
            {
              ...baseData,
            }
          )
        : await addOwnerEmail(location, ownerId, baseData);

      if (result?.success && result.data) {
        toast.success(
          editingEmail ? "Email updated successfully" : "Email added successfully"
        );

        const transformedEmails: OwnerEmail[] = result.data.map(
          (item: {
            id: number;
            email: string;
            note?: string;
            label?: string;
            isPrimary?: boolean;
          }) => {
            return {
              id: item.id?.toString() || String(item.id),
              label: item.label || "Work",
              email: item.email,
              note: item.note || undefined,
              isPrimary: item.isPrimary === true,
            };
          }
        );

        if (onUpdateEmails) {
          onUpdateEmails(transformedEmails);
        }

        if (onSubmit && transformedEmails.length > 0) {
          const latest = transformedEmails.find(
            (t) => t.email.toLowerCase() === baseData.email.toLowerCase()
          );
          if (latest) {
            onSubmit(latest);
          }
        }

        resetForm();
        onClose();
      } else {
        setErrors({ email: result?.message || "Failed to save email" });
      }
    } catch (err) {
      console.error("Error saving email:", err);
      setErrors({ email: "Failed to save email. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!value) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Email</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {editingEmail && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              Editing email
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email-address">
              Email <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="email-address"
                type="text"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
                disabled={isSubmitting}
              />
              {isValidatingEmail && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-label">Label</Label>
            <Select
              value={label}
              onValueChange={setLabel}
              disabled={isSubmitting}
            >
              <SelectTrigger id="email-label">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-note">Note</Label>
            <Textarea
              id="email-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Enter note"
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isValidatingEmail}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


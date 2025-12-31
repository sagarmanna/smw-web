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
import { StaffMemberPhone } from "../../types";
import {
  addStaffMemberPhone,
  updateStaffMemberPhone,
} from "../../[id]/staff-members-details.api";
import { toast } from "sonner";

interface CreatePhoneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (phone: StaffMemberPhone) => void;
  editingPhone?: StaffMemberPhone | null;
  location: string;
  staffMemberId: number;
  onUpdatePhones?: (phones: StaffMemberPhone[]) => void;
  onRefresh?: () => Promise<void>;
}

const formatPhoneNumber = (value: string) => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

export function CreatePhoneModal({
  open,
  onClose,
  onSubmit,
  editingPhone = null,
  location,
  staffMemberId,
  onUpdatePhones,
  onRefresh,
}: CreatePhoneModalProps) {
  const [label, setLabel] = React.useState("Work");
  const [number, setNumber] = React.useState("");
  const [extension, setExtension] = React.useState("");
  const [note, setNote] = React.useState("");
  const [errors, setErrors] = React.useState<{ number: string; extension: string }>({
    number: "",
    extension: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (editingPhone) {
      setLabel(editingPhone.label || "Work");
      setNumber(editingPhone.number || "");
      setExtension(editingPhone.extension || "");
      setNote(editingPhone.note || "");
    } else {
      setLabel("Work");
      setNumber("");
      setExtension("");
      setNote("");
    }
    setErrors({ number: "", extension: "" });
  }, [editingPhone, open]);

  const resetForm = () => {
    setLabel("Work");
    setNumber("");
    setExtension("");
    setNote("");
    setErrors({ number: "", extension: "" });
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNumber(formatted);
    if (errors.number || errors.extension) {
      setErrors((prev) => ({ ...prev, number: "" }));
    }
  };

  const handleExtensionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    const digitsOnly = raw.replace(/\D/g, "");
    setExtension(digitsOnly);

    if (raw && raw !== digitsOnly) {
      setErrors((prev) => ({
        ...prev,
        extension: "Extension must be an integer.",
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        extension: "",
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedNumber = number.trim();
    const trimmedExtension = extension.trim();

    const newErrors: { number: string; extension: string } = { number: "", extension: "" };

    if (!trimmedNumber) {
      newErrors.number = "Number cannot be blank.";
    }

    if (trimmedExtension && !/^\d+$/.test(trimmedExtension)) {
      newErrors.extension = "Extension must be an integer.";
    }

    if (newErrors.number || newErrors.extension) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const phoneData = {
        number: trimmedNumber,
        extension: trimmedExtension ? parseInt(trimmedExtension, 10) : undefined,
        note: note.trim() || undefined,
        label: label.trim() || "Work",
        isPrimary: false,
      };

      const result = editingPhone
        ? await updateStaffMemberPhone(
            location,
            staffMemberId,
            Number(editingPhone.id),
            phoneData
          )
        : await addStaffMemberPhone(location, staffMemberId, phoneData);

      if (result?.success && result.data && Array.isArray(result.data)) {
        toast.success(
          editingPhone
            ? "Phone number updated successfully"
            : "Phone number added successfully"
        );

        const transformedPhones: StaffMemberPhone[] = result.data.map((item: {
          id: number;
          number: string;
          extension?: string | number;
          note?: string;
          label?: string;
        }) => {
          return {
            id: item.id?.toString() || String(item.id),
            label: item.label || "Work",
            number: item.number || "",
            extension: item.extension 
              ? (typeof item.extension === "string" && item.extension.trim() !== "" 
                  ? item.extension 
                  : typeof item.extension === "number" 
                    ? item.extension.toString() 
                    : undefined)
              : undefined,
            note: item.note && item.note.trim() !== "" ? item.note : undefined,
          };
        });

        if (onUpdatePhones) {
          onUpdatePhones(transformedPhones);
        }

        if (onSubmit && transformedPhones.length > 0) {
          const latest = transformedPhones.find(
            (p) => p.number === phoneData.number
          );
          if (latest) {
            onSubmit(latest);
          }
        }

        resetForm();
        onClose();

        if (onRefresh) {
          await onRefresh();
        }
      } else {
        toast.error(result?.message || "Failed to save phone number");
      }
    } catch (err) {
      console.error("Error saving phone:", err);
      toast.error("Failed to save phone number. Please try again.");
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
          <DialogTitle>Phone</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone-number">
              Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="phone-number"
              type="tel"
              value={number}
              onChange={handlePhoneNumberChange}
              placeholder="(___) ___-____"
              maxLength={14}
              className={errors.number ? "border-red-500" : ""}
            />
            {errors.number && (
              <p className="text-sm text-red-500">{errors.number}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-label">Label</Label>
            <Select
              value={label}
              onValueChange={setLabel}
              disabled={isSubmitting}
            >
              <SelectTrigger id="phone-label">
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
            <Label htmlFor="phone-extension">Extension</Label>
            <Input
              id="phone-extension"
              type="text"
              value={extension}
              onChange={handleExtensionChange}
              placeholder="Enter extension"
              disabled={isSubmitting}
            />
            {errors.extension && (
              <p className="text-sm text-red-500">{errors.extension}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone-note">Note</Label>
            <Textarea
              id="phone-note"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


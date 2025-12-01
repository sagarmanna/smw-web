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
import { TeacherPhone } from "../../types";
import {
  addTeacherPhone,
  updateTeacherPhone,
} from "../../[id]/teachers-details.api";
import { toast } from "sonner";

interface CreatePhoneModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (phone: TeacherPhone) => void;
  editingPhone?: TeacherPhone | null;
  location: string;
  teacherId: number;
  onUpdatePhones?: (phones: TeacherPhone[]) => void;
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
  teacherId,
  onUpdatePhones,
  onRefresh,
}: CreatePhoneModalProps) {
  const [label, setLabel] = React.useState("Home");
  const [number, setNumber] = React.useState("");
  const [extension, setExtension] = React.useState("");
  const [note, setNote] = React.useState("");
  const [errors, setErrors] = React.useState<{ number: string }>({
    number: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (editingPhone) {
      setLabel(editingPhone.label || "Home");
      setNumber(editingPhone.number || "");
      setExtension(editingPhone.extension || "");
      setNote(editingPhone.note || "");
    } else {
      setLabel("Home");
      setNumber("");
      setExtension("");
      setNote("");
    }
    setErrors({ number: "" });
  }, [editingPhone, open]);

  const resetForm = () => {
    setLabel("Home");
    setNumber("");
    setExtension("");
    setNote("");
    setErrors({ number: "" });
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setNumber(formatted);
    if (errors.number) {
      setErrors({ number: "" });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!number.trim()) {
      setErrors({ number: "Number cannot be blank." });
      return;
    }

    setIsSubmitting(true);

    try {
      const phoneData = {
        number: number.trim(),
        extension: extension.trim() ? parseInt(extension.trim()) : undefined,
        note: note.trim() || undefined,
        label: label.trim() || "Home",
        isPrimary: false,
      };

      const result = editingPhone
        ? await updateTeacherPhone(
            location,
            teacherId,
            Number(editingPhone.id),
            phoneData
          )
        : await addTeacherPhone(location, teacherId, phoneData);

      if (result?.success && result.data && Array.isArray(result.data)) {
        toast.success(
          editingPhone
            ? "Phone number updated successfully"
            : "Phone number added successfully"
        );

        // Transform API response - handle nested structure from API
        const transformedPhones: TeacherPhone[] = result.data.map((item: {
          id: number;
          number: string;
          extension?: string | number;
          note?: string;
          label?: string;
          isPrimary?: boolean;
          contact?: {
            label?: string;
            labelId?: number;
            isPrimary?: boolean | number;
          };
          userContact?: {
            label?: string;
            labelId?: number;
            isPrimary?: boolean | number;
          };
        }) => {
          // API response has nested structure: item.contact.label, item.contact.isPrimary
          const contact = item.contact || item.userContact || {};
          const labelMap: Record<number, string> = {
            1: "Home",
            2: "Work",
            3: "Other",
          };

          return {
            id: item.id?.toString() || String(item.id),
            label: contact.label || (contact.labelId ? labelMap[contact.labelId] : undefined) || item.label || "Home",
            number: item.number || "",
            extension: item.extension 
              ? (typeof item.extension === "string" && item.extension.trim() !== "" 
                  ? item.extension 
                  : typeof item.extension === "number" 
                    ? item.extension.toString() 
                    : undefined)
              : undefined,
            note: item.note && item.note.trim() !== "" ? item.note : undefined,
            isPrimary: contact.isPrimary === 1 || contact.isPrimary === true || item.isPrimary === true,
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

        // Ensure latest data is reflected from server
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
              onChange={(event) => setExtension(event.target.value)}
              placeholder="Enter extension"
              disabled={isSubmitting}
            />
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


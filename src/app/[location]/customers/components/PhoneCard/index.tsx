"use client";

import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  createCustomerPhone,
  updateCustomerPhone,
  deleteCustomerPhone,
  PhoneData,
} from "../PhoneCard/phoneCardApi";
import { toast } from "sonner"; 

interface PhoneNumber {
  id: string;
  label: string;
  number: string;
  extension?: string;
  note?: string;
  isPrimary?: boolean;
}

interface PhoneCardProps {
  phones?: PhoneNumber[];
  onAddClick?: () => void;
  onSave?: (phones: PhoneNumber[]) => void;
  className?: string;
  loading?: boolean;
  location: string;
  customerId: number;
}

export function PhoneCard({
  phones = [],
  onAddClick,
  onSave,
  className,
  loading = false,
  location,
  customerId,
}: PhoneCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneNumber | null>(null);
  const [currentPhone, setCurrentPhone] = useState({
    label: "Home",
    number: "",
    extension: "",
    note: "",
    isPrimary: false,
  });
  const [errors, setErrors] = useState({ number: "" });
  const [isSaving, setIsSaving] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
        10
      )}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setCurrentPhone({ ...currentPhone, number: formatted });
    if (errors.number) setErrors({ number: "" });
  };

  const validateForm = () => {
    const newErrors = { number: "" };
    const digitsOnly = currentPhone.number.replace(/\D/g, "");
    if (digitsOnly.trim() === "") newErrors.number = "Number cannot be blank.";
    else if (digitsOnly.length !== 10)
      newErrors.number = "Please enter a valid 10-digit phone number.";
    setErrors(newErrors);
    return newErrors.number === "";
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
    setEditingPhone(null);
    setCurrentPhone({
      label: "Home",
      number: "",
      extension: "",
      note: "",
      isPrimary: false,
    });
    setErrors({ number: "" });
    if (onAddClick) onAddClick();
  };

  const handleEditClick = (e: React.MouseEvent, phone: PhoneNumber) => {
    e.stopPropagation();
    setIsModalOpen(true);
    setEditingPhone(phone);
    setCurrentPhone({
      label: phone.label,
      number: phone.number,
      extension: phone.extension || "",
      note: phone.note || "",
      isPrimary: phone.isPrimary || false,
    });
    setErrors({ number: "" });
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setIsSaving(true);

    try {
      const response = await deleteCustomerPhone(location, customerId, id);

      if (response?.success) {
        const updatedPhones = phones.filter((phone) => phone.id !== id);
        if (onSave) onSave(updatedPhones);

        toast.success("Phone number deleted successfully");
      } else {
        toast.error(response?.message || "Failed to delete phone number");
      }
    } catch (error) {
      console.error("Error deleting phone:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const phoneData = {
        number: currentPhone.number,
        extension: currentPhone.extension
          ? parseInt(currentPhone.extension)
          : undefined,
        note: currentPhone.note,
        label: currentPhone.label,
        isPrimary: currentPhone.isPrimary,
      };

      let response;

      if (editingPhone) {
        response = await updateCustomerPhone(location, customerId, {
          id: parseInt(editingPhone.id),
          ...phoneData,
        });
      } else {
        response = await createCustomerPhone(location, customerId, phoneData);
      }

      if (response?.success && response.data) {
        const formattedPhones: PhoneNumber[] = response.data.map(
          (phone: PhoneData) => ({
            id: phone.id.toString(),
            label: phone.label,
            number: phone.number,
            extension: phone.extension?.toString(),
            note: phone.note,
            isPrimary: phone.isPrimary,
          })
        );

        if (onSave) onSave(formattedPhones);

        toast.success(
          editingPhone
            ? "Phone number updated successfully"
            : "Phone number created successfully"
        );

        setIsModalOpen(false);
        setEditingPhone(null);
        setCurrentPhone({
          label: "Home",
          number: "",
          extension: "",
          note: "",
          isPrimary: false,
        });
        setErrors({ number: "" });
      } else {
        toast.error(response?.message || "Failed to save phone number");
      }
    } catch (error) {
      console.error("Error saving phone:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingPhone(null);
    setCurrentPhone({
      label: "Home",
      number: "",
      extension: "",
      note: "",
      isPrimary: false,
    });
    setErrors({ number: "" });
    setIsModalOpen(false);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
      disabled: isSaving,
    },
    {
      label: isSaving ? "Saving..." : "Save",
      onClick: handleSave,
      variant: "default" as const,
      disabled: isSaving,
    },
  ];

  return (
    <>
      <InfoCard
        title="Phone"
        onAddClick={handleAddClick}
        className={className}
        loading={loading}
      >
        <div className="space-y-2">
          {loading ? (
            <>
              {[...Array(2)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded -mx-2"
                >
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : phones.length > 0 ? (
            phones.map((phone) => (
              <div
                key={phone.id}
                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -mx-2 group"
              >
                <KeyValueDisplay
                  label={phone.label}
                  value={`${phone.number}${
                    phone.extension ? ` Ext: ${phone.extension}` : ""
                  }${phone.note ? ` - ${phone.note}` : ""}`}
                  className="justify-start flex-1"
                />
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditClick(e, phone)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    aria-label="Edit phone"
                    disabled={isSaving}
                  >
                    <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, phone.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    aria-label="Delete phone"
                    disabled={isSaving}
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              No phone numbers added
            </span>
          )}
        </div>
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Phone"
        size="md"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {editingPhone && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              Editing phone number
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone-number">
                Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone-number"
                type="tel"
                value={currentPhone.number}
                onChange={handlePhoneNumberChange}
                placeholder="(___) ___-____"
                maxLength={14}
                className={errors.number ? "border-red-500" : ""}
                disabled={isSaving}
              />
              {errors.number && (
                <p className="text-sm text-red-500">{errors.number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-label">Label</Label>
              <Select
                value={currentPhone.label}
                onValueChange={(value) =>
                  setCurrentPhone({ ...currentPhone, label: value })
                }
                disabled={isSaving}
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
                value={currentPhone.extension}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCurrentPhone({ ...currentPhone, extension: e.target.value })
                }
                placeholder="Enter extension"
                disabled={isSaving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone-note">Note</Label>
              <Textarea
                id="phone-note"
                value={currentPhone.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCurrentPhone({ ...currentPhone, note: e.target.value })
                }
                placeholder="Enter note"
                rows={3}
                className="resize-none"
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}

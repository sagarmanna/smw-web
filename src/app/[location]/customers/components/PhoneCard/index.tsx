"use client";

import React, { useState, useCallback } from "react";
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
import { Badge } from "@/components/ui/badge";
import { DraggableItemRow } from "@/components/DraggableItemRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { Textarea } from "@/components/ui/textarea";
import {
  createCustomerPhone,
  updateCustomerPhone,
  deleteCustomerPhone,
  PhoneData,
} from "./phone-card.api";
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
    note: ""
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
    if (currentPhone.number.trim() === "") {
      newErrors.number = "Number cannot be blank.";
    }
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
      note: ""
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
      note: phone.note || ""
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
        isPrimary: false
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
          note: ""
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
      note: ""
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

  const formatPhoneDisplay = (phone: PhoneNumber) => {
    let display = phone.number;
    if (phone.extension) {
      display += ` Ext: ${phone.extension}`;
    }
    if (phone.note) {
      display += ` - ${phone.note}`;
    }
    return display;
  };

  const handleReorder = useCallback(
    async (reorderedPhones: PhoneNumber[]) => {
      // Check if primary status changed
      const newPrimary = reorderedPhones.find((p) => p.isPrimary);
      const oldPrimary = phones.find((p) => p.isPrimary && p.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      if (onSave) onSave(reorderedPhones);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id) {
        try {
          // First, update the new primary phone
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateCustomerPhone(
            location,
            customerId,
            {
              id: newPrimaryId,
              number: newPrimary.number,
              extension: newPrimary.extension ? parseInt(newPrimary.extension) : undefined,
              note: newPrimary.note || "",
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          if (!newPrimaryResult?.success) {
            toast.error(newPrimaryResult?.message || "Failed to update primary phone");
            if (onSave) onSave(phones);
            return;
          }

          // Then update all other phones to non-primary
          const otherPhones = phones.filter((p) => p.id !== newPrimary.id);
          if (otherPhones.length > 0) {
            await Promise.all(
              otherPhones.map((phone) => {
                const phoneId = Number(phone.id);
                return updateCustomerPhone(
                  location,
                  customerId,
                  {
                    id: phoneId,
                    number: phone.number,
                    extension: phone.extension ? parseInt(phone.extension) : undefined,
                    note: phone.note || "",
                    label: phone.label,
                    isPrimary: false,
                  }
                );
              })
            );
          }

          // Use the response from the new primary update (should contain all phones)
          // Normalize the response - ensure only the first item is primary
          if (newPrimaryResult.data) {
            const formattedPhones: PhoneNumber[] = newPrimaryResult.data.map(
              (phone: PhoneData, index: number) => ({
                id: phone.id.toString(),
                label: phone.label,
                number: phone.number,
                extension: phone.extension?.toString(),
                note: phone.note,
                // Ensure only the first item (the one we dragged to top) is primary
                // Find the new primary by ID to ensure it's marked as primary
                isPrimary: phone.id === newPrimaryId,
              })
            );
            if (onSave) onSave(formattedPhones);
          }
        } catch (error) {
          console.error("Error updating primary phone:", error);
          toast.error("Failed to update primary phone");
          // Revert on error
          if (onSave) onSave(phones);
        }
      }
    },
    [phones, location, customerId, onSave]
  );

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<PhoneNumber>({
    items: phones,
    onReorder: handleReorder,
    getItemId: (phone) => phone.id,
  });

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
            phones.map((phone, index) => (
              <DraggableItemRow
                key={phone.id}
                item={phone}
                label={phone.label}
                value={
                  <span className="flex items-center gap-2">
                    {formatPhoneDisplay(phone)}
                    {phone.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </span>
                }
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                getItemId={(item) => item.id}
                editAriaLabel="Edit phone"
                deleteAriaLabel="Delete phone"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, phone)}
                onDragOver={(e) => handleDragOver(e, phone, index)}
                onDrop={(e) => handleDrop(e, phone, index)}
                isDragging={isDragging(phone)}
                isDragOver={isDragOver(phone, index)}
              />
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
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-4 pb-4">
          {editingPhone && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              Editing phone number
            </div>
          )}

          <div className="space-y-4">
            {/* Number */}
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

            {/* Label */}
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

            {/* Extension */}
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

            {/* Note */}
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
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}
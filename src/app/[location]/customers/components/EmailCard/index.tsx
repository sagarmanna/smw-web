"use client";

import React, { useState } from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Email {
  id: string;
  label: string;
  email: string;
  note?: string;
  isPrimary?: boolean;
}

interface EmailCardProps {
  emails?: Email[];
  onAddClick?: () => void;
  onSave?: (emails: Email[]) => void;
  className?: string;
  loading?: boolean;
}

export function EmailCard({ 
  emails = [],
  onAddClick, 
  onSave,
  className,
  loading = false
}: EmailCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const [currentEmail, setCurrentEmail] = useState({ 
    label: "Home", 
    email: "", 
    note: "",
    isPrimary: false
  });
  const [errors, setErrors] = useState({ email: "" });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = { email: "" };
    if (currentEmail.email.trim() === "") {
      newErrors.email = "Email cannot be blank.";
    } else if (!validateEmail(currentEmail.email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    setErrors(newErrors);
    return newErrors.email === "";
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
    setEditingEmail(null);
    setCurrentEmail({ label: "Home", email: "", note: "", isPrimary: false });
    setErrors({ email: "" });
    if (onAddClick) onAddClick();
  };

  const handleEditClick = (e: React.MouseEvent, email: Email) => {
    e.stopPropagation();
    setIsModalOpen(true);
    setEditingEmail(email);
    setCurrentEmail({
      label: email.label,
      email: email.email,
      note: email.note || "",
      isPrimary: email.isPrimary || false
    });
    setErrors({ email: "" });
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    handleRemoveEmail(id);
  };

  const handleRemoveEmail = (id: string) => {
    const updatedEmails = emails.filter(email => email.id !== id);
    if (onSave) onSave(updatedEmails);
    setIsModalOpen(false);
    setEditingEmail(null);
    setCurrentEmail({ label: "Home", email: "", note: "", isPrimary: false });
    setErrors({ email: "" });
  };

  const handleSave = () => {
    if (!validateForm()) return;

    let updatedEmails: Email[];

    if (editingEmail) {
      // Update existing email
      updatedEmails = emails.map(email => 
        email.id === editingEmail.id 
          ? { ...email, ...currentEmail }
          : currentEmail.isPrimary ? { ...email, isPrimary: false } : email
      );
    } else {
      // Add new email
      const newEmail: Email = {
        id: Date.now().toString(),
        ...currentEmail
      };
      updatedEmails = currentEmail.isPrimary 
        ? [...emails.map(e => ({ ...e, isPrimary: false })), newEmail]
        : [...emails, newEmail];
    }

    if (onSave) onSave(updatedEmails);

    setIsModalOpen(false);
    setEditingEmail(null);
    setCurrentEmail({ label: "Home", email: "", note: "", isPrimary: false });
    setErrors({ email: "" });
  };

  const handleCancel = () => {
    setEditingEmail(null);
    setCurrentEmail({ label: "Home", email: "", note: "", isPrimary: false });
    setErrors({ email: "" });
    setIsModalOpen(false);
  };

  const modalActions = [
    { label: "Cancel", onClick: handleCancel, variant: "outline" as const },
    { label: "Save", onClick: handleSave, variant: "default" as const }
  ];

  // Format display value similar to PhoneCard
  const formatEmailDisplay = (email: Email) => {
    let display = email.email;
    if (email.note && email.note.trim() !== "") {
      display += ` - ${email.note}`;
    }
    if (email.isPrimary) {
      display += " (Primary)";
    }
    return display;
  };

  return (
    <>
      <InfoCard title="Email" onAddClick={handleAddClick} className={className} loading={loading}>
        <div className="space-y-2">
          {loading ? (
            // Skeleton loading state
            <>
              {[...Array(2)].map((_, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded -mx-2">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              ))}
            </>
          ) : emails.length > 0 ? (
            emails.map(email => (
              <div
                key={email.id}
                className="flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -mx-2 group"
              >
                <KeyValueDisplay
                  label={email.label}
                  value={formatEmailDisplay(email)}
                  className="justify-start flex-1"
                />
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditClick(e, email)}
                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                    aria-label="Edit email"
                  >
                    <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, email.id)}
                    className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
                    aria-label="Delete email"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">No emails added</span>
          )}
        </div>
      </InfoCard>

      <ReusableModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Email"
        size="md"
        actions={modalActions}
        showFooter={true}
      >
        <div className="space-y-4">
          {editingEmail && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">Editing email</div>
          )}

          {/* Email Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-address">Email</Label>
              <Input
                id="email-address"
                type="email"
                value={currentEmail.email}
                onChange={(e) => {
                  setCurrentEmail({ ...currentEmail, email: e.target.value });
                  if (errors.email) setErrors({ email: "" });
                }}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email-label">Label</Label>
              <Select value={currentEmail.label} onValueChange={value => setCurrentEmail({ ...currentEmail, label: value })}>
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
                value={currentEmail.note}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setCurrentEmail({ ...currentEmail, note: e.target.value })
                }
                placeholder="Enter note"
                rows={3}
                className="resize-none"
              />
            </div>

            {/* Primary Email Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={currentEmail.isPrimary}
                onChange={(e) => setCurrentEmail({ ...currentEmail, isPrimary: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <Label
                htmlFor="isPrimary"
                className="text-sm font-medium cursor-pointer"
              >
                Set as primary email
              </Label>
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}
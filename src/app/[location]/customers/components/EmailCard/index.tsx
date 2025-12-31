"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { InfoCard } from "@/components/InfoCard";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { DraggableItemRow } from "@/components/DraggableItemRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  createCustomerEmail,
  updateCustomerEmail,
  deleteCustomerEmail,
  validateCustomerEmail,
  EmailData,
} from "./email-card.api";

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
  location: string;
  customerId: number;
}

export function EmailCard({ 
  emails = [],
  onAddClick, 
  onSave,
  className,
  loading = false,
  location,
  customerId
}: EmailCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const [currentEmail, setCurrentEmail] = useState({ 
    label: "Home", 
    email: "", 
    note: ""
  });
  const [errors, setErrors] = useState({ email: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);

  // Debounce timer ref for email validation
  const emailValidationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (emailValidationTimerRef.current) {
        clearTimeout(emailValidationTimerRef.current);
      }
    };
  }, []);

  const validateEmailFormat = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isEmailDuplicate = (email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    return emails.some(e => {
      // Skip the current editing email when checking for duplicates
      if (editingEmail && e.id === editingEmail.id) {
        return false;
      }
      return e.email.toLowerCase() === normalizedEmail;
    });
  };

  const validateEmailWithAPI = async (email: string) => {
    try {
      setIsValidatingEmail(true);
      const result = await validateCustomerEmail(location, email);
      
      if (result?.success) {
        const { exists } = result.data;
        if (exists) {
          setErrors(prev => ({ 
            ...prev, 
            email: "This email is already registered for a customer in this location." 
          }));
        } else {
          // Clear email error if it was a duplicate error
          setErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors.email?.includes("already registered")) {
              newErrors.email = "";
            }
            return newErrors;
          });
        }
      }
    } catch (error) {
      console.error("Error validating email:", error);
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const validateForm = () => {
    const newErrors = { email: "" };
    const trimmedEmail = currentEmail.email.trim();
    
    if (trimmedEmail === "") {
      newErrors.email = "Email cannot be blank.";
    } else if (!validateEmailFormat(trimmedEmail)) {
      newErrors.email = "Please enter a valid email address.";
    } else if (isEmailDuplicate(trimmedEmail)) {
      newErrors.email = "This email is already registered for a customer in this location.";
    }
    
    setErrors(newErrors);
    return newErrors.email === "";
  };

  const handleAddClick = () => {
    setIsModalOpen(true);
    setEditingEmail(null);
    setCurrentEmail({ label: "Home", email: "", note: "" });
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
      note: email.note || ""
    });
    setErrors({ email: "" });
  };

  const handleDeleteClick = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    
    // Prevent deletion of primary email
    const emailToDelete = emails.find(email => email.id === id);
    if (emailToDelete?.isPrimary) {
      toast.error("Cannot delete primary email. Please set another email as primary first.");
      return;
    }
    
    try {
      const result = await deleteCustomerEmail(location, customerId, id);
      
      if (result?.success) {
        toast.success("Email deleted successfully");
        
        // Update local state
        const updatedEmails = emails.filter(email => email.id !== id);
        if (onSave) onSave(updatedEmails);
      } else {
        toast.error(result?.message || "Failed to delete email");
      }
    } catch (error) {
      console.error("Error deleting email:", error);
      const errorMessage = (error as { message?: string })?.message || "Failed to delete email";
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    // Don't submit if email validation is in progress
    if (isValidatingEmail) {
      return;
    }

    if (!validateForm()) return;

    setIsSaving(true);

    try {
      if (editingEmail) {
        // Update existing email - preserve the isPrimary status
        const result = await updateCustomerEmail(location, customerId, {
          id: Number(editingEmail.id),
          email: currentEmail.email,
          note: currentEmail.note || "",
          label: currentEmail.label,
          isPrimary: editingEmail.isPrimary || false
        });

        if (result?.success && result.data) {
          toast.success("Email updated successfully");
          
          // Update local state with API response
          const updatedEmails = result.data.map((e: EmailData) => ({
            id: String(e.id),
            label: e.label,
            email: e.email,
            note: e.note || "",
            isPrimary: e.isPrimary
          }));
          
          if (onSave) onSave(updatedEmails);
        } else {
          toast.error(result?.message || "Failed to update email");
        }
      } else {
        // Create new email
        const result = await createCustomerEmail(location, customerId, {
          email: currentEmail.email,
          note: currentEmail.note || "",
          label: currentEmail.label,
          isPrimary: false
        });

        if (result?.success && result.data) {
          toast.success("Email added successfully");
          
          // Update local state with API response
          const updatedEmails = result.data.map((e: EmailData) => ({
            id: String(e.id),
            label: e.label,
            email: e.email,
            note: e.note || "",
            isPrimary: e.isPrimary
          }));
          
          if (onSave) onSave(updatedEmails);
        } else {
          toast.error(result?.message || "Failed to add email");
        }
      }

      setIsModalOpen(false);
      setEditingEmail(null);
      setCurrentEmail({ label: "Home", email: "", note: "" });
      setErrors({ email: "" });
    } catch (error) {
      console.error("Error saving email:", error);
      toast.error("Failed to save email");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditingEmail(null);
    setCurrentEmail({ label: "Home", email: "", note: "" });
    setErrors({ email: "" });
    setIsModalOpen(false);
    // Clear any pending validation
    if (emailValidationTimerRef.current) {
      clearTimeout(emailValidationTimerRef.current);
    }
    setIsValidatingEmail(false);
  };

  const handleEmailChange = (value: string) => {
    setCurrentEmail({ ...currentEmail, email: value });
    if (errors.email) setErrors({ email: "" });

    const trimmedEmail = value.trim();
    
    // Clear existing timer
    if (emailValidationTimerRef.current) {
      clearTimeout(emailValidationTimerRef.current);
    }
    
    // Check format first
    if (trimmedEmail === "") {
      // Clear validation state if email is empty
      setIsValidatingEmail(false);
    } else if (!validateEmailFormat(trimmedEmail)) {
      // Don't validate with API if format is invalid
      setIsValidatingEmail(false);
    } else if (isEmailDuplicate(trimmedEmail)) {
      // Don't validate with API if it's a local duplicate
      setIsValidatingEmail(false);
    } else {
      // Debounce API validation
      emailValidationTimerRef.current = setTimeout(() => {
        validateEmailWithAPI(trimmedEmail);
      }, 500); // Wait 500ms after user stops typing
    }
  };

  const modalActions = [
    { label: "Cancel", onClick: handleCancel, variant: "outline" as const },
    { label: isSaving ? "Saving..." : "Save", onClick: handleSave, variant: "default" as const, disabled: isSaving || isValidatingEmail }
  ];

  // Format display value similar to PhoneCard
  const formatEmailDisplay = (email: Email) => {
    let display = email.email;
    if (email.note && email.note.trim() !== "") {
      display += ` - ${email.note}`;
    }
    return display;
  };

  const handleReorder = useCallback(
    async (reorderedEmails: Email[]) => {
      // Check if primary status changed
      const newPrimary = reorderedEmails.find((e) => e.isPrimary);
      const oldPrimary = emails.find((e) => e.isPrimary && e.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      if (onSave) onSave(reorderedEmails);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id) {
        try {
          // First, update the new primary email
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateCustomerEmail(
            location,
            customerId,
            {
              id: newPrimaryId,
              email: newPrimary.email,
              note: newPrimary.note || "",
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          if (!newPrimaryResult?.success) {
            toast.error(newPrimaryResult?.message || "Failed to update primary email");
            if (onSave) onSave(emails);
            return;
          }

          // Then update all other emails to non-primary
          const otherEmails = emails.filter((e) => e.id !== newPrimary.id);
          if (otherEmails.length > 0) {
            await Promise.all(
              otherEmails.map((email) => {
                const emailId = Number(email.id);
                return updateCustomerEmail(
                  location,
                  customerId,
                  {
                    id: emailId,
                    email: email.email,
                    note: email.note || "",
                    label: email.label,
                    isPrimary: false,
                  }
                );
              })
            );
          }

          // Use the response from the new primary update (should contain all emails)
          // Normalize the response - ensure only the new primary is marked as primary
          if (newPrimaryResult.data) {
            const updatedEmails = newPrimaryResult.data.map((e: EmailData) => ({
              id: String(e.id),
              label: e.label,
              email: e.email,
              note: e.note || "",
              // Ensure only the new primary is marked as primary
              isPrimary: e.id === newPrimaryId,
            }));
            if (onSave) onSave(updatedEmails);
          }
        } catch (error) {
          console.error("Error updating primary email:", error);
          toast.error("Failed to update primary email");
          // Revert on error
          if (onSave) onSave(emails);
        }
      }
    },
    [emails, location, customerId, onSave]
  );

  const {
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  } = useDragAndDrop<Email>({
    items: emails,
    onReorder: handleReorder,
    getItemId: (email) => email.id,
  });

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
            emails.map((email, index) => (
              <DraggableItemRow
                key={email.id}
                item={email}
                label={email.label}
                value={
                  <span className="flex items-center gap-2">
                    {formatEmailDisplay(email)}
                    {email.isPrimary && (
                      <Badge variant="secondary" className="text-xs">
                        Primary
                      </Badge>
                    )}
                  </span>
                }
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                getItemId={(item) => item.id}
                editAriaLabel="Edit email"
                deleteAriaLabel="Delete email"
                draggable={true}
                onDragStart={(e) => handleDragStart(e, email)}
                onDragOver={(e) => handleDragOver(e, email, index)}
                onDrop={(e) => handleDrop(e, email, index)}
                isDragging={isDragging(email)}
                isDragOver={isDragOver(email, index)}
              />
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
        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto px-4 pb-4">
          {editingEmail && (
            <div className="text-sm text-blue-600 dark:text-blue-400 mb-2">
              Editing email
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email-address">
                Email <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="email-address"
                  type="text"
                  value={currentEmail.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  placeholder="Enter email address"
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isSaving}
                />
                {isValidatingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  </div>
                )}
              </div>
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            {/* Label */}
            <div className="space-y-2">
              <Label htmlFor="email-label">Label</Label>
              <Select 
                value={currentEmail.label} 
                onValueChange={value => setCurrentEmail({ ...currentEmail, label: value })}
                disabled={isSaving}
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

            {/* Note */}
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
                disabled={isSaving}
              />
            </div>
          </div>
        </div>
      </ReusableModal>
    </>
  );
}
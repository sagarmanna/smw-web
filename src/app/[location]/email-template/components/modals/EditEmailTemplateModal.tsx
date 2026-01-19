"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { RichTextEditor } from "@/components/RichTextEditor";
import type { UpdateEmailTemplateRequest } from "../../types";
import { updateEmailTemplate } from "../../emailTemplateListing.slice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { ErrorDisplay } from "@/components/ErrorDisplay";

interface EditEmailTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  emailTemplateId: number | string | null;
}

export function EditEmailTemplateModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  location, 
  emailTemplateId 
}: EditEmailTemplateModalProps) {
  const dispatch = useAppDispatch();
  const rows = useAppSelector((state) => state.emailTemplateListing.rows);
  
  const [subject, setSubject] = useState("");
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  // Get email template from Redux state when modal opens
  const emailTemplate = useMemo(() => {
    if (!emailTemplateId) return null;
    const numericId = typeof emailTemplateId === 'string' ? parseInt(emailTemplateId, 10) : emailTemplateId;
    if (isNaN(numericId)) return null;
    return rows.find(template => template.id === numericId) || null;
  }, [emailTemplateId, rows]);

  // Populate form fields when template is found
  useEffect(() => {
    if (isOpen && emailTemplate) {
      setSubject(emailTemplate.subject);
      setHeader(emailTemplate.header || "");
      setFooter(emailTemplate.footer || "");
      setError(null);
    } else if (isOpen && !emailTemplate && emailTemplateId) {
      setError("Email template not found in current view. Please refresh the page.");
    }
  }, [isOpen, emailTemplate, emailTemplateId]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSubject("");
      setHeader("");
      setFooter("");
      setErrors({});
      setError(null);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!subject.trim()) {
      newErrors.subject = "Subject cannot be blank.";
    } else if (subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
    } else if (subject.trim().length > 255) {
      newErrors.subject = "Subject must not exceed 255 characters";
    }

    // Check if header has actual content (not just empty HTML tags)
    const headerText = header.replace(/<[^>]*>/g, "").trim();
    if (!headerText) {
      newErrors.header = "Header cannot be blank.";
    }

    // Check if footer has actual content (not just empty HTML tags)
    const footerText = footer.replace(/<[^>]*>/g, "").trim();
    if (!footerText) {
      newErrors.footer = "Footer cannot be blank.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!emailTemplate || !emailTemplate.id) {
      toast.error("Email template ID not found");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const payload: UpdateEmailTemplateRequest = {
        subject: subject.trim(),
        header: header,
        footer: footer,
      };

      // Step 1: Call API first via Redux action (API call happens in thunk)
      // Step 2: Redux state is automatically updated after successful API call
      await dispatch(updateEmailTemplate({ location, id: emailTemplate.id, data: payload })).unwrap();

      toast.success("Email template updated successfully!");
      onSuccess?.();
      onClose();
    } catch (error: unknown) {
      const apiError = error as { message?: string; errorCode?: string };
      const errorMessage = apiError.message || "Failed to update email template";

      toast.error(errorMessage);

      if (apiError.errorCode === "BAD_REQUEST") {
        console.error("Validation error:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSubject(value);
    // Clear error when user starts typing
    if (errors.subject) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.subject;
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Template</DialogTitle>
        </DialogHeader>

        {error && emailTemplateId && !emailTemplate && (
          <div className="py-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Email Template"
              fallbackMessage="Email template not found in current view. Please refresh the page to see all templates."
            />
          </div>
        )}

        {emailTemplate && !error && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Enter subject"
                required
                className={errors.subject ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
            </div>

            <div className="space-y-2">
              <Label>
                Header <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                value={header}
                onChange={setHeader}
                mode="simple"
                minHeight="200px"
                error={!!errors.header}
                errorMessage={errors.header}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Footer <span className="text-red-500">*</span>
              </Label>
              <RichTextEditor
                value={footer}
                onChange={setFooter}
                mode="simple"
                minHeight="200px"
                error={!!errors.footer}
                errorMessage={errors.footer}
                disabled={isLoading}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

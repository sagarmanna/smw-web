"use client";

import * as React from "react";
import {
  getInvoiceEmailStatement,
} from "../../../[id]/invoiceEmailStatement.api";
import { generateInvoiceEmailStatementContent } from "../../../[id]/invoiceEmailStatementHtml";
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
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import TipTapEmailEditor from "@/app/[location]/customers/components/EmailStatementModal/TipTapEmailEditor";
import "@/app/[location]/customers/components/EmailStatementModal/tiptap-styles.css";

export interface InvoiceEmailData {
  recipients: string[];
  subject: string;
  content: string;
}

interface InvoiceEmailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (emailData: InvoiceEmailData) => Promise<boolean>;
  location: string;
  invoiceId: number;
}

export function InvoiceEmailModal({
  open,
  onOpenChange,
  onSend,
  location,
  invoiceId,
}: InvoiceEmailModalProps) {
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [emailInput, setEmailInput] = React.useState<string>("");
  const [subject, setSubject] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");
  const [isLoadingStatement, setIsLoadingStatement] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [statementError, setStatementError] = React.useState<string | null>(null);
  const [errors, setErrors] = React.useState<{
    recipients?: string;
    subject?: string;
    content?: string;
  }>({});

  // Initialize form when modal opens
  React.useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const loadEmailStatement = async () => {
      setIsLoadingStatement(true);
      setStatementError(null);
      setErrors({});
      setEmailInput("");

      try {
        const response = await getInvoiceEmailStatement(location, invoiceId);

        if (!response?.success || !response?.data?.body) {
          throw new Error(response?.message || "Failed to load invoice email statement");
        }

        if (cancelled) return;

        const body = response.data.body;
        const template = body.emailTemplate;
        const contentHtml = generateInvoiceEmailStatementContent(body);

        setRecipients(template?.to ? [template.to] : []);
        setSubject(template?.subject || "");
        setContent(contentHtml);
      } catch (error) {
        if (cancelled) return;

        const message = error instanceof Error ? error.message : "Failed to load invoice email statement";
        setStatementError(message);
        setRecipients([]);
        setSubject("");
        setContent("");
      } finally {
        if (!cancelled) {
          setIsLoadingStatement(false);
        }
      }
    };

    void loadEmailStatement();

    return () => {
      cancelled = true;
    };
  }, [open, location, invoiceId]);

  const handleAddRecipient = () => {
    const trimmedEmail = emailInput.trim();
    if (!trimmedEmail) {
      setErrors((prev) => ({ ...prev, recipients: "Email cannot be empty" }));
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrors((prev) => ({ ...prev, recipients: "Invalid email format" }));
      return;
    }

    if (recipients.includes(trimmedEmail)) {
      setErrors((prev) => ({ ...prev, recipients: "Email already added" }));
      return;
    }

    setRecipients((prev) => [...prev, trimmedEmail]);
    setEmailInput("");
    setErrors((prev) => ({ ...prev, recipients: undefined }));
  };

  const handleRemoveRecipient = (email: string) => {
    setRecipients((prev) => prev.filter((r) => r !== email));
  };

  const handleSendEmail = async () => {
    const newErrors: typeof errors = {};

    if (recipients.length === 0) {
      newErrors.recipients = "At least one recipient is required";
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    if (!content.trim()) {
      newErrors.content = "Email content is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const emailData: InvoiceEmailData = {
      recipients,
      subject,
      content,
    };

    setIsSending(true);
    try {
      const isSent = await onSend(emailData);
      if (isSent) {
        handleClose();
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    setRecipients([]);
    setEmailInput("");
    setSubject("");
    setContent("");
    setStatementError(null);
    setIsLoadingStatement(false);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Email Invoice</DialogTitle>
        </DialogHeader>

        {isLoadingStatement ? (
          <div className="py-6 text-sm text-muted-foreground">Loading email statement...</div>
        ) : statementError ? (
          <div className="py-6 text-sm text-destructive">{statementError}</div>
        ) : (
        <div className="space-y-4 py-4">
          {/* Recipients */}
          <div className="space-y-2">
            <Label htmlFor="recipients">Recipients</Label>
            <div className="flex gap-2">
              <input
                id="recipients"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddRecipient();
                  }
                }}
                placeholder="Enter email address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button
                type="button"
                onClick={handleAddRecipient}
                variant="outline"
                size="sm"
              >
                Add
              </Button>
            </div>

            {recipients.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recipients.map((email) => (
                  <Badge key={email} variant="secondary" className="pl-2">
                    {email}
                    <button
                      onClick={() => handleRemoveRecipient(email)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {errors.recipients && (
              <p className="text-sm text-red-600">{errors.recipients}</p>
            )}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => {
                setSubject(e.target.value);
                setErrors((prev) => ({ ...prev, subject: undefined }));
              }}
              placeholder="Email subject"
            />
            {errors.subject && (
              <p className="text-sm text-red-600">{errors.subject}</p>
            )}
          </div>

          {/* Rich Text Editor */}
          <div className="space-y-2">
            <Label>Email Content</Label>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <TipTapEmailEditor
                content={content}
                onChange={(html) => {
                  setContent(html);
                  setErrors((prev) => ({ ...prev, content: undefined }));
                }}
                className="min-h-[300px]"
              />
            </div>
            {errors.content && (
              <p className="text-sm text-red-600">{errors.content}</p>
            )}
          </div>
        </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSendEmail()}
            disabled={isLoadingStatement || !!statementError || isSending}
          >
            Send Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

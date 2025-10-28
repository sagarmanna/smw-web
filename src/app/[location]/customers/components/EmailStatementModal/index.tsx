"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import TipTapEmailEditor from "./TipTapEmailEditor";
import "./tiptap-styles.css";

interface EmailStatementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSend: (emailData: EmailFormData) => void;
  customerName?: string;
  customerEmails?: string[];
  locationName?: string;
  privateLessonDueData?: Array<{
    lessonDate: string;
    student: string;
    program: string;
    teacher: string;
    amount: number;
  } | {
    lessonDate: string;
    studentName: string;
    programName: string;
    teacherName: string;
    amount: number | string;
  }>;
  groupLessonDueData?: Array<{
    lessonDate: string;
    studentName: string;
    programName: string;
    teacherName: string;
    amount: number | string;
  }>;
  invoiceData?: Array<{
    id: string;
    date: string;
    status: string;
    total: number;
    balance: number;
  }>;
  totalBalance?: string;
}

export interface EmailFormData {
  recipients: string[];
  subject: string;
  content: string;
}


export default function EmailStatementModal({ 
  open, 
  onOpenChange, 
  onSend, 
  customerName: _customerName,
  customerEmails = [],
  locationName = "Arcadia Academy of Music",
  privateLessonDueData = [],
  groupLessonDueData = [],
  invoiceData = [],
  totalBalance = "$0.00"
}: EmailStatementModalProps) {
  const [recipients, setRecipients] = React.useState<string[]>([]);
  const [emailInput, setEmailInput] = React.useState<string>("");
  const [subject, setSubject] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");
  const [errors, setErrors] = React.useState<{
    recipients?: string;
    subject?: string;
    content?: string;
  }>({});
  const [isContentExpanded, setIsContentExpanded] = React.useState<boolean>(false);

  // Handle ESC key to exit fullscreen
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isContentExpanded) {
        setIsContentExpanded(false);
      }
    };
    
    if (isContentExpanded) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when fullscreen
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isContentExpanded]);

  // Format currency helper
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };


  // Track if content has been initialized for this modal session
  const contentInitialized = React.useRef(false);

  // Initialize form when modal opens with complete email content (text + tables HTML)
  React.useEffect(() => {
    if (open && !contentInitialized.current) {
      // Pre-fill with customer emails if available
      setRecipients(customerEmails.filter(email => email && email.trim() !== ""));
      setSubject(`Customer Statement from ${locationName}`);
      
      // Generate complete email content with text AND tables together
      const completeContent = generateCompleteEmailHTML();
      setContent(completeContent);
      contentInitialized.current = true;
    } else if (!open) {
      // Reset flag when modal closes
      contentInitialized.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerEmails, locationName]);

  // Generate complete email HTML with introductory text AND tables
  const generateCompleteEmailHTML = () => {
    const introText = `<p>For your convenience, please see your next billing statement below. As a reminder, payments are due the first week of the month.</p>`;
    
    const tablesHTML = generateTablesHTML();
    
    const closingText = `<p>We would also like to take this opportunity to remind you that we have a number of convenient and more economical ways of making payments. These methods of payments with corresponding discounts are outlined in our Payment Method: Commitment Plan which can be found at our front desk.</p>`;
    
    return introText + tablesHTML + closingText;
  };

  // Generate table HTML for email content (using real customer data)
  const generateTablesHTML = () => {
    return `
<div style="margin-top: 32px; padding-top: 24px; border-top: 2px solid #e5e7eb;">
  <h3 style="font-size: 14px; font-weight: bold; color: #111827; margin-bottom: 12px;">Private Lessons Due</h3>
  <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; border: 1px solid #d1d5db;">
    <thead>
      <tr style="background-color: #f3f4f6; border-bottom: 1px solid #d1d5db;">
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Date</th>
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Student</th>
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Program</th>
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Teacher</th>
        <th style="text-align: right; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Amount</th>
        <th style="text-align: right; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${privateLessonDueData.map((lesson) => {
        type Legacy = { lessonDate: string; student: string; program: string; teacher: string; amount: number };
        type Api = { lessonDate: string; studentName: string; programName: string; teacherName: string; amount: number | string };
        const isApi = (l: Legacy | Api): l is Api => 'studentName' in (l as Record<string, unknown>);
        const student = isApi(lesson as Legacy | Api) ? (lesson as Api).studentName : (lesson as Legacy).student;
        const program = isApi(lesson as Legacy | Api) ? (lesson as Api).programName : (lesson as Legacy).program;
        const teacher = isApi(lesson as Legacy | Api) ? (lesson as Api).teacherName : (lesson as Legacy).teacher;
        const amountVal = (lesson as Legacy | Api).amount as number | string;
        const amountStr = typeof amountVal === 'string' ? amountVal : formatCurrency(amountVal);
        return `<tr style=\"border-bottom: 1px solid #e5e7eb;\">\n        <td style=\"padding: 8px; color: #1f2937; border: 1px solid #d1d5db;\">${lesson.lessonDate}</td>\n        <td style=\"padding: 8px; color: #1f2937; border: 1px solid #d1d5db;\">${student}</td>\n        <td style=\"padding: 8px; color: #1f2937; border: 1px solid #d1d5db;\">${program}</td>\n        <td style=\"padding: 8px; color: #1f2937; border: 1px solid #d1d5db;\">${teacher}</td>\n        <td style=\"padding: 8px; color: #1f2937; text-align: right; border: 1px solid #d1d5db;\">${amountStr}</td>\n        <td style=\"padding: 8px; color: #1f2937; text-align: right; border: 1px solid #d1d5db;\">${amountStr}</td>\n      </tr>`;
      }).join('')}
    </tbody>
  </table>

  <h3 style="font-size: 14px; font-weight: bold; color: #111827; margin-bottom: 12px; margin-top: 24px;">Group Lessons Due</h3>
  <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; border: 1px solid #d1d5db;">
    <thead>
      <tr style="background-color: #f3f4f6; border-bottom: 1px solid #d1d5db;">
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Date</th>
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Student</th>
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Program</th>
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Teacher</th>
        <th style="text-align: right; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Amount</th>
        <th style="text-align: right; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${groupLessonDueData.map(lesson => `<tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #1f2937; border: 1px solid #d1d5db;">${lesson.lessonDate}</td>
        <td style="padding: 8px; color: #1f2937; border: 1px solid #d1d5db;">${lesson.studentName}</td>
        <td style="padding: 8px; color: #1f2937; border: 1px solid #d1d5db;">${lesson.programName}</td>
        <td style="padding: 8px; color: #1f2937; border: 1px solid #d1d5db;">${lesson.teacherName}</td>
        <td style="padding: 8px; color: #1f2937; text-align: right; border: 1px solid #d1d5db;">${typeof lesson.amount === 'string' ? lesson.amount : formatCurrency(lesson.amount)}</td>
        <td style="padding: 8px; color: #1f2937; text-align: right; border: 1px solid #d1d5db;">${typeof lesson.amount === 'string' ? lesson.amount : formatCurrency(lesson.amount)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <h3 style="font-size: 14px; font-weight: bold; color: #111827; margin-bottom: 12px; margin-top: 24px;">Invoices</h3>
  <table border="1" cellpadding="8" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 24px; border: 1px solid #d1d5db;">
    <thead>
      <tr style="background-color: #f3f4f6; border-bottom: 1px solid #d1d5db;">
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Date</th>
        <th style="text-align: left; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Number</th>
        <th style="text-align: right; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Amount</th>
        <th style="text-align: right; padding: 8px; font-weight: 600; color: #374151; border: 1px solid #d1d5db;">Balance</th>
      </tr>
    </thead>
    <tbody>
      ${invoiceData.map(invoice => `<tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 8px; color: #1f2937; border: 1px solid #d1d5db;">${invoice.date}</td>
        <td style="padding: 8px; color: #1f2937; border: 1px solid #d1d5db;">${invoice.id}</td>
        <td style="padding: 8px; color: #1f2937; text-align: right; border: 1px solid #d1d5db;">${formatCurrency(invoice.total)}</td>
        <td style="padding: 8px; color: #1f2937; text-align: right; border: 1px solid #d1d5db;">${formatCurrency(invoice.balance)}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #d1d5db;">
    <table style="width: 100%; font-size: 14px;">
      <tr>
        <td style="font-weight: bold; color: #111827; text-align: left;">Total</td>
        <td style="font-weight: bold; color: #111827; text-align: right;">${totalBalance}</td>
      </tr>
    </table>
  </div>

  <div style="margin-top: 32px; font-size: 14px; color: #1f2937; line-height: 1.6;">
    <p style="margin: 0;"><strong>HST#</strong> FQR547785GT1234</p>
    <p style="margin: 16px 0 4px 0;">Thank you,</p>
    <p style="margin: 0;">${locationName}</p>
  </div>
</div>`;
  };

  // Handle email input
  const handleEmailInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      addEmail();
    } else if (e.key === "Backspace" && emailInput === "" && recipients.length > 0) {
      // Remove last email when backspace is pressed on empty input
      setRecipients(prev => prev.slice(0, -1));
    }
  };

  const addEmail = () => {
    const trimmedEmail = emailInput.trim().replace(/,/g, "");
    
    if (trimmedEmail && isValidEmail(trimmedEmail)) {
      if (!recipients.includes(trimmedEmail)) {
        setRecipients(prev => [...prev, trimmedEmail]);
        setEmailInput("");
        setErrors(prev => ({ ...prev, recipients: undefined }));
      } else {
        setErrors(prev => ({ ...prev, recipients: "Email already added" }));
      }
    } else if (trimmedEmail) {
      setErrors(prev => ({ ...prev, recipients: "Invalid email address" }));
    }
  };

  const removeEmail = (emailToRemove: string) => {
    setRecipients(prev => prev.filter(email => email !== emailToRemove));
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (recipients.length === 0) {
      newErrors.recipients = "At least one recipient is required";
    }

    if (!subject.trim()) {
      newErrors.subject = "Subject is required";
    }

    // Strip HTML tags to check if content is empty
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!strippedContent) {
      newErrors.content = "Email content is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = () => {
    if (validateForm()) {
      // Content already includes text + tables (TipTap unified editor)
      onSend({
        recipients,
        subject,
        content: content  // Complete email from TipTap editor
      });
      handleCancel();
    }
  };

  const handleCancel = () => {
    // Reset form
    setRecipients([]);
    setEmailInput("");
    setSubject("");
    setContent("");
    setErrors({});
    onOpenChange(false);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
    },
    {
      label: "Send",
      onClick: handleSend,
      variant: "default" as const,
    },
  ];

  return (
    <>
      <ReusableModal
        open={open && !isContentExpanded}
        onOpenChange={onOpenChange}
        title="Email Preview"
        size="full"
        className="max-w-4xl max-h-[90vh]"
        actions={modalActions}
      >
        <div className="space-y-4">
        {/* To Field with Email Tags */}
        <div className="space-y-2">
          <Label htmlFor="recipients">To</Label>
          <div
            className={`flex flex-wrap gap-1.5 min-h-[42px] rounded-md border ${
              errors.recipients ? "border-red-500" : "border-gray-300 dark:border-gray-600"
            } bg-white dark:bg-gray-800 px-3 py-2 focus-within:ring-1 focus-within:ring-blue-500 dark:focus-within:ring-blue-400`}
          >
            {recipients.map((email) => (
              <Badge
                key={email}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {email}
                <button
                  type="button"
                  onClick={() => removeEmail(email)}
                  className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <input
              type="text"
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setErrors(prev => ({ ...prev, recipients: undefined }));
              }}
              onKeyDown={handleEmailInputKeyDown}
              onBlur={addEmail}
              placeholder={recipients.length === 0 ? "Enter email address" : ""}
              className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
            />
          </div>
          {errors.recipients && (
            <p className="text-sm text-red-500">{errors.recipients}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter, Space, or Comma to add multiple emails
          </p>
        </div>

        {/* Subject Field */}
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => {
              setSubject(e.target.value);
              setErrors(prev => ({ ...prev, subject: undefined }));
            }}
            className={errors.subject ? "border-red-500" : ""}
            placeholder="Enter subject"
          />
          {errors.subject && (
            <p className="text-sm text-red-500">{errors.subject}</p>
          )}
        </div>

         {/* Content Field with Rich Text Editor - Unified Text + Tables */}
        <div className="space-y-2">
          <Label htmlFor="content">Email Content (Text and Tables are editable)</Label>
          <div className={`${errors.content ? "border border-red-500 rounded-md" : ""}`}>
            <TipTapEmailEditor
              content={content}
              onChange={(value) => {
                setContent(value);
                setErrors(prev => ({ ...prev, content: undefined }));
              }}
              onFullscreenChange={setIsContentExpanded}
              isFullscreen={isContentExpanded}
            />
          </div>
          
          {errors.content && (
            <p className="text-sm text-red-500 mt-1">{errors.content}</p>
          )}
          
          <p className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
            ✨ You can now edit both text AND table cells directly! Click on any cell to modify values.
          </p>
        </div>
      </div>
    </ReusableModal>

    {/* Full Screen Content Overlay - Handled by TipTap */}
    {isContentExpanded && (
      <div className="fixed inset-0 z-[9999] bg-white dark:bg-gray-900 flex flex-col fullscreen-overlay">
        {/* Full Screen Header */}
        <div className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Email Editor - Full Screen</h2>
              <Badge variant="outline" className="text-xs">Edit Text and Tables</Badge>
            </div>
            <button
              type="button"
              onClick={() => setIsContentExpanded(false)}
              className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-all px-4 py-2 rounded-md flex items-center gap-2 border border-gray-400 dark:border-gray-600 hover:border-gray-800 dark:hover:border-gray-500 font-medium"
              title="Exit full screen (ESC)"
            >
              <X className="h-5 w-5" />
              <span className="text-sm">Exit Full Screen</span>
            </button>
          </div>
          
          {/* Email Info */}
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">To:</span>
              <div className="flex flex-wrap gap-1">
                {recipients.map((email, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {email}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Subject:</span>
              <span className="text-gray-900 dark:text-gray-100">{subject}</span>
            </div>
          </div>
        </div>

        {/* Full Screen Content - TipTap Editor */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-[1400px] mx-auto">
            {/* Edit Notice */}
            
            
            {/* TipTap Editor in Fullscreen */}
            <TipTapEmailEditor
              content={content}
              onChange={(value) => {
                setContent(value);
                setErrors(prev => ({ ...prev, content: undefined }));
              }}
              isFullscreen={true}
              className="fullscreen"
            />
          </div>
        </div>

        {/* Full Screen Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 shadow-lg">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            className="min-w-[120px]"
          >
            Send Email
          </Button>
        </div>
      </div>
    )}
  </>
  );
}


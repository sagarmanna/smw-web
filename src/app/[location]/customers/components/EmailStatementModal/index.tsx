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
  onDelete?: () => void;
  customerName?: string;
  customerEmails?: string[];
  locationName?: string;
  initialSubject?: string;
  initialContent?: string;
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
  creditData?: Array<{
    id: number;
    type: string;
    reference: string;
    amount: number;
  }>;
  totalBalance?: string;
  showDeleteButton?: boolean;
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
  onDelete,
  customerName: _customerName,
  customerEmails = [],
  locationName = "Arcadia Academy of Music",
  initialSubject,
  initialContent,
  privateLessonDueData = [],
  groupLessonDueData = [],
  invoiceData = [],
  creditData = [],
  totalBalance = "$0.00",
  showDeleteButton = false,
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


  // Initialize form when modal opens or when API data changes
  React.useEffect(() => {
    if (open) {
      // Pre-fill with customer emails if available
      setRecipients(customerEmails.filter(email => email && email.trim() !== ""));
      setSubject(initialSubject || `Customer Statement from ${locationName}`);
      
      // Generate complete email content with text AND tables together
      // If initialContent is complete HTML (payment receipt, etc.), use it as-is
      // Otherwise, always use the new intro text (ignore old emailHeader text)
      let completeContent: string;
      if (initialContent) {
        const shouldUseInitialContentAsIs = /<(table|form|div)[\s>]/i.test(initialContent) ||
          initialContent.includes("payment-receipt") ||
          initialContent.includes("invoice-lineitem-listing") ||
          initialContent.includes("credit-lineitem-listing") ||
          initialContent.includes("email-statement");

        if (shouldUseInitialContentAsIs) {
          // Use complete HTML as-is (e.g., payment receipt HTML)
          completeContent = initialContent;
        } else {
          // initialContent is just plain text (old emailHeader), ignore it and use new intro text
          completeContent = generateCompleteEmailHTML();
        }
      } else {
        // Generate complete content from scratch with new intro text
        completeContent = generateCompleteEmailHTML();
      }
      setContent(completeContent);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, customerEmails, locationName, initialSubject, initialContent, privateLessonDueData, groupLessonDueData, invoiceData, totalBalance]);

  // Generate complete email HTML with introductory text AND tables
  const generateCompleteEmailHTML = () => {
    const introText = `<p>For your convenience, please see your next billing statement below. As a reminder, payments are due the first week of the month.</p><p>We would also like to take this opportunity to remind you that we have a number of convenient and more economical ways of making payments. These methods of payments with corresponding discounts are outlined in our Payment Method: Commitment Plan which can be found at our front desk.</p>`;
    
    const tablesHTML = generateTablesHTML();
    
    return introText + tablesHTML;
  };

  const editorTemplates = React.useMemo(() => ([
    {
      label: 'Image and Title',
      description: 'One main image with a title and text that surround the image.',
      content: `
        <div style="font-size:14px; color:#111827; line-height:1.6;">
          <h2 style="margin:0 0 12px 0; font-weight:700; font-size:20px;">Your Big Announcement</h2>
          <img src="https://via.placeholder.com/800x260" alt="Banner" style="width:100%; height:auto; border:1px solid #d1d5db; border-radius:4px;" />
          <p style="margin:12px 0 0 0;">Write a short introduction paragraph here to describe your announcement. Keep it concise and helpful.</p>
        </div>
      `,
    },
    {
      label: 'Strange Template',
      description: 'Two columns layout, each with a title and some text.',
      content: `
        <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="width:50%; vertical-align:top; padding:8px;">
              <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:600;">Left Column</h3>
              <p style="margin:0;">This is some example text in the left column. You can replace it.</p>
            </td>
            <td style="width:50%; vertical-align:top; padding:8px;">
              <h3 style="margin:0 0 8px 0; font-size:16px; font-weight:600;">Right Column</h3>
              <p style="margin:0;">This is some example text in the right column. Add your own content here.</p>
            </td>
          </tr>
        </table>
      `,
    },
    {
      label: 'Text and Table',
      description: 'Heading with paragraph and a simple data table.',
      content: `
        <div style="font-size:14px; color:#111827; line-height:1.6;">
          <h3 style="margin:0 0 8px 0; font-weight:700; font-size:18px;">Summary</h3>
          <p style="margin:0 0 12px 0;">Below is a simple table you can edit directly in the email editor.</p>
          <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse; border:1px solid #d1d5db;">
            <thead>
              <tr style="background:#f3f4f6;">
                <th style="text-align:left; border:1px solid #d1d5db;">Item</th>
                <th style="text-align:left; border:1px solid #d1d5db;">Qty</th>
                <th style="text-align:right; border:1px solid #d1d5db;">Price</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border:1px solid #d1d5db;">Example A</td>
                <td style="border:1px solid #d1d5db;">1</td>
                <td style="border:1px solid #d1d5db; text-align:right;">$10.00</td>
              </tr>
              <tr>
                <td style="border:1px solid #d1d5db;">Example B</td>
                <td style="border:1px solid #d1d5db;">2</td>
                <td style="border:1px solid #d1d5db; text-align:right;">$25.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      `,
    },
  ]), [privateLessonDueData, groupLessonDueData, invoiceData, totalBalance, locationName]);

  // Generate table HTML for email content (using real customer data)
  function generateTablesHTML() {
    const sections: string[] = [];
    // Shared inline styles to keep the emailed tables consistent across clients.
    const tableWrapperStyle = `font-family:system-ui,-apple-system,sans-serif;color:#111;`;
    const tableStyle = `width:100%;border-collapse:collapse;font-size:12px;`;
    const thStyle = `text-align:left;border:1px solid #ddd;padding:6px;background-color:#f3f4f6;font-weight:600;`;
    const thRightStyle = `text-align:right;border:1px solid #ddd;padding:6px;background-color:#f3f4f6;font-weight:600;`;
    const tdLeftStyle = `border:1px solid #ddd;padding:6px;text-align:left;`;
    const tdRightStyle = `border:1px solid #ddd;padding:6px;text-align:right;`;

    if (privateLessonDueData.length > 0) {
      const headerRow = `
        <th style="${thStyle}">Date</th>
        <th style="${thStyle}">Student</th>
        <th style="${thStyle}">Program</th>
        <th style="${thStyle}">Teacher</th>
        <th style="${thRightStyle}">Amount</th>
        <th style="${thRightStyle}">Balance</th>`;
      
      const bodyRows = privateLessonDueData
        .map((lesson) => {
          type Legacy = { lessonDate: string; student: string; program: string; teacher: string; amount: number };
          type Api = { lessonDate: string; studentName: string; programName: string; teacherName: string; amount: number | string };
          const isApi = (l: Legacy | Api): l is Api => "studentName" in (l as Record<string, unknown>);
          const student = isApi(lesson as Legacy | Api) ? (lesson as Api).studentName : (lesson as Legacy).student;
          const program = isApi(lesson as Legacy | Api) ? (lesson as Api).programName : (lesson as Legacy).program;
          const teacher = isApi(lesson as Legacy | Api) ? (lesson as Api).teacherName : (lesson as Legacy).teacher;
          const amountVal = (lesson as Legacy | Api).amount as number | string;
          const amountStr = typeof amountVal === "string" ? amountVal : formatCurrency(amountVal);
          return `<tr>
        <td style="${tdLeftStyle}">${lesson.lessonDate}</td>
        <td style="${tdLeftStyle}">${student}</td>
        <td style="${tdLeftStyle}">${program}</td>
        <td style="${tdLeftStyle}">${teacher}</td>
        <td style="${tdRightStyle}">${amountStr}</td>
        <td style="${tdRightStyle}">${amountStr}</td>
      </tr>`;
        })
        .join("");
      
      const privateLessonsSection = `
    <div style="${tableWrapperStyle}">
    <h3 style="margin:16px 0 8px;font-size:14px;">Lessons</h3>
    <table style="${tableStyle}">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    </div>`;
      sections.push(privateLessonsSection);
    }

    if (groupLessonDueData.length > 0) {
      const headerRow = `
        <th style="${thStyle}">Date</th>
        <th style="${thStyle}">Student</th>
        <th style="${thStyle}">Program</th>
        <th style="${thStyle}">Teacher</th>
        <th style="${thRightStyle}">Amount</th>
        <th style="${thRightStyle}">Balance</th>`;
      
      const bodyRows = groupLessonDueData
        .map((lesson) => {
          const amountStr = typeof lesson.amount === "string" ? lesson.amount : formatCurrency(lesson.amount);
          return `<tr>
        <td style="${tdLeftStyle}">${lesson.lessonDate}</td>
        <td style="${tdLeftStyle}">${lesson.studentName}</td>
        <td style="${tdLeftStyle}">${lesson.programName}</td>
        <td style="${tdLeftStyle}">${lesson.teacherName}</td>
        <td style="${tdRightStyle}">${amountStr}</td>
        <td style="${tdRightStyle}">${amountStr}</td>
      </tr>`;
        })
        .join("");
      
      const groupLessonsSection = `
    <div style="${tableWrapperStyle}">
    <h3 style="margin:16px 0 8px;font-size:14px;">Group Lessons Due</h3>
    <table style="${tableStyle}">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    </div>`;
      sections.push(groupLessonsSection);
    }

    if (invoiceData.length > 0) {
      const headerRow = `
        <th style="${thStyle}">Date</th>
        <th style="${thStyle}">Number</th>
        <th style="${thRightStyle}">Amount</th>
        <th style="${thRightStyle}">Balance</th>`;
      
      const bodyRows = invoiceData
        .map((invoice) => `<tr>
        <td style="${tdLeftStyle}">${invoice.date}</td>
        <td style="${tdLeftStyle}">${invoice.id}</td>
        <td style="${tdRightStyle}">${formatCurrency(invoice.total)}</td>
        <td style="${tdRightStyle}">${formatCurrency(invoice.balance)}</td>
      </tr>`)
        .join("");
      
      const invoicesSection = `
    <div style="${tableWrapperStyle}">
    <h3 style="margin:16px 0 8px;font-size:14px;">Invoices</h3>
    <table style="${tableStyle}">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    </div>`;
      sections.push(invoicesSection);
    }

    if (creditData.length > 0) {
      const headerRow = `
        <th style="${thStyle}">Type</th>
        <th style="${thStyle}">Reference</th>
        <th style="${thRightStyle}">Amount</th>`;
      
      const bodyRows = creditData
        .map((credit) => {
          const reference = credit.reference?.trim()
            ? credit.reference
            : `#${credit.id}`;
          return `<tr>
        <td style="${tdLeftStyle}">${credit.type}</td>
        <td style="${tdLeftStyle}">${reference}</td>
        <td style="${tdRightStyle}">${formatCurrency(credit.amount)}</td>
      </tr>`;
        })
        .join("");
      
      const creditsSection = `
    <div style="${tableWrapperStyle}">
    <h3 style="margin:16px 0 8px;font-size:14px;">Payment Credits</h3>
    <table style="${tableStyle}">
      <thead><tr>${headerRow}</tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    </div>`;
      sections.push(creditsSection);
    }

    const shouldShowTotal =
      sections.length > 0 &&
      totalBalance &&
      totalBalance.trim() !== "" &&
      totalBalance.trim() !== "$0.00";

    if (sections.length === 0 && !shouldShowTotal) {
      return "";
    }

    const totalSection = shouldShowTotal
      ? `
  <div style="margin-top:16px;font-size:12px;font-family:system-ui,-apple-system,sans-serif;">
    <table style="width:100%;font-size:12px;border-collapse:collapse;">
      <tr>
        <td style="font-weight:600;text-align:left;border:1px solid #ddd;padding:6px;">Total</td>
        <td style="font-weight:600;text-align:right;border:1px solid #ddd;padding:6px;">${totalBalance}</td>
      </tr>
    </table>
  </div>`
      : "";

    const footer = `
  <div style="margin-top:16px;font-size:12px;">
    <p style="margin:0;"><strong>HST#</strong> FQR547785GT1234</p>
    <p style="margin:16px 0 4px 0;">Thank you,</p>
    <p style="margin:0;">${locationName}</p>
  </div>`;

    return `
<div style="margin-top:16px;">
  ${sections.join("\n")}
  ${totalSection}
  ${footer}
</div>`;
  }

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

  // Process HTML to add inline styles for email compatibility
  const processEmailHTML = (html: string): string => {
    // Use DOMParser to parse and modify HTML
    if (typeof window === 'undefined') {
      // Fallback for SSR - use regex to add basic styles
      return html
        .replace(
          /<table([^>]*class="[^"]*")?([^>]*)>/gi,
          (match, classAttr, rest) => {
            const existingStyle = rest.match(/style="([^"]*)"/i)?.[1] || '';
            const tableStyles = [
              'width:100%',
              'border-collapse:collapse',
              'font-size:12px',
              'font-family:system-ui,-apple-system,sans-serif',
              'color:#111'
            ].join(';');
            const finalStyle = existingStyle ? `${existingStyle};${tableStyles}` : tableStyles;
            return `<table${classAttr || ''} style="${finalStyle}"${rest.replace(/style="[^"]*"/gi, '')}>`;
          }
        )
        .replace(
          /<th([^>]*)>/gi,
          (match, attrs) => {
            const existingStyle = attrs.match(/style="([^"]*)"/i)?.[1] || '';
            const thStyles = [
              'text-align:left',
              'border:1px solid #ddd',
              'padding:6px',
              'background-color:#f3f4f6',
              'font-weight:600'
            ].join(';');
            const finalStyle = existingStyle ? `${existingStyle};${thStyles}` : thStyles;
            return `<th style="${finalStyle}"${attrs.replace(/style="[^"]*"/gi, '')}>`;
          }
        )
        .replace(
          /<td([^>]*)>/gi,
          (match, attrs) => {
            const existingStyle = attrs.match(/style="([^"]*)"/i)?.[1] || '';
            const tdStyles = [
              'border:1px solid #ddd',
              'padding:6px',
              'text-align:left'
            ].join(';');
            const finalStyle = existingStyle ? `${existingStyle};${tdStyles}` : tdStyles;
            return `<td style="${finalStyle}"${attrs.replace(/style="[^"]*"/gi, '')}>`;
          }
        );
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const tables = doc.querySelectorAll('table');

    tables.forEach((table) => {
      // Add styles to table
      const existingTableStyle = table.getAttribute('style') || '';
      const tableStyles = [
        'width:100%',
        'border-collapse:collapse',
        'font-size:12px',
        'font-family:system-ui,-apple-system,sans-serif',
        'color:#111'
      ].join(';');
      table.setAttribute('style', existingTableStyle ? `${existingTableStyle};${tableStyles}` : tableStyles);

      // Find header row to determine column alignment
      const headerRow = table.querySelector('tr');
      const numericColumnIndices: number[] = [];
      
      if (headerRow) {
        const headers = Array.from(headerRow.querySelectorAll('th, td'));
        headers.forEach((header, index) => {
          const headerText = header.textContent?.toLowerCase().trim() || '';
          if (headerText.includes('amount') || headerText.includes('balance') || 
              headerText.includes('payment') || headerText.includes('total') ||
              headerText.includes('price')) {
            numericColumnIndices.push(index + 1);
          }
        });
      }

      // Process header cells
      const thElements = table.querySelectorAll('th');
      thElements.forEach((th, index) => {
        const existingStyle = th.getAttribute('style') || '';
        const columnIndex = Array.from(th.parentElement?.children || []).indexOf(th) + 1;
        const isNumericColumn = numericColumnIndices.includes(columnIndex);
        const alignStyle = isNumericColumn ? 'text-align:right' : 'text-align:left';
        
        const thStyles = [
          alignStyle,
          'border:1px solid #ddd',
          'padding:6px',
          'background-color:#f3f4f6',
          'font-weight:600'
        ].join(';');
        th.setAttribute('style', existingStyle ? `${existingStyle};${thStyles}` : thStyles);
      });

      // Process data cells
      const tdElements = table.querySelectorAll('td');
      tdElements.forEach((td) => {
        const existingStyle = td.getAttribute('style') || '';
        const columnIndex = Array.from(td.parentElement?.children || []).indexOf(td) + 1;
        const isNumericColumn = numericColumnIndices.includes(columnIndex);
        const alignStyle = isNumericColumn ? 'text-align:right' : 'text-align:left';
        
        const tdStyles = [
          'border:1px solid #ddd',
          'padding:6px',
          alignStyle
        ].join(';');
        td.setAttribute('style', existingStyle ? `${existingStyle};${tdStyles}` : tdStyles);
      });
    });

    return doc.body.innerHTML;
  };

  const handleSend = () => {
    if (validateForm()) {
      // Process HTML to add inline styles for email compatibility
      const processedContent = processEmailHTML(content);
      
      onSend({
        recipients,
        subject,
        content: processedContent  // Processed email with inline styles
      });
      handleCancel();
    }
  };

  const handleDelete = () => {
    onDelete?.();
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

  const leftActions = React.useMemo(() => {
    if (!showDeleteButton || !onDelete) {
      return undefined;
    }

    return [
      {
        label: "Delete",
        onClick: handleDelete,
        variant: "destructive" as const,
      },
    ];
  }, [showDeleteButton, onDelete, handleDelete]);

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
        leftActions={leftActions}
      >
        {/* Inner content constrained to a readable width like other modals */}
        <div className="space-y-4 w-full max-w-3xl mx-auto">
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
              key={`email-editor-${open}-${initialContent ? 'api' : 'default'}`}
              content={content}
              onChange={(value) => {
                setContent(value);
                setErrors(prev => ({ ...prev, content: undefined }));
              }}
              onFullscreenChange={setIsContentExpanded}
              isFullscreen={isContentExpanded}
              templates={editorTemplates}
              localStorageKey={`email-statement-${locationName}`}
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
              key={`email-editor-fullscreen-${open}-${initialContent ? 'api' : 'default'}`}
              content={content}
              onChange={(value) => {
                setContent(value);
                setErrors(prev => ({ ...prev, content: undefined }));
              }}
              isFullscreen={true}
              className="fullscreen"
              templates={editorTemplates}
              localStorageKey={`email-statement-${locationName}`}
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


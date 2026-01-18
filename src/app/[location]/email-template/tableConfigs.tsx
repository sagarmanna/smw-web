"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import DOMPurify from "dompurify";
import type { EmailTemplateRow } from "./types";

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows only safe HTML tags: p, br, strong, em, u, a, span, div, h1-h6, ul, ol, li
 * Allows style attribute for color formatting
 */
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'span', 'div', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'sub', 'sup', 'mark'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'data-color'],
    ALLOW_DATA_ATTR: true,
  });
};

/**
 * Strips HTML tags to get plain text for preview/tooltip
 */
const stripHtmlTags = (html: string): string => {
  return html.replace(/<[^>]*>/g, '').trim();
};

// Column definitions for email templates table
export const getEmailTemplateColumns = (): ColumnDef<EmailTemplateRow>[] => {
  return [
    {
      accessorKey: "type",
      header: () => <span className="font-medium">Type</span>,
      cell: ({ row }: { row: { original: EmailTemplateRow } }) => (
        <div className="flex items-center h-full">
          <span className="text-sm font-medium truncate" title={row.original.type}>
            {row.original.type}
          </span>
        </div>
      ),
      enableSorting: false,
      size: 150,
      meta: { printable: true, printableName: "Type" },
    },
    {
      accessorKey: "subject",
      header: () => <span className="font-medium">Subject</span>,
      cell: ({ row }: { row: { original: EmailTemplateRow } }) => (
        <div className="flex items-center h-full">
          <span className="text-sm font-medium truncate" title={row.original.subject}>
            {row.original.subject}
          </span>
        </div>
      ),
      enableSorting: false,
      size: 250,
      meta: { printable: true, printableName: "Subject" },
    },
    {
      accessorKey: "header",
      header: () => <span>Header</span>,
      cell: ({ row }: { row: { original: EmailTemplateRow } }) => {
        const header = row.original.header || "";
        // Sanitize HTML to prevent XSS attacks
        const sanitizedContent = sanitizeHtml(header);
        // Strip HTML tags for text preview in tooltip
        const textContent = stripHtmlTags(header);
        
        return (
          <div className="py-2.5 align-top" role="textbox" aria-label="Header">
            <div
              className="text-sm [&_strong]:font-semibold [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_p]:leading-[1.6] break-words whitespace-normal [&_mark]:rounded [&_mark]:px-0.5"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              title={textContent}
              aria-label={textContent}
            />
          </div>
        );
      },
      enableSorting: false,
      size: 300,
      meta: { printable: true, printableName: "Header" },
    },
    {
      accessorKey: "footer",
      header: () => <span>Footer</span>,
      cell: ({ row }: { row: { original: EmailTemplateRow } }) => {
        const footer = row.original.footer || "";
        // Sanitize HTML to prevent XSS attacks
        const sanitizedContent = sanitizeHtml(footer);
        // Strip HTML tags for text preview in tooltip
        const textContent = stripHtmlTags(footer);
        
        return (
          <div className="py-2.5 align-top" role="textbox" aria-label="Footer">
            <div
              className="text-sm [&_strong]:font-semibold [&_p]:mb-1.5 [&_p:last-child]:mb-0 [&_p]:leading-[1.6] break-words whitespace-normal [&_mark]:rounded [&_mark]:px-0.5"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              title={textContent}
              aria-label={textContent}
            />
          </div>
        );
      },
      enableSorting: false,
      size: 300,
      meta: { printable: true, printableName: "Footer" },
    },
  ];
};

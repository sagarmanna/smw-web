"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import DOMPurify from "dompurify";
import type { ReleaseNoteRow } from "./types";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Action cell component that uses callbacks for modals
const ActionCell = ({ 
  row, 
  onView,
  onEdit,
  onDelete 
}: { 
  row: { original: ReleaseNoteRow; index: number }; 
  onView?: (id: number | string) => void;
  onEdit?: (id: number | string) => void;
  onDelete?: (id: number | string) => void;
}) => {
  // Use id if available, otherwise use index-based identifier
  const identifier = row.original.id ?? `index-${row.index}`;
  
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView && row.original.id) {
      onView(row.original.id);
    }
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit && row.original.id) {
      onEdit(row.original.id);
    }
  };
  
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && row.original.id) {
      onDelete(row.original.id);
    }
  };
  
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 h-full py-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-primary/10"
        onClick={handleView}
        title="View"
      >
        <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
      </Button>
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-primary/10"
          onClick={handleEdit}
          title="Edit"
        >
          <Pencil className="h-4 w-4 text-muted-foreground hover:text-primary" />
        </Button>
      )}
      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleDelete}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

// Column definitions for release notes table
// Accepts location parameter for navigation and pagination info for row numbering
// isAdmin parameter controls whether edit/delete actions are shown
export const getReleaseNoteColumns = (
  location: string,
  page: number = 1,
  pageSize: number = 10,
  onView?: (id: number | string) => void,
  onEdit?: (id: number | string) => void,
  onDelete?: (id: number | string) => void,
  isAdmin: boolean = false
): ColumnDef<ReleaseNoteRow>[] => {
  const baseColumns: ColumnDef<ReleaseNoteRow>[] = [
  {
    accessorKey: "id",
    header: () => <span className="font-medium">#</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow; index: number } }) => {
      // Calculate row number based on position in full list: (page - 1) * pageSize + rowIndex + 1
      // This ensures sequential numbering 1, 2, 3... based on API response order
      const rowNumber = (page - 1) * pageSize + row.index + 1;
      
      return (
        <div className="flex items-center justify-center h-full">
          <span className="text-sm font-medium text-muted-foreground">
            {rowNumber}
          </span>
        </div>
      );
    },
    enableSorting: false,
    size: 50,
    meta: { printable: true, printableName: "#" },
  },
  {
    accessorKey: "subject",
    header: () => <span className="font-medium">Subject</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow } }) => (
      <div className="flex items-center h-full">
        <span className="text-sm font-medium truncate" title={row.original.subject}>
          {row.original.subject}
        </span>
      </div>
    ),
    enableSorting: true,
    size: 200,
    meta: { printable: true, printableName: "Subject" },
  },
  {
    accessorKey: "summary",
    header: () => <span>Summary</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow } }) => {
      const summary = row.original.summary || "";
      // Sanitize HTML to prevent XSS attacks
      const sanitizedContent = sanitizeHtml(summary);
      // Strip HTML tags for text preview in tooltip
      const textContent = stripHtmlTags(summary);
      const truncatedText = textContent.length > 100 
        ? textContent.substring(0, 100) + "..." 
        : textContent;
      
      return (
        <div className="py-2.5 align-top" role="textbox" aria-label="Summary">
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
    size: 450,
    meta: { printable: true, printableName: "Summary" },
  },
  {
    accessorKey: "notes",
    header: () => <span>Notes</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow } }) => {
      const notes = row.original.notes || "";
      // Sanitize HTML to prevent XSS attacks
      const sanitizedContent = sanitizeHtml(notes);
      // Strip HTML tags for text preview in tooltip
      const textContent = stripHtmlTags(notes);
      const truncatedText = textContent.length > 150 
        ? textContent.substring(0, 150) + "..." 
        : textContent;
      
      return (
        <div className="py-2.5 align-top" role="textbox" aria-label="Notes">
          <div
            className="text-sm text-muted-foreground [&_strong]:font-semibold [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:leading-[1.6] break-words whitespace-normal [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mt-1.5 [&_ol]:mb-1.5 [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mt-1.5 [&_ul]:mb-1.5 [&_li]:mb-1 [&_li]:leading-[1.6] [&_li]:pl-1 [&_mark]:rounded [&_mark]:px-0.5"
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            title={textContent}
            aria-label={textContent}
          />
        </div>
      );
    },
    enableSorting: false,
    size: 900,
    meta: { printable: true, printableName: "Notes" },
  },
  {
    accessorKey: "scheduleDate",
    header: () => <span className="font-medium">Schedule date</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow } }) => (
      <div className="flex items-center h-full">
        <span className="text-sm text-muted-foreground" title={row.original.scheduleDate}>
          {row.original.scheduleDate}
        </span>
      </div>
    ),
    enableSorting: true,
    size: 130,
    meta: { printable: true, printableName: "Schedule date" },
  },
  {
    accessorKey: "createdDate",
    header: () => <span className="font-medium">Created Date</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow } }) => (
      <div className="flex items-center h-full">
        <span className="text-sm text-muted-foreground" title={row.original.createdDate}>
          {row.original.createdDate}
        </span>
      </div>
    ),
    enableSorting: true,
    size: 130,
    meta: { printable: true, printableName: "Created Date" },
  },
  {
    accessorKey: "userPublicIdentity",
    header: () => <span className="font-medium">User Public Identity</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow } }) => (
      <div className="flex items-center h-full">
        <span className="text-sm text-muted-foreground truncate" title={row.original.userPublicIdentity}>
          {row.original.userPublicIdentity}
        </span>
      </div>
    ),
    enableSorting: false,
    size: 160,
    meta: { printable: true, printableName: "User Public Identity" },
  },
  ];

  // Add action column for all users (view only for non-admin, view/edit/delete for admin)
  baseColumns.push({
    id: "actions",
    header: () => <span className="font-medium">Action</span>,
    cell: ({ row }: { row: { original: ReleaseNoteRow; index: number } }) => (
      <ActionCell 
        row={row} 
        onView={onView}
        onEdit={isAdmin ? onEdit : undefined}
        onDelete={isAdmin ? onDelete : undefined}
      />
    ),
    enableSorting: false,
    size: 60,
  });

  return baseColumns;
};

// Default export for backward compatibility
export const releaseNoteColumns = getReleaseNoteColumns('', 1, 10, undefined, undefined, undefined, false);


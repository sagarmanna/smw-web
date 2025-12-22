import React, { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DOMPurify from "dompurify";
import { formatCurrency } from "@/utils/formatCurrency";

// Data interfaces
export interface EnrolmentData {
  program: string;
  teacher: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

export interface PrivateLessonData {
  dueDate: string;
  programName: string;
  date: string;
  duration: string;
  status: string;
  price: number;
  owing: number;
  online: string;
  id?: number;
  url?: string;
}

export interface GroupLessonData {
  id?: number;
  dueDate: string;
  programName: string;
  date: string;
  duration: string;
  status: string;
  price: string;
  owing: string; 
  online: string;
  url?: string;
}

export interface AbsentLessonData {
  id: number;
  date: string;
  program: string;
  teacher: string;
  duration: string;
  invoiceId: number;
  invoiceNumber: string;
  online: string;
  url: string;
}

export interface UnscheduledLessonData {
  id: number;
  program: string;
  phone: string;
  duration: string;
  originalDate: string;
  expiryDate: string;
  online: string;
  url: string;
}

export interface CommentData {
  id: number;
  content: string;
  createdUser: string;
  avatar: string;
  createdOn: string;
}

export interface HistoryData {
  id: number;
  message: string;
  createdOn: string;
}

// Column definitions
export const enrolmentColumns: ColumnDef<EnrolmentData>[] = [
  { accessorKey: "program", header: "Program" },
  { accessorKey: "teacher", header: "Teacher" },
  { accessorKey: "day", header: "Day" },
  { accessorKey: "fromTime", header: "From Time" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "endDate", header: "End Date" },
];

export const privateLessonColumns: ColumnDef<PrivateLessonData>[] = [
  { 
    accessorKey: "dueDate", 
    header: "Due Date",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "programName", 
    header: "Program Name",
    size: 200,
    minSize: 150,
    maxSize: 300,
  },
  { 
    accessorKey: "date", 
    header: "Date",
    size: 180,
    minSize: 150,
    maxSize: 220,
  },
  { 
    accessorKey: "duration", 
    header: "Duration",
    size: 100,
    minSize: 80,
    maxSize: 120,
  },
  { 
    accessorKey: "status", 
    header: "Status",
    size: 120,
    minSize: 100,
    maxSize: 150,
  },
  { 
    accessorKey: "price", 
    header: "Price",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => formatCurrency(row.original.price),
  },
  { 
    accessorKey: "owing", 
    header: "Owing",
    size: 100,
    minSize: 80,
    maxSize: 120,
    cell: ({ row }) => formatCurrency(row.original.owing),
  },
  { 
    accessorKey: "online", 
    header: "Online",
    size: 80,
    minSize: 60,
    maxSize: 100,
  },
];

export const groupLessonColumns: ColumnDef<GroupLessonData>[] = [
  { 
    accessorKey: "dueDate", 
    header: "Due Date",
  },
  { 
    accessorKey: "programName", 
    header: "Program Name",
  },
  { 
    accessorKey: "date", 
    header: "Date",
  },
  { 
    accessorKey: "duration", 
    header: "Duration",
  },
  { 
    accessorKey: "status", 
    header: "Status",
  },
  { 
    accessorKey: "price", 
    header: "Price",
  },
  { 
    accessorKey: "owing", 
    header: "Owing",
  },
  { 
    accessorKey: "online", 
    header: "Online",
  },
];

export const getAbsentLessonColumns = (location: string): ColumnDef<AbsentLessonData>[] => [
  { accessorKey: "date", header: "Date" },
  { accessorKey: "program", header: "Program" },
  { accessorKey: "teacher", header: "Teacher" },
  { accessorKey: "duration", header: "Duration" },
  {
    accessorKey: "invoiceNumber",
    header: "Invoice ID",
    cell: ({ row }) => {
      const invoiceNumber = row.original.invoiceNumber;
      const invoiceId = row.original.invoiceId;
      
      const handleInvoiceClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent row click
        if (invoiceId) {
          const url = `${process.env.NEXT_PUBLIC_LEGACY_URL}/${location}/invoice/view?id=${invoiceId}`;
          window.location.href = url;
        }
      };
      
      return (
        <div className="flex items-center h-full">
          {invoiceNumber ? (
            <span
              onClick={handleInvoiceClick}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer font-medium"
              title={`View invoice ${invoiceNumber}`}
            >
              {invoiceNumber}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      );
    },
  },
  { accessorKey: "online", header: "Online" },
];

// Default export for backward compatibility
export const absentLessonColumns = getAbsentLessonColumns('');

export const unscheduledLessonColumns: ColumnDef<UnscheduledLessonData>[] = [
  { accessorKey: "program", header: "Program" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "originalDate", header: "Original Date" },
  { accessorKey: "expiryDate", header: "Expiry Date" },
  { accessorKey: "online", header: "Online" },
];

export const commentColumns: ColumnDef<CommentData>[] = [
  { accessorKey: "createdOn", header: "Date" },
  { accessorKey: "createdUser", header: "Author" },
  { accessorKey: "content", header: "Comment" },
];

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Allows only safe HTML tags and attributes for history messages
 */
const sanitizeHistoryHtml = (html: string): string => {
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'span', 'div', 'b', 'i'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
      ALLOW_DATA_ATTR: false,
    });
  } catch (error) {
    console.error('Error sanitizing HTML:', error);
    // Return escaped HTML as fallback
    return html.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};

/**
 * Processes HTML links to ensure they open in the same window and have consistent styling
 */
const processHistoryLinks = (html: string): string => {
  try {
    // Use DOMParser for proper HTML parsing instead of regex
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');

    links.forEach((link) => {
      // Set target to _self for same-window navigation
      link.setAttribute('target', '_self');
      
      // Add consistent styling classes
      const existingClasses = link.getAttribute('class') || '';
      const linkClasses = 'text-blue-600 hover:text-blue-800 font-medium';
      if (!existingClasses.includes('text-blue-600')) {
        link.setAttribute('class', existingClasses ? `${existingClasses} ${linkClasses}` : linkClasses);
      }
    });

    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error processing links:', error);
    // Fallback to regex-based approach if DOMParser fails
    return html.replace(
      /<a\b([^>]*)>/g,
      (_match, attrs: string) => {
        let newAttrs = attrs || "";
        newAttrs = newAttrs.replace(/target="[^"]*"/g, '');
        newAttrs += ' target="_self"';
        const linkClasses = "text-blue-600 hover:text-blue-800 font-medium";
        if (/class=/.test(newAttrs)) {
          newAttrs = newAttrs.replace(
            /class=\"([^\"]*)\"/,
            (_m, cls: string) => `class="${cls} ${linkClasses}"`
          );
        } else {
          newAttrs += ` class="${linkClasses}"`;
        }
        return `<a${newAttrs}>`;
      }
    );
  }
};

/**
 * Component for rendering history messages with secure HTML and link handling
 */
const HistoryMessageCell: React.FC<{ item: HistoryData }> = ({ item }) => {
  // Memoize the processed HTML to avoid reprocessing on every render
  const processedHtml = useMemo(() => {
    try {
      const createdOn = item.createdOn || "";
      const message = item.message || "";
      const combined = createdOn ? `On ${createdOn}, ${message}` : message;
      
      // First sanitize the HTML
      const sanitized = sanitizeHistoryHtml(combined);
      
      // Then process links for same-window navigation and styling
      const withProcessedLinks = processHistoryLinks(sanitized);
      
      return withProcessedLinks;
    } catch (error) {
      console.error('Error processing history message:', error);
      // Fallback: return escaped text
      const createdOn = item.createdOn || "";
      const message = item.message || "";
      const combined = createdOn ? `On ${createdOn}, ${message}` : message;
      return combined.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  }, [item.createdOn, item.message]);

  // Memoize click handler to avoid recreating on every render
  const handleLinkClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    try {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();
      event.stopPropagation();

      // Validate URL before navigation to prevent security issues
      try {
        // Allow both absolute URLs and relative paths
        if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('/')) {
          window.location.href = href;
        } else {
          console.warn('Invalid URL format:', href);
        }
      } catch (urlError) {
        console.error('Error navigating to URL:', urlError);
      }
    } catch (error) {
      console.error('Error handling link click:', error);
    }
  }, []);

  return (
    <div 
      className="text-sm" 
      dangerouslySetInnerHTML={{ __html: processedHtml }}
      onClick={handleLinkClick}
      role="textbox"
      aria-label="History message"
    />
  );
};

export const historyColumns: ColumnDef<HistoryData>[] = [
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      return <HistoryMessageCell item={row.original} />;
    },
  },
];

// Tab configuration interface
export interface StudentTabConfig<TData = unknown> {
  id: string;
  title: string;
  hasAddButton: boolean;
  hasTable: boolean;
  emptyState?: string;
  columns?: ColumnDef<TData>[];
  dataKey: string;
  showMoreButton?: boolean;
  showAllCheckbox?: boolean;
  dropdownItems?: Array<{ label: string; onClick: () => void }>;
  dropdownLabel?: string;
}

// Tab configurations
export const STUDENT_TAB_CONFIGS: Record<string, StudentTabConfig<unknown>> = {
  "private-lessons": {
    id: "private-lessons",
    title: "Private Lessons",
    hasAddButton: true,
    hasTable: true,
    columns: privateLessonColumns as ColumnDef<unknown>[],
    dataKey: "privateLessonData",
    showMoreButton: true,
  },
  "group-lessons": {
    id: "group-lessons",
    title: "Group Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: groupLessonColumns as ColumnDef<unknown>[],
    dataKey: "groupLessonData",
  },
  "absent-lessons": {
    id: "absent-lessons",
    title: "Absent Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: getAbsentLessonColumns('') as ColumnDef<unknown>[],
    dataKey: "absentLessonData",
  },
  "unscheduled-lessons": {
    id: "unscheduled-lessons",
    title: "Unscheduled Lessons",
    hasAddButton: false,
    hasTable: true,
    columns: unscheduledLessonColumns as ColumnDef<unknown>[],
    dataKey: "unscheduledLessonData",
    showAllCheckbox: true,
    dropdownItems: [
      { label: "Change Program/Teacher..", onClick: () => {
        // TODO: Implement change program/teacher functionality
      } },
      
    ],
    dropdownLabel: "Actions",
  },
  comments: {
    id: "comments",
    title: "Comments",
    hasAddButton: false,
    hasTable: false,
    emptyState: "No results found.",
    columns: commentColumns as ColumnDef<unknown>[],
    dataKey: "commentData",
  },
  history: {
    id: "history",
    title: "History",
    hasAddButton: false,
    hasTable: true,
    columns: historyColumns as ColumnDef<unknown>[],
    dataKey: "historyData",
  },
};

// Tab order
export const STUDENT_TAB_ORDER = [
  "private-lessons",
  "group-lessons",
  "absent-lessons",
  "unscheduled-lessons",
  "comments",
  "history",
];


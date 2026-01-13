import React, { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { formatISOToDisplay } from "@/utils/dateUtils";
import { createHistoryTabConfig } from "@/components/tabs/HistoryTab";
import { fetchHistoryData } from "../ownersTabs.slice";
import type { HistoryTabConfig } from "@/components/tabs/HistoryTab";
import DOMPurify from "dompurify";

// Data interfaces
export interface HistoryData {
  id: string;
  message: string;
  createdOn: string;
}

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
      
      // Format the date if it exists
      // Check if date is ISO format (contains T or Z) or already formatted
      let formattedDate = "";
      if (createdOn) {
        try {
          // If it's ISO format, format it; otherwise use as-is
          if (createdOn.includes('T') || createdOn.includes('Z')) {
            formattedDate = formatISOToDisplay(createdOn);
          } else {
            formattedDate = createdOn;
          }
        } catch {
          // If formatISOToDisplay fails, use the date as-is
          formattedDate = createdOn;
        }
      }
      
      const combined = formattedDate ? `On ${formattedDate}, ${message}` : message;
      
      // First sanitize the HTML
      const sanitized = sanitizeHistoryHtml(combined);
      
      // Then process links for same-window navigation and styling
      const withProcessedLinks = processHistoryLinks(sanitized);
      
      return withProcessedLinks;
    } catch (error) {
      console.error('Error processing history message:', error);
      // Fallback: return escaped text without date formatting to avoid double errors
      const message = item.message || "";
      return message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
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
      role="region"
      aria-label="History message"
    />
  );
};

// Column definitions
export const historyColumns: ColumnDef<HistoryData>[] = [
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => {
      return <HistoryMessageCell item={row.original} />;
    },
  },
];

/**
 * Redux state selectors for owner history tab
 * Extracted for reusability and testability
 */
export const ownerHistorySelectors = {
  selectData: (state: unknown): HistoryData[] => {
    const ownerState = state as { ownerTabs: { historyData: HistoryData[] } };
    return ownerState.ownerTabs.historyData;
  },
  selectLoading: (state: unknown): boolean => {
    const ownerState = state as { ownerTabs: { historyLoading: boolean } };
    return ownerState.ownerTabs.historyLoading;
  },
  selectError: (state: unknown): string | null => {
    const ownerState = state as { ownerTabs: { historyError: string | null } };
    return ownerState.ownerTabs.historyError;
  },
  selectEntityId: (state: unknown): number | null => {
    const ownerState = state as { ownerTabs: { historyOwnerId: number | null } };
    return ownerState.ownerTabs.historyOwnerId;
  },
  selectPagination: (state: unknown): {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null => {
    const ownerState = state as { ownerTabs: { historyPagination: { page: number; limit: number; total: number; totalPages: number } | null } };
    return ownerState.ownerTabs.historyPagination;
  },
};

/**
 * Factory function to create owner history tab configuration
 * Memoize this in the component that uses it
 */
export function createOwnerHistoryTabConfig(): HistoryTabConfig<HistoryData> {
  return createHistoryTabConfig({
    selectors: ownerHistorySelectors,
    columns: historyColumns,
    fetchAction: fetchHistoryData,
    entityIdParamName: "ownerId",
  });
}

// Tab configuration
export interface TabConfig {
  id: string;
  title: string;
}

export const OWNER_TAB_CONFIGS: Record<string, TabConfig> = {
  history: {
    id: "history",
    title: "History",
  },
};

// Tab order
export const OWNER_TAB_ORDER: string[] = [
  "history",
];


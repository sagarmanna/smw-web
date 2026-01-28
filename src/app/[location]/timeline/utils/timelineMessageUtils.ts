/**
 * Utility functions for processing timeline messages
 * Reference: enrolments/utils/historyUtils.ts, private-lessons/utils/historyUtils.ts
 *
 * Key differences from history utils:
 * - Invoice links: Open in new tab (legacy URLs from API)
 * - Student/Customer links: Navigate to new v2 routes
 * - Timeline HTML is sanitized before being rendered
 */

import DOMPurify from "dompurify";

// Link styling constants
const LINK_CLASSES = "text-blue-600 hover:text-blue-800 font-medium cursor-pointer";

/**
 * Sanitizes HTML content for timeline messages to prevent XSS attacks
 * Allows only safe HTML tags and attributes
 */
function sanitizeTimelineHtml(html: string): string {
  try {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "s", "a", "span", "div", "b", "i"],
      ALLOWED_ATTR: ["href", "target", "rel", "class"],
      ALLOW_DATA_ATTR: false,
    });
  } catch (error) {
    console.error("Error sanitizing timeline HTML:", error);
    // Return escaped HTML as fallback
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

/**
 * Parses a legacy URL to extract route information
 * @param url - Full URL from API response
 * @returns Parsed route info or null
 */
function parseUrl(url: string): { type: 'invoice' | 'student' | 'customer'; id: string } | null {
  try {
    // Extract ID (works for all URL types)
    const idMatch = url.match(/[&?]id=(\d+)/);
    if (!idMatch) return null;

    const id = idMatch[1];

    // Determine type
    if (url.includes('/invoice/view')) {
      return { type: 'invoice', id };
    }
    
    if (url.includes('/student/view')) {
      return { type: 'student', id };
    }
    
    if (url.includes('/user/view')) {
      return { type: 'customer', id };
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Processes HTML links in timeline messages - keeps original URLs and adds styling
 * Similar to enrolments/utils/historyUtils.ts but keeps hrefs for click interception
 * @param html - HTML string from API response
 * @returns Processed HTML with styled links
 */
export function processTimelineLinks(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');

    links.forEach((link) => {
      // Keep original href from API response - don't modify
      
      // Add consistent styling classes
      const existingClasses = link.getAttribute('class') || '';
      if (!existingClasses.includes('text-blue-600')) {
        link.setAttribute('class', existingClasses ? `${existingClasses} ${LINK_CLASSES}` : LINK_CLASSES);
      }
    });

    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error processing timeline links:', error);
    return html;
  }
}

/**
 * Processes timeline message for display
 * - Sanitizes HTML from API
 * - Then processes links for styling and routing
 * @param message - Message string from API (contains HTML links)
 * @returns Processed HTML ready for rendering
 */
export function processTimelineMessage(message: string): string {
  try {
    const sanitized = sanitizeTimelineHtml(message);
    return processTimelineLinks(sanitized);
  } catch (error) {
    console.error("Error processing timeline message:", error);
    return message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

/**
 * Safely derives location from the current pathname if not provided
 */
function getLocationFromPathname(): string | null {
  if (typeof window === "undefined") return null;

  const segments = window.location.pathname.split("/").filter(Boolean);
  // Expected pattern: /{location}/timeline
  return segments[0] || null;
}

/**
 * Creates click handler for timeline links
 * Reference: studentTabConfigs.tsx HistoryMessageCell handleLinkClick
 * - Invoice URLs: Open in new tab
 * - Student/Customer URLs: Navigate to new v2 routes
 * @param router - Next.js router instance
 * @param location - Optional current location (falls back to URL)
 * @returns Click handler function
 */
export function createTimelineLinkClickHandler(
  router: { push: (url: string) => void },
  location?: string
) {
  return (event: React.MouseEvent<HTMLDivElement>) => {
    try {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      event.preventDefault();
      event.stopPropagation();

      // Parse the URL to determine routing strategy
      const urlInfo = parseUrl(href);

      if (!urlInfo) {
        // Unknown URL format - open as-is in new tab
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }

      // Determine effective location (prop → URL → fallback)
      const effectiveLocation = location || getLocationFromPathname();

      // If we still don't have a location, open in new tab as a safe fallback
      if (!effectiveLocation) {
        window.open(href, '_blank', 'noopener,noreferrer');
        return;
      }

      // Route based on URL type
      switch (urlInfo.type) {
        case 'invoice':
          // Invoice links: Open legacy URL in new tab
          window.open(href, '_blank', 'noopener,noreferrer');
          break;

        case 'student':
          // Student links: Navigate to new v2 route
          router.push(`/${effectiveLocation}/students/${urlInfo.id}`);
          break;

        case 'customer':
          // Customer links: Navigate to new v2 route
          router.push(`/${effectiveLocation}/customers/${urlInfo.id}`);
          break;

        default:
          // Fallback: open in new tab
          window.open(href, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Error handling timeline link click:', error);
    }
  };
}

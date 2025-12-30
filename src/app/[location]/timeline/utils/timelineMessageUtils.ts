/**
 * Utility functions for processing timeline messages
 * Similar pattern to enrolment historyUtils.ts
 */

// CSS classes for links
const LINK_CLASSES = "text-blue-600 hover:text-blue-800 font-medium";
const CLICKABLE_STUDENT_CLASSES = "text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer";

/**
 * Processes HTML links in timeline messages to ensure consistent styling and target="_blank"
 * @param html - The HTML string containing links
 * @returns Processed HTML string with updated link attributes
 */
export function processTimelineLinks(html: string): string {
  try {
    // Use DOMParser for proper HTML parsing instead of regex
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');

    links.forEach((link) => {
      // Ensure target="_blank" for new tab navigation
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      // Add consistent styling classes
      const existingClasses = link.getAttribute('class') || '';
      if (!existingClasses.includes('text-blue-600')) {
        link.setAttribute('class', existingClasses ? `${existingClasses} ${LINK_CLASSES}` : LINK_CLASSES);
      }
    });

    return doc.body.innerHTML;
  } catch (error) {
    console.error('Error processing links with DOMParser, using regex fallback:', error);
    // Fallback to regex-based approach if DOMParser fails
    return html.replace(
      /<a\b([^>]*)>/g,
      (_match, attrs: string) => {
        let newAttrs = attrs || "";
        // Remove existing target if present
        newAttrs = newAttrs.replace(/target="[^"]*"/g, '');
        // Set target to _blank for new tab navigation
        newAttrs += ' target="_blank" rel="noopener noreferrer"';
        
        // Add or update classes
        if (/class=/.test(newAttrs)) {
          newAttrs = newAttrs.replace(
            /class="([^"]*)"/,
            (_m, cls: string) => `class="${cls} ${LINK_CLASSES}"`
          );
        } else {
          newAttrs += ` class="${LINK_CLASSES}"`;
        }
        return `<a${newAttrs}>`;
      }
    );
  }
}

/**
 * Makes student names clickable by replacing them with clickable spans
 * @param message - The message string
 * @param studentName - The student name to make clickable
 * @param customerId - The customer ID for navigation
 * @returns HTML string with clickable student name
 */
export function makeStudentNameClickable(message: string, studentName: string, customerId: number): string {
  const escapedName = studentName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nameRegex = new RegExp(`(for\\s+)${escapedName}(?![^<]*>)`, "gi");
  const clickableSpan = `<span data-customer-id="${customerId}" class="${CLICKABLE_STUDENT_CLASSES}">${studentName}</span>`;
  return message.replace(nameRegex, (_, prefix) => `${prefix}${clickableSpan}`);
}

/**
 * Processes a complete timeline message for display
 * @param message - The message string
 * @param studentName - Optional student name to make clickable
 * @param customerId - Optional customer ID for student navigation
 * @returns Processed HTML string ready for rendering
 */
export function processTimelineMessage(
  message: string,
  studentName?: string,
  customerId?: number
): string {
  try {
    let processed = message;

    // Make student name clickable if customerId exists
    if (customerId && studentName) {
      processed = makeStudentNameClickable(processed, studentName, customerId);
    }

    // Style invoice links
    processed = processTimelineLinks(processed);

    return processed;
  } catch (error) {
    console.error('Error processing timeline message:', error);
    // Fallback: return escaped text
    return message.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/**
 * Creates a click handler for timeline message links
 * Handles both customer links (student names) and invoice links
 * @param location - The location parameter for URL construction
 * @param legacyBaseUrl - The legacy base URL
 * @returns Click handler function
 */
export function createTimelineLinkClickHandler(
  location: string,
  legacyBaseUrl: string
) {
  return (event: React.MouseEvent<HTMLDivElement>) => {
    try {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Check if clicked element is a student name span (customer link)
      const customerId = target.getAttribute("data-customer-id");
      if (customerId) {
        event.preventDefault();
        event.stopPropagation();
        // Navigate to legacy customer URL: admin/v2/training-location/customers/12546
        const url = `${legacyBaseUrl}/v2/${location}/customers/${customerId}`;
        window.open(url, "_blank", "noopener,noreferrer");
        return;
      }

      // Check if clicked element is an invoice link
      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();
      event.stopPropagation();

      // Handle invoice links
      if (href.startsWith("/invoice/view")) {
        const url = `${legacyBaseUrl}/${location}${href}`;
        window.open(url, "_blank", "noopener,noreferrer");
      } else if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("/")) {
        window.open(href, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      console.error("Error handling link click:", error);
    }
  };
}


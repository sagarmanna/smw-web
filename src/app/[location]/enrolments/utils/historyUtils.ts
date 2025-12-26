/**
 * Utility functions for processing enrolment history messages
 */

/**
 * Processes HTML links in history messages to ensure same-window navigation and consistent styling
 * @param html - The HTML string containing links
 * @returns Processed HTML string with updated link attributes
 */
export function processHistoryLinks(html: string): string {
  try {
    // Use DOMParser for proper HTML parsing instead of regex
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const links = doc.querySelectorAll('a');

    links.forEach((link) => {
      // Remove target="_blank" if present
      link.removeAttribute('target');
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
    console.error('Error processing links with DOMParser, using regex fallback:', error);
    // Fallback to regex-based approach if DOMParser fails
    return html.replace(
      /<a\b([^>]*)>/g,
      (_match, attrs: string) => {
        let newAttrs = attrs || "";
        // Remove target="_blank" if present
        newAttrs = newAttrs.replace(/target="[^"]*"/g, '');
        // Set target to _self for same-window navigation
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
}

/**
 * Processes placeholder patterns like {{enrolmentName}} to make them clickable
 * @param html - The HTML string that may contain placeholders
 * @returns HTML string with clickable placeholders
 */
export function processHistoryPlaceholders(html: string): string {
  return html.replace(/\{\{([^}]+)\}\}/g, (_m, name: string) => {
    const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<a href="#" data-enrolment-name="${safeName}" class="text-blue-600 hover:text-blue-800 font-medium underline">${safeName}</a>`;
  });
}

/**
 * Combines createdOn date with message for display
 * @param createdOn - The creation date string
 * @param message - The message string
 * @returns Combined string with date prefix if createdOn exists
 */
export function combineHistoryMessage(createdOn: string | undefined, message: string): string {
  const created = createdOn ? `On ${createdOn}, ` : "";
  return `${created}${message}`;
}

/**
 * Processes a complete history message for display
 * @param createdOn - The creation date string
 * @param message - The message string
 * @returns Processed HTML string ready for rendering
 */
export function processHistoryMessage(createdOn: string | undefined, message: string): string {
  try {
    const combined = combineHistoryMessage(createdOn, message);
    const withProcessedLinks = processHistoryLinks(combined);
    const withPlaceholders = processHistoryPlaceholders(withProcessedLinks);
    return withPlaceholders;
  } catch (error) {
    console.error('Error processing history message:', error);
    // Fallback: return escaped text
    const combined = combineHistoryMessage(createdOn, message);
    return combined.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

/**
 * Creates a click handler for history message links using Next.js router
 * @param router - Next.js router instance
 * @returns Click handler function
 */
export function createHistoryLinkClickHandler(router: { push: (href: string) => void }) {
  return (event: React.MouseEvent<HTMLDivElement>) => {
    try {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();
      event.stopPropagation();

      // Use Next.js router for internal navigation (relative paths)
      if (href.startsWith('/')) {
        router.push(href);
      } else if (href.startsWith('http://') || href.startsWith('https://')) {
        // External URLs - open in same window
        window.location.href = href;
      } else {
        console.warn('Invalid URL format:', href);
      }
    } catch (error) {
      console.error('Error handling link click:', error);
    }
  };
}


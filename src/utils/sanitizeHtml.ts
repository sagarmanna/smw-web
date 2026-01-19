import DOMPurify from "dompurify";

/**
 * Sanitizes HTML for safe rendering in the browser.
 * Keep this small and explicit to avoid accidentally allowing unsafe tags/attrs.
 */
export function sanitizeBasicHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ["p", "br", "strong", "em", "u", "a", "span", "div", "b", "i"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Strips HTML tags to get plain text (useful for tooltips/previews).
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}



import type { MouseEvent } from "react";

/**
 * Combines createdOn date with message for display.
 */
function combineHistoryMessage(createdOn: string | undefined, message: string): string {
  const created = createdOn ? `On ${createdOn}, ` : "";
  return `${created}${message}`;
}

/**
 * Processes HTML links in history messages — adds consistent styling.
 */
function processHistoryLinks(html: string): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.querySelectorAll("a");

    links.forEach((link) => {
      link.removeAttribute("target");
      link.setAttribute("target", "_self");
      const existing = link.getAttribute("class") || "";
      const classes = "text-blue-600 hover:text-blue-800 font-medium";
      if (!existing.includes("text-blue-600")) {
        link.setAttribute("class", existing ? `${existing} ${classes}` : classes);
      }
    });

    return doc.body.innerHTML;
  } catch {
    return html;
  }
}

/**
 * Processes a history message for display — combines date + message and styles links.
 */
export function processHistoryMessage(createdOn: string | undefined, message: string): string {
  try {
    return processHistoryLinks(combineHistoryMessage(createdOn, message));
  } catch {
    const combined = combineHistoryMessage(createdOn, message);
    return combined.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}

/**
 * Converts a legacy admin URL to a v2 Next.js route.
 *
 * Legacy patterns:
 *   /admin/invoice/view?id=X   → /${location}/invoices/X
 *   /admin/user/view?...&id=X  → /${location}/customers/X
 *
 * Returns null if the URL is not a recognised legacy pattern.
 */
function convertLegacyUrl(href: string, location: string): string | null {
  try {
    const url = new URL(href);
    const id = url.searchParams.get("id");
    if (!id) return null;

    if (url.pathname.includes("/admin/invoice/view")) {
      return `/${location}/invoices/${id}`;
    }

    if (url.pathname.includes("/admin/user/view")) {
      return `/${location}/customers/${id}`;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Creates a click handler for invoice history links that converts
 * legacy admin URLs to v2 routes before navigating.
 */
export function createInvoiceHistoryLinkClickHandler(
  router: { push: (href: string) => void },
  location: string
) {
  return (event: MouseEvent<HTMLDivElement>) => {
    try {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      event.preventDefault();
      event.stopPropagation();

      if (href.startsWith("http://") || href.startsWith("https://")) {
        const v2Path = convertLegacyUrl(href, location);
        if (v2Path) {
          router.push(v2Path);
        } else {
          window.location.href = href;
        }
      } else if (href.startsWith("/")) {
        router.push(href);
      }
    } catch (error) {
      console.error("Error handling history link click:", error);
    }
  };
}

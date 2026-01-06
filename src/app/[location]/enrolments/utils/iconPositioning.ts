/**
 * Utility hook for positioning icons next to page titles
 * Optimized to avoid expensive DOM queries with debouncing
 */

import * as React from "react";
import { ENROLMENT_CONSTANTS } from "./constants";

/**
 * Custom hook for positioning icon next to title
 * Dynamically calculates the position of an icon based on the title element's position
 * Uses debouncing to optimize performance and handles window resize events
 * 
 * @param pageTitle - The text content of the page title to position icon next to
 * @param isLoading - Loading state to prevent calculations during data fetch
 * @param containerRef - React ref to the container element containing the title
 * @returns The calculated left position in pixels, or null if not calculated yet
 * 
 * @example
 * const iconContainerRef = React.useRef<HTMLDivElement>(null);
 * const iconLeft = useIconPositioning(pageTitle, isLoading, iconContainerRef);
 */
export const useIconPositioning = (
  pageTitle: string,
  isLoading: boolean,
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const [iconLeft, setIconLeft] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!containerRef.current || isLoading) return;

    const updatePosition = () => {
      if (!containerRef.current) return;

      // Use more efficient query with data attribute or specific selector
      // First try to find element with data-title attribute (if we add it)
      const titleElement =
        containerRef.current.querySelector(`[data-title="${pageTitle}"]`) ||
        // Fallback: search for text content (less efficient but works)
        Array.from(containerRef.current.querySelectorAll("*")).find(
          (el) => el.textContent?.trim() === pageTitle
        );

      if (titleElement) {
        const rect = titleElement.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        const leftPosition =
          rect.right - containerRect.left + ENROLMENT_CONSTANTS.ICON_OFFSET_PX;
        setIconLeft(leftPosition);
      }
    };

    // Debounce to avoid excessive calculations
    const timeoutId = setTimeout(updatePosition, ENROLMENT_CONSTANTS.ICON_POSITIONING_DELAY_MS);

    // Update on window resize with debouncing
    let resizeTimeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeoutId);
      resizeTimeoutId = setTimeout(updatePosition, 100);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(resizeTimeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, [pageTitle, isLoading, containerRef]);

  return iconLeft;
};


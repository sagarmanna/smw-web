// DetailHeaderWithProfile.tsx - Wrapper Component
import { DetailHeader, ActionMenuGroup } from "@/components/DetailHeader";
import { DefaultProfileIcon } from "./../DefaultProfileIcon";
import * as React from "react";

interface BreadcrumbItem {
  label: string;
  onClick: () => void;
}

interface DetailHeaderWithProfileProps {
  breadcrumbItems: BreadcrumbItem[];
  currentPageTitle: string;
  loading: boolean;
  actionMenuGroups: ActionMenuGroup[];
  actionButtonAriaLabel: string;
  showProfileIcon?: boolean;
  profileIconSize?: "sm" | "md" | "lg" | "xl";
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
}

export function DetailHeaderWithProfile({
  breadcrumbItems,
  currentPageTitle,
  loading,
  actionMenuGroups,
  actionButtonAriaLabel,
  showProfileIcon = true,
  profileIconSize = "md",
  leftContent,
  rightContent,
}: DetailHeaderWithProfileProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [iconLeft, setIconLeft] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!showProfileIcon || !containerRef.current) return;

    const updatePosition = () => {
      if (!containerRef.current) return;

      // Wait for DOM to be fully rendered
      setTimeout(() => {
        if (!containerRef.current) return;

        // Try to find the breadcrumb text elements
        const allTextNodes = containerRef.current.querySelectorAll('*');
        let lastTextElement: Element | null = null;

        // Find the element containing the current page title
        for (const element of Array.from(allTextNodes)) {
          if (element.textContent?.trim() === currentPageTitle) {
            lastTextElement = element;
            break;
          }
        }

        if (lastTextElement) {
          const rect = lastTextElement.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          const leftPosition = rect.right - containerRect.left + 8;
          setIconLeft(leftPosition);
        }
      }, 50);
    };

    updatePosition();

    // Update on window resize
    window.addEventListener('resize', updatePosition);
    return () => window.removeEventListener('resize', updatePosition);
  }, [currentPageTitle, showProfileIcon, loading]);

  return (
    <div className="relative" ref={containerRef}>
      <DetailHeader
        breadcrumbItems={breadcrumbItems}
        currentPageTitle={currentPageTitle}
        loading={loading}
        actionMenuGroups={actionMenuGroups}
        actionButtonAriaLabel={actionButtonAriaLabel}
        leftContent={leftContent}
        rightContent={rightContent}
      />
      {showProfileIcon && iconLeft !== null && (
        <div 
          className="absolute pointer-events-none"
          style={{ 
            left: `${iconLeft}px`,
            top: '50%',
            transform: 'translateY(-50%)'
          }}
        >
          <DefaultProfileIcon size={profileIconSize} />
        </div>
      )}
    </div>
  );
}

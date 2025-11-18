"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { SectionCardProps } from "./types";
import { SectionCardHeader } from "./components/SectionCardHeader";
import { SectionCardContent } from "./components/SectionCardContent";

// Export helper components for easy access
export {
  ViewToggleButton,
  AddButton,
  EditButton,
  DeleteButton,
  ActionsDropdown,
} from "./components/SectionCardActions";

// Export sub-components for advanced usage
export { SectionCardHeader } from "./components/SectionCardHeader";
export { SectionCardContent } from "./components/SectionCardContent";

/**
 * SectionCard - A simple, composable card component for displaying sectioned content.
 * 
 * Uses composition pattern instead of prop explosion for better maintainability.
 * 
 * @example
 * ```tsx
 * <SectionCard 
 *   title="Email" 
 *   headerActions={<EmailCardActions />}
 *   modals={<EmailCardModals />}
 *   footer={<EmailCardFooter />}
 * >
 *   <EmailCardContent />
 * </SectionCard>
 * ```
 */
function SectionCard({
  title,
  headerActions,
  headerContent,
  modals,
  children,
  footer,
  className,
  isLoading = false,
  emptyState,
  data, // Kept for backward compatibility, prefer children
}: SectionCardProps) {
  return (
    <Card className={cn("shadow-sm", className)}>
      <SectionCardHeader
        title={title}
        headerContent={headerContent}
        actions={headerActions}
      />
      <SectionCardContent
        isLoading={isLoading}
        emptyState={emptyState}
        data={data}
        footer={footer}
      >
        {children}
      </SectionCardContent>
      {modals}
    </Card>
  );
}

export { SectionCard };


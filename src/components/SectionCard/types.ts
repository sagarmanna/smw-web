import React from "react";
import { ModalControls } from "@/hooks/useModal";

// Re-export ModalControls for convenience
export type { ModalControls };

/**
 * Data row structure for rendering key-value pairs in SectionCard
 */
export interface SectionCardDataRow {
  label: string;
  value: React.ReactNode;
}

/**
 * Data type that can be passed to SectionCard
 * - Array of SectionCardDataRow for key-value display
 * - ReactNode for custom content
 */
export type SectionCardData = SectionCardDataRow[] | React.ReactNode;

/**
 * Simplified SectionCard props using composition pattern.
 * 
 * Instead of prop explosion (showEdit, onEditClick, showView, etc.),
 * use composition with headerActions, modals, and children slots.
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
export interface SectionCardProps {
  /** Card title displayed in the header */
  title: string;
  
  /** Custom actions rendered in the header (buttons, dropdowns, etc.) */
  headerActions?: React.ReactNode;
  
  /** Additional content next to the title in the header */
  headerContent?: React.ReactNode;
  
  /** Modals rendered outside the card (managed by parent using useModal hook) */
  modals?: React.ReactNode;
  
  /** Main content of the card - preferred over data prop */
  children?: React.ReactNode;
  
  /** Footer content rendered at the bottom of the card */
  footer?: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Show loading skeleton state */
  isLoading?: boolean;
  
  /** Custom empty state message (default: "No information available.") */
  emptyState?: React.ReactNode;
  
  /** 
   * Data for backward compatibility - prefer using children instead.
   * Can be array of SectionCardDataRow or ReactNode
   */
  data?: SectionCardData;
}

/**
 * @deprecated Use composition pattern with headerActions instead
 * Kept for backward compatibility during migration
 */
export interface DropdownOption {
  title: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}


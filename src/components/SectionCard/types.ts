import React from "react";

export interface DropdownOption {
  title: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface ModalControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export interface SectionCardDataRow {
  label: string;
  value: React.ReactNode;
}

export type SectionCardData = SectionCardDataRow[] | React.ReactNode;

export interface SectionCardProps {
  title: string;
  data?: SectionCardData;
  children?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  emptyState?: React.ReactNode;
  showEdit?: boolean;
  onEditClick?: () => void;
  editAriaLabel?: string;
  showDropDown?: boolean;
  dropdownOptions?: DropdownOption[];
  showView?: boolean;
  onViewClick?: () => void;
  viewAriaLabel?: string;
  viewIsActive?: boolean;
  viewActiveIcon?: React.ReactNode;
  viewInactiveIcon?: React.ReactNode;
  showCreateModal?: boolean;
  renderCreateModal?: (controls: ModalControls) => React.ReactNode;
  showDeleteModal?: boolean;
  renderDeleteModal?: (controls: ModalControls) => React.ReactNode;
  showAddButton?: boolean;
  onAddClick?: () => void;
  addButtonAriaLabel?: string;
  headerContent?: React.ReactNode;
  footer?: React.ReactNode;
}


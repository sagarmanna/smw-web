import { useState, useCallback } from "react";

export interface ModalControls {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

/**
 * Reusable hook for managing modal open/close state
 * @returns Modal controls with isOpen, open, and close functions
 */
export function useModal(): ModalControls {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    open,
    close,
  };
}


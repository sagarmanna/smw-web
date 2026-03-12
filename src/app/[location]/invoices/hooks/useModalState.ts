"use client";

import * as React from "react";

/**
 * Reusable hook for managing modal open/close state
 * Replaces scattered useState patterns throughout components
 */
export function useModalState(initialState: boolean = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen,
  };
}

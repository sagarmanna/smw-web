// ============================================
//  components/TablesModals/index.tsx
// ============================================
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ModalAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
}

interface ReusableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: ModalAction[];
  leftActions?: ModalAction[];
  showFooter?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";
  className?: string;
}

export function ReusableModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions = [],
  leftActions = [],
  showFooter = true,
  size = "md",
  className,
}: ReusableModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    full: "max-w-full",
  };

  const getButtonClasses = (variant?: string) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
    
    switch (variant) {
      case "destructive":
        return `${baseClasses} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      case "outline":
        return `${baseClasses} text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500`;
      case "secondary":
        return `${baseClasses} text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:ring-gray-500`;
      case "ghost":
        return `${baseClasses} text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-gray-500`;
      case "link":
        return `${baseClasses} text-[#f3573f] underline-offset-4 hover:underline focus:ring-[#f3573f]`;
      default:
        return `${baseClasses} text-white bg-[#f3573f] hover:bg-[#e14730] focus:ring-[#f3573f]`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} ${className || ""} overflow-hidden flex flex-col`}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</DialogTitle>
          {description && <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4 overflow-y-auto flex-1">{children}</div>
        
        {showFooter && (actions.length > 0 || leftActions.length > 0) && (
          <DialogFooter className="px-6 py-4 border-t w-full flex flex-row items-center justify-between sm:justify-between">
            <div>
              {leftActions.map((action, index) => (
                <button
                  key={`left-${index}`}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`${getButtonClasses(action.variant)} ${
                    action.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              {actions.map((action, index) => (
                <button
                  key={`right-${index}`}
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className={`${getButtonClasses(action.variant)} ${
                    action.disabled ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
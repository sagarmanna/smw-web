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
  showFooter?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

export function ReusableModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions = [],
  showFooter = true,
  size = "md",
  className,
}: ReusableModalProps) {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-full",
  };

  const getButtonClasses = (variant?: string) => {
    const baseClasses = "px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";
    
    switch (variant) {
      case "destructive":
        return `${baseClasses} text-white bg-red-600 hover:bg-red-700 focus:ring-red-500`;
      case "outline":
        return `${baseClasses} text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-500`;
      case "secondary":
        return `${baseClasses} text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500`;
      case "ghost":
        return `${baseClasses} text-gray-700 hover:bg-gray-100 focus:ring-gray-500`;
      case "link":
        return `${baseClasses} text-[#f3573f] underline-offset-4 hover:underline focus:ring-[#f3573f]`;
      default:
        return `${baseClasses} text-white bg-[#f3573f] hover:bg-[#e14730] focus:ring-[#f3573f]`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} ${className || ""}`}>
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
          {description && <DialogDescription className="text-sm text-gray-600">{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4">{children}</div>
        
        {showFooter && actions.length > 0 && (
          <DialogFooter className="flex justify-end gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`${getButtonClasses(action.variant)} ${
                  action.disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {action.label}
              </button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
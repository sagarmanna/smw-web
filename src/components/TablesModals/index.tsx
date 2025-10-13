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
import { Button } from "@/components/ui/button";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${sizeClasses[size]} ${className || ""}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4">{children}</div>
        
        {showFooter && actions.length > 0 && (
          <DialogFooter>
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "default"}
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.label}
              </Button>
            ))}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}


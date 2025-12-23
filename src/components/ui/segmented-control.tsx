"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SegmentedControlOption<T extends string | number | boolean> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string | number | boolean> {
  options: SegmentedControlOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  size?: "sm" | "default";
  variant?: "default" | "outline";
}

export function SegmentedControl<T extends string | number | boolean>({
  options,
  value,
  onValueChange,
  className,
  size = "sm",
  variant = "default",
}: SegmentedControlProps<T>) {
  return (
    <div
      className={cn(
        "flex gap-1 border rounded-md overflow-hidden",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <Button
            key={String(option.value)}
            type="button"
            variant={isSelected ? variant : "ghost"}
            size={size}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "rounded-none border-0",
              size === "sm" && "text-sm px-3 py-1.5",
              isSelected &&
                variant === "default" &&
                "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
          >
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}


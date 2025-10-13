"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface CardAction {
  icon: LucideIcon;
  onClick: () => void;
  label?: string;
  variant?: "ghost" | "default" | "destructive" | "outline" | "secondary" | "link";
}

interface ReusableCardProps {
  title: string;
  children: React.ReactNode;
  actions?: CardAction[];
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showHeader?: boolean;
}

export function ReusableCard({
  title,
  children,
  actions = [],
  className,
  headerClassName,
  contentClassName,
  showHeader = true,
}: ReusableCardProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-4 ${headerClassName || ""}`}>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {actions.length > 0 && (
            <div className="flex items-center gap-2">
              {actions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant={action.variant || "ghost"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={action.onClick}
                    aria-label={action.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
          )}
        </CardHeader>
      )}
      <CardContent className={contentClassName}>
        {children}
      </CardContent>
    </Card>
  );
}
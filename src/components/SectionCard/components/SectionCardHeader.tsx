import React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";

interface SectionCardHeaderProps {
  title: string;
  headerContent?: React.ReactNode;
  actions?: React.ReactNode;
}

export function SectionCardHeader({
  title,
  headerContent,
  actions,
}: SectionCardHeaderProps) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex items-center gap-2">
        <CardTitle className="text-lg font-semibold text-foreground">
          {title}
        </CardTitle>
        {headerContent}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </CardHeader>
  );
}


"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";

interface InvoiceCommentsCardProps {
  comments?: string;
  isLoading?: boolean;
}

export const InvoiceCommentsCard = React.memo(function InvoiceCommentsCard({
  comments,
  isLoading = false,
}: InvoiceCommentsCardProps) {
  return (
    <SectionCard
      title="Comments"
      isLoading={isLoading}
      className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
    >
      <div className="px-4 pb-2">
        {comments ? (
          <p className="text-sm text-foreground">{comments}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No comments</p>
        )}
      </div>
    </SectionCard>
  );
});


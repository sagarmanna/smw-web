"use client";

import * as React from "react";
import {
  SectionCard,
  AddButton,
} from "@/components/SectionCard";

interface InvoiceMessageCardProps {
  message?: string;
  isLoading?: boolean;
}

export const InvoiceMessageCard = React.memo(function InvoiceMessageCard({
  message,
  isLoading = false,
}: InvoiceMessageCardProps) {
  return (
    <SectionCard
      title="Message"
      isLoading={isLoading}
      className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
      headerActions={
        <>
          <AddButton onClick={() => {}} />
        </>
      }
    >
      <div className="px-4 pb-2">
        {message ? (
          <p className="text-sm text-foreground">{message}</p>
        ) : (
          <p className="text-sm text-muted-foreground">No message</p>
        )}
      </div>
    </SectionCard>
  );
});


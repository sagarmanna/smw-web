"use client";

import * as React from "react";
import {
  SectionCard,
  AddButton,
  EditButton,
} from "@/components/SectionCard";
import { EditMessageModal } from "../modals/EditMessageModal";

interface InvoiceMessageCardProps {
  message?: string;
  isLoading?: boolean;
  onSaveMessage?: (message: string) => void;
}

export const InvoiceMessageCard = React.memo(function InvoiceMessageCard({
  message,
  isLoading = false,
  onSaveMessage,
}: InvoiceMessageCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const hasMessage = (message ?? "").trim().length > 0;

  const handleOpenModal = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleSaveMessage = React.useCallback(
    (newMessage: string) => {
      if (onSaveMessage) {
        onSaveMessage(newMessage);
      }
      setIsModalOpen(false);
    },
    [onSaveMessage]
  );

  return (
    <>
      <SectionCard
        title="Message"
        isLoading={isLoading}
        className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
        headerActions={
          <>
            {hasMessage ? (
              <EditButton onClick={handleOpenModal} ariaLabel="Edit message" />
            ) : (
              <AddButton onClick={handleOpenModal} ariaLabel="Add message" />
            )}
          </>
        }
      >
        <div className="px-4 pb-2">
          {message ? (
            <p className="text-sm text-foreground whitespace-pre-wrap">{message}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No message</p>
          )}
        </div>
      </SectionCard>
      <EditMessageModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveMessage ? handleSaveMessage : undefined}
        currentMessage={message}
      />
    </>
  );
});


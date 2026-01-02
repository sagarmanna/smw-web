"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { OwnerEmail } from "../../types";
import { CreateEmailModal } from "../modals/CreateEmailModal";
import { useEmailHandlers } from "../../hooks/useOwnerItemHandlers";
import { EmailList } from "../sections";

interface OwnerEmailCardProps {
  emails: OwnerEmail[];
  onUpdate: React.Dispatch<React.SetStateAction<OwnerEmail[]>>;
  loading?: boolean;
  location: string;
  ownerId: number;
  onRefresh?: () => Promise<void>;
}

export const OwnerEmailCard = React.memo(function OwnerEmailCard({
  emails,
  onUpdate,
  loading = false,
  location,
  ownerId,
  onRefresh,
}: OwnerEmailCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  const {
    editingEmail,
    setEditingEmail,
    handleCreate,
    handleEdit,
    requestDelete,
    emailToDelete,
    setEmailToDelete,
    handleDeleteConfirm,
    isDeleting,
  } = useEmailHandlers({
    emails,
    updateEmails: onUpdate,
    location,
    ownerId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingEmail(null);
  }, [setEditingEmail]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, email: OwnerEmail) => {
      e.stopPropagation();
      handleEdit(email);
      setIsAddModalOpen(true);
    },
    [handleEdit]
  );

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      requestDelete(id);
    },
    [requestDelete]
  );

  const handleModalSubmit = React.useCallback(
    (email: OwnerEmail) => {
      handleCreate(email);
      setIsAddModalOpen(false);
      setEditingEmail(null);
    },
    [handleCreate, setEditingEmail]
  );

  const handleModalClose = React.useCallback(() => {
    setIsAddModalOpen(false);
    setEditingEmail(null);
  }, [setEditingEmail]);

  return (
    <>
      <InfoCard
        title="Email"
        onAddClick={handleAddClick}
        loading={loading}
      >
        <div className="space-y-2">
          <EmailList
            emails={emails}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </InfoCard>

      <CreateEmailModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingEmail={editingEmail}
        location={location}
        ownerId={ownerId}
        onUpdateEmails={onUpdate}
        currentEmails={emails}
      />

      <DeleteConfirmationModal
        open={!!emailToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setEmailToDelete(null);
          }
        }}
        title="Delete email"
        itemLabel={emailToDelete ? emailToDelete.email : undefined}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
});


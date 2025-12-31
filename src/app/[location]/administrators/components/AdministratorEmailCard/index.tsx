"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { AdministratorEmail } from "../../types";
import { CreateEmailModal } from "../modals/CreateEmailModal";
import { useEmailHandlers } from "../../hooks/useAdministratorItemHandlers";
import { EmailList } from "../sections";

interface AdministratorEmailCardProps {
  emails: AdministratorEmail[];
  onUpdate: React.Dispatch<React.SetStateAction<AdministratorEmail[]>>;
  loading?: boolean;
  location: string;
  administratorId: number;
  onRefresh?: () => Promise<void>;
}

export const AdministratorEmailCard = React.memo(function AdministratorEmailCard({
  emails,
  onUpdate,
  loading = false,
  location,
  administratorId,
  onRefresh,
}: AdministratorEmailCardProps) {
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
    administratorId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingEmail(null);
  }, [setEditingEmail]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, email: AdministratorEmail) => {
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
    (email: AdministratorEmail) => {
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
        administratorId={administratorId}
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


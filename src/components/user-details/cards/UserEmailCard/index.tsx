"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { GenericEmail } from "../../types/common";

interface UserEmailCardProps<TEmail extends GenericEmail> {
  emails: TEmail[];
  onUpdate: React.Dispatch<React.SetStateAction<TEmail[]>>;
  loading?: boolean;
  location: string;
  entityId: number;
  onRefresh?: () => Promise<void>;
  CreateModal: React.ComponentType<{
    open: boolean;
    onClose: () => void;
    onSubmit?: (email: TEmail) => void;
    editingEmail?: TEmail | null;
    location: string;
    entityId: number;
    onUpdateEmails?: (emails: TEmail[]) => void;
    currentEmails?: TEmail[];
    onRefresh?: () => Promise<void>;
    [key: string]: unknown;
  }>;
  EmailList: React.ComponentType<{
    emails: TEmail[];
    loading?: boolean;
    onEdit: (e: React.MouseEvent, email: TEmail) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onReorder?: (reorderedEmails: TEmail[]) => void;
  }>;
  useEmailHandlers: (props: {
    emails: TEmail[];
    updateEmails: React.Dispatch<React.SetStateAction<TEmail[]>>;
    location: string;
    entityId: number;
    onRefresh?: () => Promise<void>;
  }) => {
    editingEmail: TEmail | null;
    setEditingEmail: (email: TEmail | null) => void;
    handleCreate: (email: TEmail) => void;
    handleEdit: (email: TEmail) => void;
    requestDelete: (id: string) => void;
    emailToDelete: TEmail | null;
    setEmailToDelete: (email: TEmail | null) => void;
    handleDeleteConfirm: () => Promise<void>;
    isDeleting: boolean;
    handleReorder?: (reorderedEmails: TEmail[]) => void;
  };
}

export function UserEmailCard<TEmail extends GenericEmail>({
  emails,
  onUpdate,
  loading = false,
  location,
  entityId,
  onRefresh,
  CreateModal,
  EmailList,
  useEmailHandlers,
}: UserEmailCardProps<TEmail>) {
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
    handleReorder,
  } = useEmailHandlers({
    emails,
    updateEmails: onUpdate,
    location,
    entityId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingEmail(null);
  }, [setEditingEmail]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, email: TEmail) => {
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
    (email: TEmail) => {
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
            onReorder={handleReorder}
          />
        </div>
      </InfoCard>

      <CreateModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingEmail={editingEmail}
        location={location}
        entityId={entityId}
        onUpdateEmails={onUpdate}
        currentEmails={emails}
        onRefresh={onRefresh}
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
}


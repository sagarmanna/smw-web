"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { TeacherEmail } from "../../types";
import { CreateEmailModal } from "../modals/CreateEmailModal";
import { useEmailHandlers } from "../../hooks/useTeacherItemHandlers";
import { EmailList } from "../sections";

interface TeacherEmailCardProps {
  emails: TeacherEmail[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherEmail[]>>;
  loading?: boolean;
}

export const TeacherEmailCard = React.memo(function TeacherEmailCard({
  emails,
  onUpdate,
  loading = false,
}: TeacherEmailCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  const {
    editingEmail,
    setEditingEmail,
    handleCreate,
    handleEdit,
    handleDelete,
  } = useEmailHandlers({
    emails,
    updateEmails: onUpdate,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingEmail(null);
  }, [setEditingEmail]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, email: TeacherEmail) => {
      e.stopPropagation();
      handleEdit(email);
      setIsAddModalOpen(true);
    },
    [handleEdit]
  );

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      handleDelete(id);
    },
    [handleDelete]
  );

  const handleModalSubmit = React.useCallback(
    (email: TeacherEmail) => {
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
      />
    </>
  );
});


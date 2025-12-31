"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { StaffMemberEmail } from "../../types";
import { CreateEmailModal } from "../modals/CreateEmailModal";
import { useEmailHandlers } from "../../hooks/useStaffMemberItemHandlers";
import { EmailList } from "../sections";

interface StaffMemberEmailCardProps {
  emails: StaffMemberEmail[];
  onUpdate: React.Dispatch<React.SetStateAction<StaffMemberEmail[]>>;
  loading?: boolean;
  location: string;
  staffMemberId: number;
  onRefresh?: () => Promise<void>;
}

export const StaffMemberEmailCard = React.memo(function StaffMemberEmailCard({
  emails,
  onUpdate,
  loading = false,
  location,
  staffMemberId,
  onRefresh,
}: StaffMemberEmailCardProps) {
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
    staffMemberId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingEmail(null);
  }, [setEditingEmail]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, email: StaffMemberEmail) => {
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
    (email: StaffMemberEmail) => {
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
        staffMemberId={staffMemberId}
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


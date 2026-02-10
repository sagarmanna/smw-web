"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { TeacherEmail } from "../../types";
import { CreateEmailModal } from "../modals/CreateEmailModal";
import { useEmailHandlers } from "../../hooks/useTeacherItemHandlers";
import { EmailList } from "../sections";
import { updateTeacherEmail } from "../../[id]/teachers-details.api";
import { toast } from "sonner";

interface TeacherEmailCardProps {
  emails: TeacherEmail[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherEmail[]>>;
  loading?: boolean;
  location: string;
  teacherId: number;
  onRefresh?: () => Promise<void>;
}

export const TeacherEmailCard = React.memo(function TeacherEmailCard({
  emails,
  onUpdate,
  loading = false,
  location,
  teacherId,
  onRefresh,
}: TeacherEmailCardProps) {
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
    teacherId,
    onRefresh,
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
      requestDelete(id);
    },
    [requestDelete]
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

  const handleReorder = React.useCallback(
    async (reorderedEmails: TeacherEmail[]) => {
      // Check if primary status changed
      const newPrimary = reorderedEmails.find((e) => e.isPrimary);
      const oldPrimary = emails.find((e) => e.isPrimary && e.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      onUpdate(reorderedEmails);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id) {
        try {
          // Update new primary
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateTeacherEmail(
            location,
            teacherId,
            newPrimaryId,
            {
              email: newPrimary.email,
              note: newPrimary.note || "",
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          // Update old primary if it exists
          if (oldPrimary) {
            const oldPrimaryId = Number(oldPrimary.id);
            await updateTeacherEmail(
              location,
              teacherId,
              oldPrimaryId,
              {
                email: oldPrimary.email,
                note: oldPrimary.note || "",
                label: oldPrimary.label,
                isPrimary: false,
              }
            );
          }

          if (newPrimaryResult?.success) {
            // Optimistic update already applied; no extra GET
          } else {
            toast.error(newPrimaryResult?.message || "Failed to update primary email");
            if (onRefresh) await onRefresh();
          }
        } catch (error) {
          console.error("Error updating primary email:", error);
          toast.error("Failed to update primary email");
          if (onRefresh) await onRefresh();
        }
      }
    },
    [onUpdate, emails, location, teacherId, onRefresh]
  );

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

      <CreateEmailModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingEmail={editingEmail}
        location={location}
        teacherId={teacherId}
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


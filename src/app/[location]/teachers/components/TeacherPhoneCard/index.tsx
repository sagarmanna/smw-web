"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { TeacherPhone } from "../../types";
import { CreatePhoneModal } from "../modals/CreatePhoneModal";
import { usePhoneHandlers } from "../../hooks/useTeacherItemHandlers";
import { PhoneList } from "../sections";
import { updateTeacherPhone } from "../../[id]/teachers-details.api";
import { toast } from "sonner";

interface TeacherPhoneCardProps {
  phones: TeacherPhone[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherPhone[]>>;
  loading?: boolean;
  location: string;
  teacherId: number;
  onRefresh?: () => Promise<void>;
}

export const TeacherPhoneCard = React.memo(function TeacherPhoneCard({
  phones,
  onUpdate,
  loading = false,
  location,
  teacherId,
  onRefresh,
}: TeacherPhoneCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  const {
    editingPhone,
    setEditingPhone,
    handleCreate,
    handleEdit,
    requestDelete,
    phoneToDelete,
    setPhoneToDelete,
    handleDeleteConfirm,
    isDeleting,
  } = usePhoneHandlers({
    phones,
    updatePhones: onUpdate,
    location,
    teacherId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingPhone(null);
  }, [setEditingPhone]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, phone: TeacherPhone) => {
      e.stopPropagation();
      handleEdit(phone);
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
    (phone: TeacherPhone) => {
      handleCreate(phone);
      setIsAddModalOpen(false);
      setEditingPhone(null);
    },
    [handleCreate, setEditingPhone]
  );

  const handleModalClose = React.useCallback(() => {
    setIsAddModalOpen(false);
    setEditingPhone(null);
  }, [setEditingPhone]);

  const handleReorder = React.useCallback(
    async (reorderedPhones: TeacherPhone[]) => {
      // Check if primary status changed
      const newPrimary = reorderedPhones.find((p) => p.isPrimary);
      const oldPrimary = phones.find((p) => p.isPrimary && p.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      onUpdate(reorderedPhones);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id) {
        try {
          // Update new primary
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateTeacherPhone(
            location,
            teacherId,
            newPrimaryId,
            {
              number: newPrimary.number,
              extension: newPrimary.extension,
              note: newPrimary.note || "",
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          // Update old primary if it exists
          if (oldPrimary) {
            const oldPrimaryId = Number(oldPrimary.id);
            await updateTeacherPhone(
              location,
              teacherId,
              oldPrimaryId,
              {
                number: oldPrimary.number,
                extension: oldPrimary.extension,
                note: oldPrimary.note || "",
                label: oldPrimary.label,
                isPrimary: false,
              }
            );
          }

          if (newPrimaryResult?.success) {
            // Refresh to get latest data from server
            if (onRefresh) {
              await onRefresh();
            }
          } else {
            toast.error(newPrimaryResult?.message || "Failed to update primary phone");
            // Revert on error
            if (onRefresh) {
              await onRefresh();
            }
          }
        } catch (error) {
          console.error("Error updating primary phone:", error);
          toast.error("Failed to update primary phone");
          // Revert on error
          if (onRefresh) {
            await onRefresh();
          }
        }
      }
    },
    [onUpdate, phones, location, teacherId, onRefresh]
  );

  return (
    <>
      <InfoCard
        title="Phone"
        onAddClick={handleAddClick}
        loading={loading}
      >
        <div className="space-y-2">
          <PhoneList
            phones={phones}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onReorder={handleReorder}
          />
        </div>
      </InfoCard>

      <CreatePhoneModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingPhone={editingPhone}
        location={location}
        teacherId={teacherId}
        onUpdatePhones={onUpdate}
        onRefresh={onRefresh}
      />

      <DeleteConfirmationModal
        open={!!phoneToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPhoneToDelete(null);
          }
        }}
        title="Delete phone"
        itemLabel={phoneToDelete ? phoneToDelete.number : undefined}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
});


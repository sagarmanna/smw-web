"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { OwnerPhone } from "../../types";
import { CreatePhoneModal } from "../modals/CreatePhoneModal";
import { usePhoneHandlers } from "../../hooks/useOwnerItemHandlers";
import { PhoneList } from "../sections";

interface OwnerPhoneCardProps {
  phones: OwnerPhone[];
  onUpdate: React.Dispatch<React.SetStateAction<OwnerPhone[]>>;
  loading?: boolean;
  location: string;
  ownerId: number;
  onRefresh?: () => Promise<void>;
}

export const OwnerPhoneCard = React.memo(function OwnerPhoneCard({
  phones,
  onUpdate,
  loading = false,
  location,
  ownerId,
  onRefresh,
}: OwnerPhoneCardProps) {
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
    ownerId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingPhone(null);
  }, [setEditingPhone]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, phone: OwnerPhone) => {
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
    (phone: OwnerPhone) => {
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
          />
        </div>
      </InfoCard>

      <CreatePhoneModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingPhone={editingPhone}
        location={location}
        ownerId={ownerId}
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


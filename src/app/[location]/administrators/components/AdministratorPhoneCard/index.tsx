"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { AdministratorPhone } from "../../types";
import { CreatePhoneModal } from "../modals/CreatePhoneModal";
import { usePhoneHandlers } from "../../hooks/useAdministratorItemHandlers";
import { PhoneList } from "../sections";

interface AdministratorPhoneCardProps {
  phones: AdministratorPhone[];
  onUpdate: React.Dispatch<React.SetStateAction<AdministratorPhone[]>>;
  loading?: boolean;
  location: string;
  administratorId: number;
  onRefresh?: () => Promise<void>;
}

export const AdministratorPhoneCard = React.memo(function AdministratorPhoneCard({
  phones,
  onUpdate,
  loading = false,
  location,
  administratorId,
  onRefresh,
}: AdministratorPhoneCardProps) {
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
    administratorId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingPhone(null);
  }, [setEditingPhone]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, phone: AdministratorPhone) => {
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
    (phone: AdministratorPhone) => {
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
        administratorId={administratorId}
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


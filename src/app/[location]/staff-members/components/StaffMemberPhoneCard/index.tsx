"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { StaffMemberPhone } from "../../types";
import { CreatePhoneModal } from "../modals/CreatePhoneModal";
import { usePhoneHandlers } from "../../hooks/useStaffMemberItemHandlers";
import { PhoneList } from "../sections";

interface StaffMemberPhoneCardProps {
  phones: StaffMemberPhone[];
  onUpdate: React.Dispatch<React.SetStateAction<StaffMemberPhone[]>>;
  loading?: boolean;
  location: string;
  staffMemberId: number;
  onRefresh?: () => Promise<void>;
}

export const StaffMemberPhoneCard = React.memo(function StaffMemberPhoneCard({
  phones,
  onUpdate,
  loading = false,
  location,
  staffMemberId,
  onRefresh,
}: StaffMemberPhoneCardProps) {
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
    staffMemberId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingPhone(null);
  }, [setEditingPhone]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, phone: StaffMemberPhone) => {
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
    (phone: StaffMemberPhone) => {
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
        staffMemberId={staffMemberId}
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


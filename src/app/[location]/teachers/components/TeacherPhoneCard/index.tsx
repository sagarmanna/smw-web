"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { TeacherPhone } from "../../types";
import { CreatePhoneModal } from "../modals/CreatePhoneModal";
import { usePhoneHandlers } from "../../hooks/useTeacherItemHandlers";
import { PhoneList } from "../sections";

interface TeacherPhoneCardProps {
  phones: TeacherPhone[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherPhone[]>>;
  loading?: boolean;
}

export function TeacherPhoneCard({
  phones,
  onUpdate,
  loading = false,
}: TeacherPhoneCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  const {
    editingPhone,
    setEditingPhone,
    handleCreate,
    handleEdit,
    handleDelete,
  } = usePhoneHandlers({
    phones,
    updatePhones: onUpdate,
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
      handleDelete(id);
    },
    [handleDelete]
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
      />
    </>
  );
}


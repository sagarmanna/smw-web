"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { GenericPhone } from "../../types/common";

interface UserPhoneCardProps<TPhone extends GenericPhone> {
  phones: TPhone[];
  onUpdate: React.Dispatch<React.SetStateAction<TPhone[]>>;
  loading?: boolean;
  location: string;
  entityId: number;
  onRefresh?: () => Promise<void>;
      CreateModal: React.ComponentType<{
        open: boolean;
        onClose: () => void;
        onSubmit?: (phone: TPhone) => void;
        editingPhone?: TPhone | null;
        location: string;
        entityId: number;
        onUpdatePhones?: (phones: TPhone[]) => void;
        currentPhones?: TPhone[];
        onRefresh?: () => Promise<void>;
        [key: string]: unknown;
      }>;
  PhoneList: React.ComponentType<{
    phones: TPhone[];
    loading?: boolean;
    onEdit: (e: React.MouseEvent, phone: TPhone) => void;
    onDelete: (e: React.MouseEvent, id: string) => void;
    onReorder?: (reorderedPhones: TPhone[]) => void;
  }>;
  usePhoneHandlers: (props: {
    phones: TPhone[];
    updatePhones: React.Dispatch<React.SetStateAction<TPhone[]>>;
    location: string;
    entityId: number;
    onRefresh?: () => Promise<void>;
  }) => {
    editingPhone: TPhone | null;
    setEditingPhone: (phone: TPhone | null) => void;
    handleCreate: (phone: TPhone) => void;
    handleEdit: (phone: TPhone) => void;
    requestDelete: (id: string) => void;
    phoneToDelete: TPhone | null;
    setPhoneToDelete: (phone: TPhone | null) => void;
    handleDeleteConfirm: () => Promise<void>;
    isDeleting: boolean;
    handleReorder?: (reorderedPhones: TPhone[]) => void;
  };
}

export function UserPhoneCard<TPhone extends GenericPhone>({
  phones,
  onUpdate,
  loading = false,
  location,
  entityId,
  onRefresh,
  CreateModal,
  PhoneList,
  usePhoneHandlers,
}: UserPhoneCardProps<TPhone>) {
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
    handleReorder,
  } = usePhoneHandlers({
    phones,
    updatePhones: onUpdate,
    location,
    entityId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingPhone(null);
  }, [setEditingPhone]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, phone: TPhone) => {
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
    (phone: TPhone) => {
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
            onReorder={handleReorder}
          />
        </div>
      </InfoCard>

      <CreateModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingPhone={editingPhone}
        location={location}
        entityId={entityId}
        onUpdatePhones={onUpdate}
        currentPhones={phones}
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
}


"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { OwnerAddress } from "../../types";
import { CreateAddressModal } from "../modals/CreateAddressModal";
import { useAddressHandlers } from "../../hooks/useOwnerItemHandlers";
import { AddressList } from "../sections";

interface OwnerAddressCardProps {
  addresses: OwnerAddress[];
  onUpdate: React.Dispatch<React.SetStateAction<OwnerAddress[]>>;
  loading?: boolean;
  location: string;
  ownerId: number;
  onRefresh?: () => Promise<void>;
}

export const OwnerAddressCard = React.memo(function OwnerAddressCard({
  addresses,
  onUpdate,
  loading = false,
  location,
  ownerId,
  onRefresh,
}: OwnerAddressCardProps) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  const {
    editingAddress,
    setEditingAddress,
    handleCreate,
    handleEdit,
    requestDelete,
    addressToDelete,
    setAddressToDelete,
    handleDeleteConfirm,
    isDeleting,
  } = useAddressHandlers({
    addresses,
    updateAddresses: onUpdate,
    location,
    ownerId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingAddress(null);
  }, [setEditingAddress]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, address: OwnerAddress) => {
      e.stopPropagation();
      handleEdit(address);
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
    (address: OwnerAddress) => {
      handleCreate(address);
      setIsAddModalOpen(false);
      setEditingAddress(null);
    },
    [handleCreate, setEditingAddress]
  );

  const handleModalClose = React.useCallback(() => {
    setIsAddModalOpen(false);
    setEditingAddress(null);
  }, [setEditingAddress]);

  return (
    <>
      <InfoCard
        title="Addresses"
        onAddClick={handleAddClick}
        loading={loading}
      >
        <div className="space-y-2">
          <AddressList
            addresses={addresses}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </div>
      </InfoCard>

      <CreateAddressModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingAddress={editingAddress}
        location={location}
        ownerId={ownerId}
        onUpdateAddresses={onUpdate}
        onRefresh={onRefresh}
      />

      <DeleteConfirmationModal
        open={!!addressToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setAddressToDelete(null);
          }
        }}
        title="Delete address"
        itemLabel={addressToDelete ? addressToDelete.address : undefined}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
});


"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { AdministratorAddress } from "../../types";
import { CreateAddressModal } from "../modals/CreateAddressModal";
import { useAddressHandlers } from "../../hooks/useAdministratorItemHandlers";
import { AddressList } from "../sections";

interface AdministratorAddressCardProps {
  addresses: AdministratorAddress[];
  onUpdate: React.Dispatch<React.SetStateAction<AdministratorAddress[]>>;
  loading?: boolean;
  location: string;
  administratorId: number;
  onRefresh?: () => Promise<void>;
}

export const AdministratorAddressCard = React.memo(function AdministratorAddressCard({
  addresses,
  onUpdate,
  loading = false,
  location,
  administratorId,
  onRefresh,
}: AdministratorAddressCardProps) {
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
    administratorId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingAddress(null);
  }, [setEditingAddress]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, address: AdministratorAddress) => {
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
    (address: AdministratorAddress) => {
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
        administratorId={administratorId}
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


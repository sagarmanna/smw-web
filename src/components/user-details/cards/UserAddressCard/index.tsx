"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { GenericAddress } from "../../types/common";

interface UserAddressCardProps<TAddress extends GenericAddress> {
  addresses: TAddress[];
  onUpdate: React.Dispatch<React.SetStateAction<TAddress[]>>;
  loading?: boolean;
  location: string;
  entityId: number;
  onRefresh?: () => Promise<void>;
      CreateModal: React.ComponentType<{
        open: boolean;
        onClose: () => void;
        onSubmit?: (address: TAddress) => void;
        editingAddress?: TAddress | null;
        location: string;
        entityId: number;
        onUpdateAddresses?: (addresses: TAddress[]) => void;
        currentAddresses?: TAddress[];
        onRefresh?: () => Promise<void>;
        [key: string]: unknown;
      }>;
  AddressList: React.ComponentType<{
    addresses: TAddress[];
    loading?: boolean;
    onEdit: (e: React.MouseEvent, address: TAddress) => void;
    onDelete: (e: React.MouseEvent, id: string, displayLabel?: string) => void;
    onReorder?: (reorderedAddresses: TAddress[]) => void;
  }>;
  useAddressHandlers: (props: {
    addresses: TAddress[];
    updateAddresses: React.Dispatch<React.SetStateAction<TAddress[]>>;
    location: string;
    entityId: number;
    onRefresh?: () => Promise<void>;
  }) => {
    editingAddress: TAddress | null;
    setEditingAddress: (address: TAddress | null) => void;
    handleCreate: (address: TAddress) => void;
    handleEdit: (address: TAddress) => void;
    requestDelete: (id: string, displayLabel?: string) => void;
    addressToDelete: TAddress | null;
    setAddressToDelete: (address: TAddress | null) => void;
    addressToDeleteDisplayLabel?: string | null;
    clearAddressToDelete?: () => void;
    handleDeleteConfirm: () => Promise<void>;
    isDeleting: boolean;
    handleReorder?: (reorderedAddresses: TAddress[]) => void;
  };
}

export function UserAddressCard<TAddress extends GenericAddress>({
  addresses,
  onUpdate,
  loading = false,
  location,
  entityId,
  onRefresh,
  CreateModal,
  AddressList,
  useAddressHandlers,
}: UserAddressCardProps<TAddress>) {
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  
  const {
    editingAddress,
    setEditingAddress,
    handleCreate,
    handleEdit,
    requestDelete,
    addressToDelete,
    setAddressToDelete,
    addressToDeleteDisplayLabel,
    clearAddressToDelete,
    handleDeleteConfirm,
    isDeleting,
    handleReorder,
  } = useAddressHandlers({
    addresses,
    updateAddresses: onUpdate,
    location,
    entityId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingAddress(null);
  }, [setEditingAddress]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, address: TAddress) => {
      e.stopPropagation();
      handleEdit(address);
      setIsAddModalOpen(true);
    },
    [handleEdit]
  );

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent, id: string, displayLabel?: string) => {
      e.stopPropagation();
      requestDelete(id, displayLabel);
    },
    [requestDelete]
  );

  const handleModalSubmit = React.useCallback(
    (address: TAddress) => {
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

  // Build full address string for delete confirmation (matches card display)
  const fullAddressLabel = React.useMemo(() => {
    if (!addressToDelete) return undefined;
    const a = addressToDelete;
    const province = a.province?.trim() || "";
    const country = a.country?.trim() || "";
    const postalPart = a.postalCode?.trim() ? ` - ${a.postalCode}` : "";
    const line2 = [a.city, province].filter(Boolean).join(", ");
    const line3 = country ? `${country}${postalPart}` : postalPart ? postalPart.slice(3) : "";
    const lines = [a.address, line2, line3].filter(Boolean);
    return lines.join("\n");
  }, [addressToDelete]);

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
            onReorder={handleReorder}
          />
        </div>
      </InfoCard>

      <CreateModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingAddress={editingAddress}
        location={location}
        entityId={entityId}
        onUpdateAddresses={onUpdate}
        currentAddresses={addresses}
        onRefresh={onRefresh}
      />

      <DeleteConfirmationModal
        open={!!addressToDelete}
        onOpenChange={(open) => {
          if (!open) {
            if (clearAddressToDelete) clearAddressToDelete();
            else setAddressToDelete(null);
          }
        }}
        title="Delete address"
        description={
          (addressToDeleteDisplayLabel ?? fullAddressLabel) ? (
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {addressToDeleteDisplayLabel ?? fullAddressLabel}
            </p>
          ) : undefined
        }
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </>
  );
}


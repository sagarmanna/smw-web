"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { TeacherAddress } from "../../types";
import { CreateAddressModal } from "../modals/CreateAddressModal";
import { useAddressHandlers } from "../../hooks/useTeacherItemHandlers";
import { AddressList } from "../sections";
import { updateTeacherAddress } from "../../[id]/teachers-details.api";
import { toast } from "sonner";

interface TeacherAddressCardProps {
  addresses: TeacherAddress[];
  onUpdate: React.Dispatch<React.SetStateAction<TeacherAddress[]>>;
  loading?: boolean;
  location: string;
  teacherId: number;
  onRefresh?: () => Promise<void>;
}

export const TeacherAddressCard = React.memo(function TeacherAddressCard({
  addresses,
  onUpdate,
  loading = false,
  location,
  teacherId,
  onRefresh,
}: TeacherAddressCardProps) {
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
    teacherId,
    onRefresh,
  });

  const handleAddClick = React.useCallback(() => {
    setIsAddModalOpen(true);
    setEditingAddress(null);
  }, [setEditingAddress]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, address: TeacherAddress) => {
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
    (address: TeacherAddress) => {
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

  const handleReorder = React.useCallback(
    async (reorderedAddresses: TeacherAddress[]) => {
      // Check if primary status changed
      const newPrimary = reorderedAddresses.find((a) => a.isPrimary);
      const oldPrimary = addresses.find((a) => a.isPrimary && a.id !== newPrimary?.id);

      // Update local state first for immediate UI feedback
      onUpdate(reorderedAddresses);

      // If primary status changed, persist to API
      if (newPrimary && newPrimary.id !== oldPrimary?.id) {
        try {
          // Update new primary
          const newPrimaryId = Number(newPrimary.id);
          const newPrimaryResult = await updateTeacherAddress(
            location,
            teacherId,
            newPrimaryId,
            {
              address: newPrimary.address,
              postalCode: newPrimary.postalCode,
              city: newPrimary.city,
              cityId: newPrimary.cityId,
              provinceId: newPrimary.provinceId,
              countryId: newPrimary.countryId,
              label: newPrimary.label,
              isPrimary: true,
            }
          );

          // Update old primary if it exists
          if (oldPrimary) {
            const oldPrimaryId = Number(oldPrimary.id);
            await updateTeacherAddress(
              location,
              teacherId,
              oldPrimaryId,
              {
                address: oldPrimary.address,
                postalCode: oldPrimary.postalCode,
                city: oldPrimary.city,
                cityId: oldPrimary.cityId,
                provinceId: oldPrimary.provinceId,
                countryId: oldPrimary.countryId,
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
            toast.error(newPrimaryResult?.message || "Failed to update primary address");
            // Revert on error
            if (onRefresh) {
              await onRefresh();
            }
          }
        } catch (error) {
          console.error("Error updating primary address:", error);
          toast.error("Failed to update primary address");
          // Revert on error
          if (onRefresh) {
            await onRefresh();
          }
        }
      }
    },
    [onUpdate, addresses, location, teacherId, onRefresh]
  );

  return (
    <>
      <InfoCard
        title="Address"
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

      <CreateAddressModal
        open={isAddModalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        editingAddress={editingAddress}
        location={location}
        teacherId={teacherId}
        onUpdateAddresses={onUpdate}
        currentAddresses={addresses}
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


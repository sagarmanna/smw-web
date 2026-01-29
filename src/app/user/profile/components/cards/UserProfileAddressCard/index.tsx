"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

import type { GenericAddress } from "@/components/user-details/types/common";
import CreateProfileAddressModal from "../../modals/CreateProfileAddressModal";
import { useAddressHandlers } from "../../../hooks/useUserProfileItemHandlers";
import DraggableProfileListCard from "../DraggableProfileListCard";

interface UserProfileAddressCardProps {
  addresses: GenericAddress[];
  onUpdate: React.Dispatch<React.SetStateAction<GenericAddress[]>>;
  loading?: boolean;
  location: string;
  entityId: number;
}

function formatAddressDisplay(address: GenericAddress): string {
  const province = address.province || "Ontario";
  const country = address.country || "Canada";
  return `${address.address}\n${address.city}, ${province}\n${country}${address.postalCode ? ` - ${address.postalCode}` : ""}`;
}

export default function UserProfileAddressCard({
  addresses,
  onUpdate,
  loading = false,
  location,
  entityId,
}: UserProfileAddressCardProps) {
  const h = useAddressHandlers({ addresses, updateAddresses: onUpdate });

  return (
    <DraggableProfileListCard<GenericAddress>
      title="Addresses"
      items={addresses}
      onUpdate={onUpdate}
      loading={loading}
      emptyText="No addresses added"
      deleteTitle="Delete address"
      getDeleteLabel={(a) => a.address}
      editAriaLabel="Edit address"
      deleteAriaLabel="Delete address"
      getLabel={(a) => a.label}
      renderValue={(address) => (
        <span className="whitespace-pre-line flex items-center gap-2">
          <span>{formatAddressDisplay(address)}</span>
          {address.isPrimary && (
            <Badge variant="secondary" className="text-xs">
              Primary
            </Badge>
          )}
        </span>
      )}
      handlers={{
        editingItem: h.editingAddress,
        setEditingItem: h.setEditingAddress,
        handleCreate: h.handleCreate,
        handleEdit: h.handleEdit,
        requestDelete: h.requestDelete,
        itemToDelete: h.addressToDelete,
        setItemToDelete: h.setAddressToDelete,
        handleDeleteConfirm: h.handleDeleteConfirm,
        isDeleting: h.isDeleting,
      }}
      renderCreateModal={({ open, onClose, onSubmit, editingItem }) => (
        <CreateProfileAddressModal
          open={open}
          onClose={onClose}
          onSubmit={onSubmit}
          editingAddress={editingItem}
          location={location}
          entityId={entityId}
        />
      )}
    />
  );
}


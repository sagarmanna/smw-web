"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

import type { GenericPhone } from "@/components/user-details/types/common";
import CreateProfilePhoneModal from "../../modals/CreateProfilePhoneModal";
import { usePhoneHandlers } from "../../../hooks/useUserProfileItemHandlers";
import DraggableProfileListCard from "../DraggableProfileListCard";

interface UserProfilePhoneCardProps {
  phones: GenericPhone[];
  onUpdate: React.Dispatch<React.SetStateAction<GenericPhone[]>>;
  loading?: boolean;
  location: string;
  entityId: number;
}

function formatPhoneDisplay(phone: GenericPhone): string {
  let display = phone.number;
  if (phone.note && phone.note.trim() !== "") {
    display += ` - (${phone.note})`;
  }
  if (phone.extension) {
    display += ` Ext: ${phone.extension}`;
  }
  return display;
}

export default function UserProfilePhoneCard({
  phones,
  onUpdate,
  loading = false,
  location,
  entityId,
}: UserProfilePhoneCardProps) {
  const h = usePhoneHandlers({ phones, updatePhones: onUpdate });
  type PhoneWithPrimary = GenericPhone & { isPrimary?: boolean };

  return (
    <DraggableProfileListCard<PhoneWithPrimary>
      title="Phone"
      items={phones as PhoneWithPrimary[]}
      onUpdate={onUpdate as React.Dispatch<React.SetStateAction<PhoneWithPrimary[]>>}
      loading={loading}
      emptyText="No phones added"
      deleteTitle="Delete phone"
      getDeleteLabel={(p) => p.number}
      editAriaLabel="Edit phone"
      deleteAriaLabel="Delete phone"
      getLabel={(p) => p.label}
      renderValue={(phone) => (
        <span className="flex items-center gap-2">
          {formatPhoneDisplay(phone)}
          {phone.isPrimary && (
            <Badge variant="secondary" className="text-xs">
              Primary
            </Badge>
          )}
        </span>
      )}
      handlers={{
        editingItem: h.editingPhone as PhoneWithPrimary | null,
        setEditingItem: h.setEditingPhone as (i: PhoneWithPrimary | null) => void,
        handleCreate: h.handleCreate as (i: PhoneWithPrimary) => void,
        handleEdit: h.handleEdit as (i: PhoneWithPrimary) => void,
        requestDelete: h.requestDelete,
        itemToDelete: h.phoneToDelete as PhoneWithPrimary | null,
        setItemToDelete: h.setPhoneToDelete as (i: PhoneWithPrimary | null) => void,
        handleDeleteConfirm: h.handleDeleteConfirm,
        isDeleting: h.isDeleting,
      }}
      renderCreateModal={({ open, onClose, onSubmit, editingItem }) => (
        <CreateProfilePhoneModal
          open={open}
          onClose={onClose}
          onSubmit={onSubmit as (p: GenericPhone) => void}
          editingPhone={editingItem as GenericPhone | null}
          location={location}
          entityId={entityId}
        />
      )}
    />
  );
}


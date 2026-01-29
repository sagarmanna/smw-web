"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";

import type { GenericEmail } from "@/components/user-details/types/common";
import CreateProfileEmailModal from "../../modals/CreateProfileEmailModal";
import { useEmailHandlers } from "../../../hooks/useUserProfileItemHandlers";
import DraggableProfileListCard from "../DraggableProfileListCard";

interface UserProfileEmailCardProps {
  emails: GenericEmail[];
  onUpdate: React.Dispatch<React.SetStateAction<GenericEmail[]>>;
  loading?: boolean;
  location: string;
  entityId: number;
}

function formatEmailDisplay(email: GenericEmail): string {
  let display = email.email;
  if (email.note && email.note.trim() !== "") {
    display += ` - ${email.note}`;
  }
  return display;
}

export default function UserProfileEmailCard({
  emails,
  onUpdate,
  loading = false,
  location,
  entityId,
}: UserProfileEmailCardProps) {
  const h = useEmailHandlers({ emails, updateEmails: onUpdate });

  return (
    <DraggableProfileListCard<GenericEmail>
      title="Email"
      items={emails}
      onUpdate={onUpdate}
      loading={loading}
      emptyText="No emails added"
      deleteTitle="Delete email"
      getDeleteLabel={(e) => e.email}
      editAriaLabel="Edit email"
      deleteAriaLabel="Delete email"
      getLabel={(e) => e.label}
      renderValue={(email) => (
        <span className="flex items-center gap-2">
          {formatEmailDisplay(email)}
          {email.isPrimary && (
            <Badge variant="secondary" className="text-xs">
              Primary
            </Badge>
          )}
        </span>
      )}
      handlers={{
        editingItem: h.editingEmail,
        setEditingItem: h.setEditingEmail,
        handleCreate: h.handleCreate,
        handleEdit: h.handleEdit,
        requestDelete: h.requestDelete,
        itemToDelete: h.emailToDelete,
        setItemToDelete: h.setEmailToDelete,
        handleDeleteConfirm: h.handleDeleteConfirm,
        isDeleting: h.isDeleting,
      }}
      renderCreateModal={({ open, onClose, onSubmit, editingItem }) => (
        <CreateProfileEmailModal
          open={open}
          onClose={onClose}
          onSubmit={onSubmit}
          editingEmail={editingItem}
          location={location}
          entityId={entityId}
          currentEmails={emails}
        />
      )}
    />
  );
}


import React, { useState } from 'react';
import { ReusableModal } from "@/components/TablesModals";
import { deleteUser } from "@/lib/api/legacyApiAdapter";


interface CustomerDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  customerId: number;
  onDeleteSuccess?: () => void;
  onDeleteError?: (error: string) => void;
}

export function CustomerDeleteModal({
  open,
  onOpenChange,
  location,
  customerId,
  onDeleteSuccess,
  onDeleteError,
}: CustomerDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteUser(location, customerId);

      if (response.status) {
        console.log('user deleted')
        // onOpenChange(false);
        // onDeleteSuccess?.();
      } else {
        const errorMessage =
        response.message || response.errors?.join(", ") ||
        "Unable to delete this user.";
        console.log('user may deleted', errorMessage);
        // onDeleteError?.(errorMessage);
        // onOpenChange(false);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to delete this user.";
      console.log('user may deleted', errorMessage);
      // onDeleteError?.(errorMessage);
      // onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
      disabled: isDeleting,
    },
    {
      label: isDeleting ? 'Deleting...' : 'OK',
      onClick: handleDelete,
      variant: "destructive" as const,
      disabled: isDeleting,
    },
  ];

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title=""
      size="sm"
      actions={modalActions}
      showFooter={true}
    >
      <div className="space-y-4">
        <p className="text-base text-gray-700 dark:text-gray-300">
          Are you sure you want to delete this user?
        </p>
      </div>
    </ReusableModal>
  );
}
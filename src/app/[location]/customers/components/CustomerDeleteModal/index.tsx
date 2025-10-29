import React, { useState } from 'react';
import { ReusableModal } from "@/components/TablesModals";


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
  onDeleteError,
}: CustomerDeleteModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    // Mock delay to simulate API call
    setTimeout(() => {
      setIsDeleting(false);
      
      // Close modal first
      onOpenChange(false);
      
      // Pass error to parent
      onDeleteError?.('Unable to delete. There are student(s) associated with this customer');
    }, 500);
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
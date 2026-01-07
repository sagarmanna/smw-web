"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteEnrolment } from "../../[id]/enrolment-details.api";

interface DeleteEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  enrolmentId: string;
  onDeleteSuccess?: () => void;
}

export function DeleteEnrolmentModal({
  open,
  onOpenChange,
  location,
  enrolmentId,
  onDeleteSuccess,
}: DeleteEnrolmentModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call DELETE API
      const response = await deleteEnrolment(location, enrolmentId);
      
      if (response && response.success) {
        toast.success("Enrolment deleted successfully");
        onOpenChange(false);
        onDeleteSuccess?.();
        router.push(`/${location}/enrolments`);
      } else {
        toast.error(response?.message || "Failed to delete enrolment");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete enrolment";
      toast.error(errorMessage);
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
      label: isDeleting ? "Deleting..." : "Delete",
      onClick: handleDelete,
      variant: "destructive" as const,
      disabled: isDeleting,
    },
  ];

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Enrolment"
      description="Are you sure you want to delete this enrolment? This action cannot be undone."
      size="sm"
      actions={modalActions}
      showFooter={true}
    >
      {null}
    </ReusableModal>
  );
}


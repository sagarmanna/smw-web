"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteStudentInfo } from "../../[id]/students-details.api";

interface DeleteStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  studentId: string;
  onDeleteSuccess?: () => void;
}

export function DeleteStudentModal({
  open,
  onOpenChange,
  location,
  studentId,
  onDeleteSuccess,
}: DeleteStudentModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call DELETE API first
      const response = await deleteStudentInfo(location, studentId);
      
      if (response && response.success) {
        toast.success("Student deleted successfully");
        onOpenChange(false);
        onDeleteSuccess?.();
        router.push(`/${location}/students`);
      } else {
        toast.error(response?.message || "Failed to delete student");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete student";
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
      title="Delete Student"
      description="Are you sure you want to delete this student? This action cannot be undone."
      size="sm"
      actions={modalActions}
      showFooter={true}
    >
      {null}
    </ReusableModal>
  );
}


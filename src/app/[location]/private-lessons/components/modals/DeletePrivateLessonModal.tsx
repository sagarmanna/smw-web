"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deletePrivateLesson } from "../../[id]/private-lesson-details.api";

interface DeletePrivateLessonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  privateLessonId: string;
  onDeleteSuccess?: () => void;
}

export function DeletePrivateLessonModal({
  open,
  onOpenChange,
  location,
  privateLessonId,
  onDeleteSuccess,
}: DeletePrivateLessonModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call DELETE API
      const response = await deletePrivateLesson(location, privateLessonId);
      
      if (response && response.success) {
        toast.success("Private lesson deleted successfully");
        onOpenChange(false);
        onDeleteSuccess?.();
        router.push(`/${location}/private-lessons`);
      } else {
        toast.error(response?.message || "Failed to delete private lesson");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete private lesson";
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
      title="Delete Private Lesson"
      description="Are you sure you want to delete this private lesson? This action cannot be undone."
      size="sm"
      actions={modalActions}
      showFooter={true}
    >
      {null}
    </ReusableModal>
  );
}


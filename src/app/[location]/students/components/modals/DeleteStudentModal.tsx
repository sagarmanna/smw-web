"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StudentBasicDetails } from "../../types";

interface DeleteStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  studentId: string;
  studentDetails: StudentBasicDetails | null;
  onDeleteSuccess?: () => void;
}

export function DeleteStudentModal({
  open,
  onOpenChange,
  location,
  studentId: _studentId,
  studentDetails,
  onDeleteSuccess,
}: DeleteStudentModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // TODO: Replace with actual API call when endpoint is available
      // const response = await deleteStudent(location, _studentId);
      void _studentId; // Reserved for future API implementation
      // if (response.success) {
      //   toast.success("Student deleted successfully");
      //   onOpenChange(false);
      //   onDeleteSuccess?.();
      //   router.push(`/${location}/students`);
      // } else {
      //   toast.error(response.message || "Failed to delete student");
      // }

      // Mock implementation
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success("Student deleted successfully");
      onOpenChange(false);
      onDeleteSuccess?.();
      router.push(`/${location}/students`);
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
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          You are about to delete:
        </p>
        <div className="bg-muted p-3 rounded-md">
          <p className="font-semibold">
            {studentDetails?.firstName} {studentDetails?.lastName}
          </p>
          <p className="text-sm text-muted-foreground">ID: {studentDetails?.id}</p>
        </div>
      </div>
    </ReusableModal>
  );
}


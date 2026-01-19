"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteEnrolment, deleteGroupEnrolment } from "../../[id]/enrolment-details.api";

interface DeleteEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  enrolmentId: string;
  enrolmentType?: "private" | "group";
  onDeleteSuccess?: () => void;
}

export function DeleteEnrolmentModal({
  open,
  onOpenChange,
  location,
  enrolmentId,
  enrolmentType = "private",
  onDeleteSuccess,
}: DeleteEnrolmentModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      // Call appropriate DELETE API based on enrolment type
      const response = enrolmentType === "group" 
        ? await deleteGroupEnrolment(location, enrolmentId)
        : await deleteEnrolment(location, enrolmentId);
      
      if (response && response.success && response.data?.status) {
        // Show success message from API or default message
        const successMessage = response.data.message || response.message || "Enrolment deleted successfully";
        toast.success(successMessage);
        onOpenChange(false);
        onDeleteSuccess?.();
        
        // Redirect to enrolment listing page
        // API returns relative path in response.data.url (e.g., /{location}/enrolments)
        // Always redirect to enrolment listing page after successful deletion
        let redirectUrl = response.data?.url || `/${location}/enrolments`;
        
        // Ensure redirectUrl is a valid relative path (starts with /)
        if (!redirectUrl.startsWith('/')) {
          redirectUrl = `/${location}/enrolments`;
        }
        
        // Small delay to ensure modal closes and toast shows before redirect
        // Use router.push with the relative path directly (no URL parsing needed)
        setTimeout(() => {
          try {
            router.push(redirectUrl);
          } catch (redirectError) {
            // Fallback: try redirecting to default path
            try {
              router.push(`/${location}/enrolments`);
            } catch (fallbackError) {
              // Last resort: use window.location
              window.location.href = `/${location}/enrolments`;
            }
          }
        }, 100);
      } else {
        // Show error message
        const errorMessage = response?.data?.message || response?.message || "You are not allowed to delete this enrolment.";
        toast.error(errorMessage);
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
      size="lg"
      actions={modalActions}
      showFooter={true}
    >
      <></>
    </ReusableModal>
  );
}


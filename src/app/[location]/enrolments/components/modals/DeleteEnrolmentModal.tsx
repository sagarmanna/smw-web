"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteEnrolment, deleteGroupEnrolment, getEnrolmentDeletePreview, type DeletePreviewItem, type DeletePreviewPayment } from "../../[id]/enrolment-details.api";

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
  const [previewData, setPreviewData] = React.useState<{
    previewItems: DeletePreviewItem[];
    payments: DeletePreviewPayment[];
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  // Fetch preview when modal opens (only for private enrolments)
  React.useEffect(() => {
    if (open && enrolmentType === "private") {
      setIsLoadingPreview(true);
      getEnrolmentDeletePreview(location, enrolmentId)
        .then((response) => {
          if (response?.success && response.data) {
            setPreviewData({
              previewItems: response.data.previewItems,
              payments: response.data.payments,
            });
          } else {
            // If preview fails, still allow deletion (preview is informational)
            setPreviewData(null);
          }
        })
        .catch((error) => {
          console.error("Error loading delete preview:", error);
          setPreviewData(null);
        })
        .finally(() => {
          setIsLoadingPreview(false);
        });
    } else {
      setPreviewData(null);
    }
  }, [open, location, enrolmentId, enrolmentType]);

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
      {enrolmentType === "private" && (
        <div className="space-y-4">
          {isLoadingPreview ? (
            <div className="text-center py-4">Loading preview...</div>
          ) : previewData ? (
            <>
              {/* Enrolment Delete Preview */}
              <div>
                <label className="text-sm font-medium mb-2 block">Enrolment Delete Preview</label>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium">Objects</th>
                        <th className="px-4 py-2 text-left font-medium">Action</th>
                        <th className="px-4 py-2 text-left font-medium">Date Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.previewItems.map((item, index) => (
                        <tr key={index} className="border-t dark:border-gray-700">
                          <td className="px-4 py-2">{item.objects}</td>
                          <td className="px-4 py-2">{item.action}</td>
                          <td className="px-4 py-2">{item.date_range}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments to be deleted */}
              {previewData.payments.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Payments to be deleted</label>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium">Amount</th>
                          <th className="px-4 py-2 text-left font-medium">Type</th>
                          <th className="px-4 py-2 text-left font-medium">Reference</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.payments.map((payment, index) => (
                          <tr key={index} className="border-t dark:border-gray-700">
                            <td className="px-4 py-2">${Number(payment.amount).toFixed(2)}</td>
                            <td className="px-4 py-2">{payment.type}</td>
                            <td className="px-4 py-2">{payment.reference || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </ReusableModal>
  );
}


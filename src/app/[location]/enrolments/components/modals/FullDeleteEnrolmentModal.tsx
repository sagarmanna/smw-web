"use client";

import * as React from "react";
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getEnrolmentDeletePreview, type DeletePreviewItem, type DeletePreviewPayment } from "../../[id]/enrolment-details.api";
import { deleteEnrolmentFull } from "../../[id]/enrolment-details.api";

interface FullDeleteEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  enrolmentId: string;
  studentId?: number;
  onDeleteSuccess?: () => void;
}

export function FullDeleteEnrolmentModal({
  open,
  onOpenChange,
  location,
  enrolmentId,
  studentId,
  onDeleteSuccess,
}: FullDeleteEnrolmentModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [previewData, setPreviewData] = React.useState<{
    previewItems: DeletePreviewItem[];
    payments: DeletePreviewPayment[];
  } | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = React.useState(false);

  // Fetch preview when modal opens
  React.useEffect(() => {
    if (open) {
      setIsLoadingPreview(true);
      getEnrolmentDeletePreview(location, enrolmentId)
        .then((response) => {
          if (response?.success && response.data) {
            setPreviewData({
              previewItems: response.data.previewItems,
              payments: response.data.payments,
            });
          } else {
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
  }, [open, location, enrolmentId]);

  const handleFullDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await deleteEnrolmentFull(location, enrolmentId);
      
      if (response && response.success && response.data?.status) {
        const successMessage = response.data.message || response.message || "Enrolment fully deleted successfully";
        toast.success(successMessage);
        onOpenChange(false);
        onDeleteSuccess?.();
        
        // Redirect to student view (matches legacy behavior)
        if (studentId) {
          setTimeout(() => {
            router.push(`/${location}/students/${studentId}`);
          }, 100);
        } else {
          // Fallback to enrolment listing if no studentId
          setTimeout(() => {
            router.push(`/${location}/enrolments`);
          }, 100);
        }
      } else {
        const errorMessage = response?.data?.message || response?.message || "Failed to delete enrolment";
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
      label: isDeleting ? "Deleting..." : "Full Delete",
      onClick: handleFullDelete,
      variant: "destructive" as const,
      disabled: isDeleting || isLoadingPreview,
    },
  ];

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Full Delete Enrolment"
      description="This will permanently delete the enrolment and all associated data including lessons, payment cycles, invoices, and payments. This action cannot be undone."
      size="2xl"
      actions={modalActions}
      showFooter={true}
    >
      <div className="max-h-[60vh] overflow-y-auto space-y-4">
        {isLoadingPreview ? (
          <div className="text-center py-4">Loading preview...</div>
        ) : previewData ? (
          <>
            {/* Enrolment Delete Preview */}
            <div>
              <label className="text-sm font-medium mb-2 block">Enrolment Delete Preview</label>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
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
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
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
        ) : (
          <div className="text-center py-4 text-gray-500">Unable to load preview</div>
        )}
      </div>
    </ReusableModal>
  );
}

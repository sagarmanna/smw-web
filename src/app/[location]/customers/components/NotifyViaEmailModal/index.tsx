import React, { useState, useEffect } from 'react';
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";
import { getNotifyEmailPreview, updateNotifyEmail, NotifyEmailType } from "../../customers.api";

interface NotifyViaEmailReasonsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: string;
  customerId: number;
}

export function NotifyViaEmailReasonsModal({
  open,
  onOpenChange,
  location,
  customerId,
}: NotifyViaEmailReasonsModalProps) {
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTypes, setEmailTypes] = useState<NotifyEmailType[]>([]);

  // Fetch notification email types when modal opens
  useEffect(() => {
    if (open && customerId) {
      setIsLoading(true);
      getNotifyEmailPreview(location, customerId)
        .then((types) => {
          setEmailTypes(types);
          // Set selected reasons based on checked status
          const checkedIds = types
            .filter((type) => type.isChecked)
            .map((type) => type.id.toString());
          setSelectedReasons(checkedIds);
        })
        .catch((error) => {
          console.error('Failed to load notification email types:', error);
          toast.error('Failed to load notification email types');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [open, location, customerId]);

  const handleCheckboxChange = (typeId: number) => {
    const typeIdStr = typeId.toString();
    setSelectedReasons(prev => 
      prev.includes(typeIdStr)
        ? prev.filter(id => id !== typeIdStr)
        : [...prev, typeIdStr]
    );
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const selectedIds = selectedReasons.map(id => parseInt(id, 10));

      const response = await updateNotifyEmail(location, customerId, selectedIds);

      if (response.success) {
        toast.success("Notification email settings updated successfully");
        onOpenChange(false);
      } else {
        const errorMessage = response.message || "Failed to update notification email settings";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update notification email settings";
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    setSelectedReasons([]);
    onOpenChange(false);
  };

  const modalActions = [
    {
      label: "Cancel",
      onClick: handleCancel,
      variant: "outline" as const,
      disabled: isSending,
    },
    {
      label: isSending ? "Saving..." : "Save",
      onClick: handleSend,
      variant: "default" as const,
      disabled: isSending || isLoading,
    },
  ];

  return (
    <ReusableModal
      open={open}
      onOpenChange={onOpenChange}
      title="Notify Via Email Reasons"
      size="md"
      actions={modalActions}
      showFooter={true}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Loading notification types...
          </div>
        ) : emailTypes.length === 0 ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No notification types available
          </div>
        ) : (
          emailTypes.map((emailType) => (
            <div
              key={emailType.id}
              onClick={() => !isSending && handleCheckboxChange(emailType.id)}
              className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                isSending ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {selectedReasons.includes(emailType.id.toString()) ? (
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                {emailType.emailNotifyType}
              </span>
            </div>
          ))
        )}
      </div>
    </ReusableModal>
  );
}
import React, { useMemo, useState } from 'react';
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";
import { notifyCustomerByEmail } from "@/lib/api/legacyApiAdapter";

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

  const reasons = useMemo(
    () => [
      { id: "upcoming-makeup", label: "Upcoming Makeup lesson", legacyValue: 1 },
      { id: "first-scheduled", label: "First scheduled Lesson", legacyValue: 2 },
      { id: "overdue-invoice", label: "OverDue Invoice", legacyValue: 3 },
      { id: "future-lessons", label: "Future Lessons", legacyValue: 4 },
    ],
    []
  );

  const handleCheckboxChange = (reasonId: string) => {
    setSelectedReasons(prev => 
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSend = async () => {
    setIsSending(true);
    try {
      const selectedIds = reasons
        .filter((reason) => selectedReasons.includes(reason.id))
        .map((reason) => reason.legacyValue);

      const response = await notifyCustomerByEmail(location, customerId, {
        emailNotifyTypeIds: selectedIds,
      });

      if (response.status) {
        toast.success("Notification email sent successfully");
        setSelectedReasons([]);
        onOpenChange(false);
      } else {
        const errorMessage =
          response.message || response.errors?.join(", ") ||
          "Failed to send notification email";
        toast.error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send notification email";
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
      label: isSending ? "Sending..." : "Send",
      onClick: handleSend,
      variant: "default" as const,
      disabled: selectedReasons.length === 0 || isSending,
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
        {reasons.map((reason) => (
          <div
            key={reason.id}
            onClick={() => !isSending && handleCheckboxChange(reason.id)}
            className={`flex items-center space-x-3 p-3 rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
              isSending ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {selectedReasons.includes(reason.id) ? (
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600 flex-shrink-0" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
              {reason.label}
            </span>
          </div>
        ))}
      </div>
    </ReusableModal>
  );
}
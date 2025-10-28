import React, { useState } from 'react';
import { ReusableModal } from "@/components/TablesModals";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";

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

  const reasons = [
    { id: "upcoming-makeup", label: "Upcoming Makeup lesson" },
    { id: "first-scheduled", label: "First scheduled Lesson" },
    { id: "overdue-invoice", label: "OverDue Invoice" },
    { id: "future-lessons", label: "Future Lessons" },
  ];

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
      console.log("Sending notification for reasons:", selectedReasons);
      console.log("Location:", location, "Customer ID:", customerId);
      
      // TODO: Call API to send notification email
      // Example: await sendNotificationEmail(location, customerId, selectedReasons);
      
      toast.success("Notification email sent successfully");
      
      setSelectedReasons([]);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to send notification email");
      console.error("Error sending notification:", error);
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
      <div className="space-y-3">
        {reasons.map((reason) => (
          <button
            key={reason.id}
            type="button"
            onClick={() => handleCheckboxChange(reason.id)}
            disabled={isSending}
            className="flex items-center space-x-3 w-full text-left p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedReasons.includes(reason.id) ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600" />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300">
              {reason.label}
            </span>
          </button>
        ))}
      </div>
    </ReusableModal>
  );
}
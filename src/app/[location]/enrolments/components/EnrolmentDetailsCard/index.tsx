"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { EnrolmentDetails } from "../../types";
import { EditEnrolmentDetailsModal } from "../modals/EditEnrolmentDetailsModal";

interface EnrolmentDetailsCardProps {
  details: EnrolmentDetails | null;
  onSaveDetails: (details: Partial<EnrolmentDetails>) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  location: string;
  studentId?: number;
  customerId?: number;
}

export const EnrolmentDetailsCard = React.memo(function EnrolmentDetailsCard({
  details,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
  location,
  studentId,
  customerId,
}: EnrolmentDetailsCardProps) {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleStudentClick = React.useCallback(() => {
    if (studentId) {
      router.push(`/${location}/students/${studentId}`);
    }
  }, [studentId, location, router]);

  const handleCustomerClick = React.useCallback(() => {
    if (customerId) {
      router.push(`/${location}/customers/${customerId}`);
    }
  }, [customerId, location, router]);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const rateText = details?.rateFromDate && details?.rateToDate
      ? `${details.rate} From ${details.rateFromDate} To ${details.rateToDate}`
      : details?.rate || "N/A";

    const studentValue = studentId ? (
      <span
        onClick={handleStudentClick}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
      >
        {details?.student || "N/A"}
      </span>
    ) : (
      details?.student || "N/A"
    );

    const customerValue = customerId ? (
      <span
        onClick={handleCustomerClick}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
      >
        {details?.customer || "N/A"}
      </span>
    ) : (
      details?.customer || "N/A"
    );

    return [
      {
        label: "Program",
        value: details?.program || "N/A",
      },
      {
        label: "Teacher",
        value: details?.teacher || "N/A",
      },
      {
        label: "Rate",
        value: rateText,
      },
      {
        label: "Auto Renewal",
        value: details?.autoRenewal || "N/A",
      },
      {
        label: "Duration",
        value: details?.duration || "N/A",
      },
      {
        label: "Student",
        value: studentValue,
      },
      {
        label: "Customer",
        value: customerValue,
      },
      {
        label: "Online",
        value: details?.online ? "Yes" : "No",
      },
    ];
  }, [details, studentId, customerId, handleStudentClick, handleCustomerClick]);

  const handleSave = React.useCallback(
    async (data: Partial<EnrolmentDetails>): Promise<boolean> => {
      const success = await onSaveDetails(data);
      
      if (success) {
        setIsEditModalOpen(false);
      }
      
      return success;
    },
    [onSaveDetails]
  );

  return (
    <>
      <SectionCard
        title="Details"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <>
            <EditButton onClick={() => setIsEditModalOpen(true)} />
          </>
        }
      />

      <EditEnrolmentDetailsModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        details={details}
        onSubmit={handleSave}
        saving={savingDetails}
      />
    </>
  );
});


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

    const rows: SectionCardDataRow[] = [
      {
        label: "Program",
        value: details?.program || "N/A",
      },
      {
        label: "Teacher",
        value: details?.teacher || "N/A",
      },
    ];

    // Add each rate as a separate row (format: "Rate" -> "$20.00 From Dec 17, 2025 To Feb 28, 2026")
    const rates = details?.rates || [];
    if (rates.length > 0) {
      rates.forEach((rate) => {
        if (rate.fromDate && rate.toDate && rate.amount) {
          // Format: Label: "Rate", Value: "$20.00 From Dec 17, 2025 To Feb 28, 2026"
          const rateValue = `${rate.amount} From ${rate.fromDate} To ${rate.toDate}`;
          rows.push({
            label: "Rate",
            value: rateValue,
          });
        } else if (rate.amount) {
          // Fallback if dates are missing
          rows.push({
            label: "Rate",
            value: rate.amount,
          });
        }
      });
    } else {
      // Fallback to single rate if rates array is empty
      if (details?.rateFromDate && details?.rateToDate && details?.rate) {
        const rateValue = `${details.rate} From ${details.rateFromDate} To ${details.rateToDate}`;
        rows.push({
          label: "Rate",
          value: rateValue,
        });
      } else {
        rows.push({
          label: "Rate",
          value: details?.rate || "N/A",
        });
      }
    }

    rows.push(
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
      }
    );

    return rows;
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


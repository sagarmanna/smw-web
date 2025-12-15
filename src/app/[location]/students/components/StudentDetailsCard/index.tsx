"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
  ActionsDropdown,
} from "@/components/SectionCard";
import { SectionCardDataRow, DropdownOption } from "@/components/SectionCard/types";
import { StudentBasicDetails } from "../../types";
import { EditStudentDetailsModal } from "../modals/EditStudentDetailsModal";
import { DeleteStudentModal } from "../modals/DeleteStudentModal";
import { MergeStudentModal } from "../modals/MergeStudentModal";

interface StudentDetailsCardProps {
  details: StudentBasicDetails | null;
  onSaveDetails: (details: StudentBasicDetails) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  location: string;
  studentId: string;
  customerId: number;
  onDeleteSuccess?: () => void;
  onMergeSuccess?: () => void;
}

export const StudentDetailsCard = React.memo(function StudentDetailsCard({
  details,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
  location,
  studentId,
  customerId,
  onDeleteSuccess,
  onMergeSuccess,
}: StudentDetailsCardProps) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isMergeModalOpen, setIsMergeModalOpen] = React.useState(false);

  const dropdownOptions = React.useMemo<DropdownOption[]>(() => [
    {
      title: "Delete",
      onClick: () => setIsDeleteModalOpen(true),
      destructive: true,
    },
    {
      title: "Merge",
      onClick: () => setIsMergeModalOpen(true),
    },
  ], []);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const fullName = details ? `${details.firstName} ${details.lastName}`.trim() : "";

    return [
      {
        label: "Name",
        value: fullName || "N/A",
      },
      {
        label: "Birthday",
        value: details?.birthday || "N/A",
      },
      {
        label: "Age",
        value: details?.age || "N/A",
      },
      {
        label: "Gender",
        value: details?.gender || "N/A",
      },
      {
        label: "Status",
        value: details?.status || "N/A",
      },
      {
        label: "Notes",
        value: details?.notes || "N/A",
      },
    ];
  }, [details]);

  const handleSave = React.useCallback(
    async (data: StudentBasicDetails): Promise<boolean> => {
      const success = await onSaveDetails(data);
      
      if (success) {
        setIsEditDetailsOpen(false);
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
            <EditButton onClick={() => setIsEditDetailsOpen(true)} />
            {dropdownOptions.length > 0 && <ActionsDropdown options={dropdownOptions} />}
          </>
        }
      />

      <EditStudentDetailsModal
        open={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        details={details}
        onSubmit={handleSave}
        saving={savingDetails}
      />

      <DeleteStudentModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        location={location}
        studentId={studentId}
        onDeleteSuccess={onDeleteSuccess}
      />

      <MergeStudentModal
        open={isMergeModalOpen}
        onOpenChange={setIsMergeModalOpen}
        location={location}
        currentStudentId={studentId}
        currentStudentDetails={details}
        customerId={customerId}
        onMergeSuccess={onMergeSuccess}
      />
    </>
  );
});


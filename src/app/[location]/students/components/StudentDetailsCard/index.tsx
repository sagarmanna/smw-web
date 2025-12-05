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

interface StudentDetailsCardProps {
  details: StudentBasicDetails | null;
  onSaveDetails: (details: StudentBasicDetails) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  onDelete?: () => void;
  onMerge?: () => void;
}

export const StudentDetailsCard = React.memo(function StudentDetailsCard({
  details,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
  onDelete,
  onMerge,
}: StudentDetailsCardProps) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);

  const dropdownOptions = React.useMemo<DropdownOption[]>(() => {
    const options: DropdownOption[] = [];
    
    if (onDelete) {
      options.push({
        title: "Delete",
        onClick: onDelete,
        destructive: true,
      });
    }
    
    if (onMerge) {
      options.push({
        title: "Merge",
        onClick: onMerge,
      });
    }
    
    return options;
  }, [onDelete, onMerge]);

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
    </>
  );
});


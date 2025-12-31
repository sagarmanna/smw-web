"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
  ActionsDropdown,
} from "@/components/SectionCard";
import { SectionCardDataRow, DropdownOption } from "@/components/SectionCard/types";
import { EditStaffMemberDetailsModal } from "../modals/EditStaffMemberDetailsModal";
import { StaffMemberBasicDetails } from "../../types";
import { formatDisplayDate } from "@/utils/dateUtils";
import { formatFullName } from "../../utils/nameUtils";

interface StaffMemberDetailsCardProps {
  details: StaffMemberBasicDetails | null;
  onSaveDetails: (details: StaffMemberBasicDetails) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  formatDisplayDate?: (value?: string) => string;
}

export const StaffMemberDetailsCard = React.memo(function StaffMemberDetailsCard({
  details,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
  formatDisplayDate: customFormatDate,
}: StaffMemberDetailsCardProps) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);

  const dropdownOptions = React.useMemo<DropdownOption[]>(
    () => [],
    []
  );

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const fullName = formatFullName(details?.firstName, details?.lastName);

    return [
      {
        label: "Name",
        value: fullName || "N/A",
      },
      {
        label: "Role",
        value: details?.role || "Staff Member",
      },
    ];
  }, [details]);

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

      <EditStaffMemberDetailsModal
        open={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        details={
          details ?? {
            firstName: "",
            lastName: "",
          }
        }
        onSubmit={onSaveDetails}
        saving={savingDetails}
      />
    </>
  );
});


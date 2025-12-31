"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
  ActionsDropdown,
} from "@/components/SectionCard";
import { SectionCardDataRow, DropdownOption } from "@/components/SectionCard/types";
import { EditAdministratorDetailsModal } from "../modals/EditAdministratorDetailsModal";
import { AdministratorBasicDetails } from "../../types";
import { formatDisplayDate } from "@/utils/dateUtils";

interface AdministratorDetailsCardProps {
  details: AdministratorBasicDetails | null;
  onSaveDetails: (details: AdministratorBasicDetails) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  formatDisplayDate?: (value?: string) => string;
}

export const AdministratorDetailsCard = React.memo(function AdministratorDetailsCard({
  details,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
  formatDisplayDate: customFormatDate,
}: AdministratorDetailsCardProps) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);

  const dropdownOptions = React.useMemo<DropdownOption[]>(
    () => [],
    []
  );

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const fullName = details ? `${details.firstName} ${details.lastName}`.trim() : "";

    return [
      {
        label: "Name",
        value: fullName || "N/A",
      },
      {
        label: "Role",
        value: details?.role || "Administrator",
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

      <EditAdministratorDetailsModal
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


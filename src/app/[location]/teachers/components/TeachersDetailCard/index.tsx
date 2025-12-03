"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
  ActionsDropdown,
} from "@/components/SectionCard";
import { SectionCardDataRow, DropdownOption } from "@/components/SectionCard/types";
import { EditTeacherDetailsModal } from "../modals/EditTeacherDetailsModal";
import { SetTeacherPasswordModal } from "../modals/SetTeacherPasswordModal";
import { TeacherBasicDetails } from "../../types";
import { formatDisplayDate } from "@/utils/dateUtils";
import { formatFullName } from "../../utils/nameUtils";

interface TeachersDetailCardProps {
  details: TeacherBasicDetails | null;
  onSaveDetails: (details: TeacherBasicDetails) => Promise<boolean>;
  onUpdatePassword: (password: string, confirmPassword: string) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  formatDisplayDate?: (value?: string) => string;
}

export const TeachersDetailCard = React.memo(function TeachersDetailCard({
  details,
  onSaveDetails,
  onUpdatePassword,
  savingDetails = false,
  isLoading = false,
  formatDisplayDate: customFormatDate,
}: TeachersDetailCardProps) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const formatDate = customFormatDate || formatDisplayDate;

  const dropdownOptions = React.useMemo<DropdownOption[]>(
    () => [
      {
        title: "Set Password",
        onClick: () => setIsPasswordModalOpen(true),
      },
    ],
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
        value: details?.role || "Teacher",
      },
      {
        label: "Birth Date",
        value: formatDate(details?.birthDate),
      },
    ];
  }, [details, formatDate]);

  const handlePasswordSave = React.useCallback(
    async (password: string, confirmPassword: string): Promise<boolean> => {
      const success = await onUpdatePassword(password, confirmPassword);
      if (success) {
        setIsPasswordModalOpen(false);
      }
      return success;
    },
    [onUpdatePassword]
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
            <ActionsDropdown options={dropdownOptions} />
          </>
        }
      />

      <EditTeacherDetailsModal
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

      <SetTeacherPasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handlePasswordSave}
      />
    </>
  );
});


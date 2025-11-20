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

interface TeachersDetailCardProps {
  details: TeacherBasicDetails | null;
  onSaveDetails: (details: TeacherBasicDetails) => Promise<boolean>;
  onUpdatePassword: (password: string) => Promise<boolean>;
  savingDetails?: boolean;
  formatDisplayDate?: (value?: string) => string;
}

export function TeachersDetailCard({
  details,
  onSaveDetails,
  onUpdatePassword,
  savingDetails = false,
  formatDisplayDate,
}: TeachersDetailCardProps) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const defaultFormatDate = React.useCallback((value?: string) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }, []);

  const formatDate = formatDisplayDate || defaultFormatDate;

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
    const fullName = details
      ? [details.firstName, details.lastName].filter(Boolean).join(" ")
      : "";

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
    async (password: string): Promise<boolean> => {
      const success = await onUpdatePassword(password);
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
}


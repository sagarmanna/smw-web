"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";
import { EditAttendanceModal } from "../modals/EditAttendanceModal";

interface PrivateLessonAttendanceCardProps {
  details: PrivateLessonDetails | null;
  onSaveAttendance: (present: boolean) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export const PrivateLessonAttendanceCard = React.memo(function PrivateLessonAttendanceCard({
  details,
  onSaveAttendance,
  savingDetails = false,
  isLoading = false,
}: PrivateLessonAttendanceCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Present",
        value: details?.attendance.present ? "Yes" : "No",
      },
    ];
  }, [details]);

  const handleEditClick = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleSubmit = React.useCallback(
    async (present: boolean): Promise<boolean> => {
      return await onSaveAttendance(present);
    },
    [onSaveAttendance]
  );

  return (
    <>
      <SectionCard
        title="Attendance"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <>
            <EditButton onClick={handleEditClick} />
          </>
        }
      />
      <EditAttendanceModal
        open={isModalOpen}
        onClose={handleClose}
        present={details?.attendance.present || false}
        onSubmit={handleSubmit}
        saving={savingDetails}
      />
    </>
  );
});


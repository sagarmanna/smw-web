"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";
import { EditPrivateLessonDetailsModal } from "../modals/EditPrivateLessonDetailsModal";

interface PrivateLessonDetailsCardProps {
  details: PrivateLessonDetails | null;
  onSaveDetails: (details: Partial<PrivateLessonDetails>) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  location?: string;
}

export const PrivateLessonDetailsCard = React.memo(function PrivateLessonDetailsCard({
  details,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
  location,
}: PrivateLessonDetailsCardProps) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const colorCodeDisplay = details?.colorCode ? (
      <div className="flex items-center gap-2">
        <div
          className="w-4 h-4 rounded border border-gray-300"
          style={{ backgroundColor: details.colorCode }}
        />
        <span>{details.colorCode}</span>
      </div>
    ) : "N/A";

    return [
      {
        label: "Program",
        value: details?.program || "N/A",
      },
      {
        label: "Classroom",
        value: details?.classroom || "N/A",
      },
      {
        label: "Status",
        value: details?.status || "N/A",
      },
      {
        label: "Color Code",
        value: colorCodeDisplay,
      },
      {
        label: "Online",
        value: details?.online ? "Yes" : "No",
      },
    ];
  }, [details]);

  const handleEditClick = React.useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleSubmit = React.useCallback(
    async (data: { classroom?: string; colorCode?: string; online?: boolean }): Promise<boolean> => {
      if (!location) return false;
      const updatedDetails: Partial<PrivateLessonDetails> = {
        classroom: data.classroom,
        colorCode: data.colorCode,
        online: data.online,
      };
      return await onSaveDetails(updatedDetails);
    },
    [onSaveDetails, location]
  );

  const handleClose = React.useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <SectionCard
        title="Details"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <>
            <EditButton onClick={handleEditClick} />
          </>
        }
      />
      <EditPrivateLessonDetailsModal
        open={isModalOpen}
        onClose={handleClose}
        details={{
          classroom: details?.classroom,
          colorCode: details?.colorCode,
          online: details?.online,
        }}
        location={location || ""}
        onSubmit={handleSubmit}
        saving={savingDetails}
      />
    </>
  );
});


"use client";

import * as React from "react";
import { SectionCard, EditButton } from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { GenericBasicDetails } from "../../types/common";

interface UserDetailsCardProps<TDetails extends GenericBasicDetails> {
  details: TDetails | null;
  config: {
    defaultRole: string;
    roleLabel: string;
  };
  onSaveDetails: (details: TDetails) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
  EditModal: React.ComponentType<{
    open: boolean;
    onClose: () => void;
    details: TDetails | null;
    onSubmit: (details: TDetails) => Promise<boolean>;
    saving?: boolean;
  }>;
  customActions?: React.ReactNode;
  formatName?: (details: TDetails | null) => string;
}

export function UserDetailsCard<TDetails extends GenericBasicDetails>({
  details,
  config,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
  EditModal,
  customActions,
  formatName,
}: UserDetailsCardProps<TDetails>) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const fullName = formatName 
      ? formatName(details)
      : details 
        ? `${details.firstName} ${details.lastName}`.trim() 
        : "";

    return [
      {
        label: "Name",
        value: fullName || "N/A",
      },
      {
        label: config.roleLabel,
        value: details?.role || config.defaultRole,
      },
    ];
  }, [details, config, formatName]);

  return (
    <>
      <SectionCard
        title="Details"
        data={detailRows}
        isLoading={isLoading}
        headerActions={
          <>
            <EditButton onClick={() => setIsEditDetailsOpen(true)} />
            {customActions}
          </>
        }
      />

      <EditModal
        open={isEditDetailsOpen}
        onClose={() => setIsEditDetailsOpen(false)}
        details={details}
        onSubmit={onSaveDetails}
        saving={savingDetails}
      />
    </>
  );
}


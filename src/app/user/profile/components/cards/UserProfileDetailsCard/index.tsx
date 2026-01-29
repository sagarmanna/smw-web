"use client";

import * as React from "react";
import { SectionCard, EditButton } from "@/components/SectionCard";
import type { SectionCardDataRow } from "@/components/SectionCard/types";
import type { GenericBasicDetails } from "@/components/user-details/types/common";
import EditProfileDetailsModal from "../../modals/EditProfileDetailsModal";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Link2 } from "lucide-react";

interface UserProfileDetailsCardProps<TDetails extends GenericBasicDetails> {
  details: TDetails | null;
  defaultRole: string;
  roleLabel: string;
  onSaveDetails: (details: TDetails) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export default function UserProfileDetailsCard<TDetails extends GenericBasicDetails>({
  details,
  defaultRole,
  roleLabel,
  onSaveDetails,
  savingDetails = false,
  isLoading = false,
}: UserProfileDetailsCardProps<TDetails>) {
  const [open, setOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const fullName = details ? `${details.firstName} ${details.lastName}`.trim() : "";
    return [
      { label: "Name", value: fullName || "N/A" },
    ];
  }, [details, roleLabel, defaultRole]);

  return (
    <>
      <SectionCard
        title="Details"
        data={detailRows}
        isLoading={isLoading}
        headerActions={
          <>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground"
                    aria-label="Merge"
                    onClick={() => {
                      // UI-only placeholder for now
                    }}
                  >
                    <Link2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Merge</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <EditButton onClick={() => setOpen(true)} />
          </>
        }
      />

      <EditProfileDetailsModal
        open={open}
        onClose={() => setOpen(false)}
        details={details}
        onSubmit={onSaveDetails}
        saving={savingDetails}
        title="Edit Details"
        defaultRole={defaultRole}
      />
    </>
  );
}


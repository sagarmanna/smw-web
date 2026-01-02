"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { EditOwnerDetailsModal } from "../modals/EditOwnerDetailsModal";
import { SetOwnerPasswordModal } from "../modals/SetOwnerPasswordModal";
import { OwnerBasicDetails } from "../../types";
import { formatFullName } from "../../utils/nameUtils";

interface OwnerDetailsCardProps {
  details: OwnerBasicDetails | null;
  onSaveDetails: (details: OwnerBasicDetails) => Promise<boolean>;
  onUpdatePassword: (password: string, confirmPassword: string) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export const OwnerDetailsCard = React.memo(function OwnerDetailsCard({
  details,
  onSaveDetails,
  onUpdatePassword,
  savingDetails = false,
  isLoading = false,
}: OwnerDetailsCardProps) {
  const [isEditDetailsOpen, setIsEditDetailsOpen] = React.useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const fullName = formatFullName(details?.firstName, details?.lastName);

    return [
      {
        label: "Name",
        value: fullName || "N/A",
      },
      {
        label: "Role",
        value: details?.role || "Owner",
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  aria-label="More actions"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsPasswordModalOpen(true)}>
                  Set Password
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <EditOwnerDetailsModal
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

      <SetOwnerPasswordModal
        open={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={async (password: string, confirmPassword: string) => {
          const success = await onUpdatePassword(password, confirmPassword);
          if (success) {
            setIsPasswordModalOpen(false);
          }
          return success;
        }}
      />
    </>
  );
});


import * as React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { isDev } from "@/utils/env";

interface PrivateLessonsToolbarProps {
  hasSelection: boolean;
  onSubstituteTeacherClick: () => void;
  onEditDiscountClick: () => void;
  onEditDurationClick: () => void;
  onDeleteClick: () => void;
  onEditClassroomClick: () => void;
  onEditOnlineTypeClick: () => void;
  onEmailSelectedClick: () => void;
  onUnscheduleClick: () => void;
  onBulkRescheduleClick: () => void;
  onGenerateInvoiceClick: () => void;
}

const showtoast = () => {
  toast.info("This feature is in development.")
}

export function PrivateLessonsToolbar({
  hasSelection,
  onSubstituteTeacherClick,
  onEditDiscountClick,
  onEditDurationClick,
  onDeleteClick,
  onEditClassroomClick,
  onEditOnlineTypeClick,
  onEmailSelectedClick,
  onUnscheduleClick,
  onBulkRescheduleClick,
  onGenerateInvoiceClick,
}: PrivateLessonsToolbarProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Edit</p>
          </TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onSubstituteTeacherClick}
            disabled={!hasSelection}
          >
            Substitute Teacher
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onEditDiscountClick}
            disabled={!hasSelection}
          >
            Edit Discount
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onEditDurationClick}
            disabled={!hasSelection}
          >
            Edit Duration
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onDeleteClick}
            disabled={!hasSelection}
            className="text-destructive focus:text-destructive"
          >
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onEditClassroomClick}
            disabled={!hasSelection}
          >
            Edit Classroom
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onEditOnlineTypeClick}
            disabled={!hasSelection}
          >
            Edit Online Type
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onEmailSelectedClick}
            disabled={!hasSelection}
          >
            Email Selected
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onUnscheduleClick}
            disabled={!hasSelection}
          >
            Unschedule
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onBulkRescheduleClick}
            disabled={!hasSelection}
          >
            Bulk Reschedule
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={!isDev() ? showtoast : onGenerateInvoiceClick}
            disabled={!hasSelection}
          >
            Generate Invoice
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}


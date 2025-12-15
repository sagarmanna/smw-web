"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NewEnrolmentModal, type EnrolmentFormData } from "././AddPrivateModal/NewEnrolmentModal";
import { 
  AddGroupEnrolmentModal, 
  type GroupEnrolmentCompleteData 
} from "./AddGroupModal/AddGroupEnrolmentModal";
import { StudentEnrolment } from "../../types";
import { toast } from "sonner";
import { isDev } from "@/utils/env";

interface StudentEnrolmentsCardProps {
  enrolments: StudentEnrolment[];
  isLoading?: boolean;
  location: string;
  onRefresh?: () => void;
}

const enrolmentColumns = [
  { accessorKey: "program", header: "Program" },
  { accessorKey: "teacher", header: "Teacher" },
  { accessorKey: "day", header: "Day" },
  { accessorKey: "fromTime", header: "From Time" },
  { accessorKey: "duration", header: "Duration" },
  { accessorKey: "startDate", header: "Start Date" },
  { accessorKey: "endDate", header: "End Date" },
];

export const StudentEnrolmentsCard = React.memo(function StudentEnrolmentsCard({
  enrolments,
  isLoading = false,
  location,
  onRefresh,
}: StudentEnrolmentsCardProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [isNewEnrolmentModalOpen, setIsNewEnrolmentModalOpen] = React.useState(false);
  const [isAddGroupEnrolmentModalOpen, setIsAddGroupEnrolmentModalOpen] = React.useState(false);
  const [localEnrolments, setLocalEnrolments] = React.useState<StudentEnrolment[]>([]);
  
  // Merge local enrolments with props enrolments
  const displayEnrolments = React.useMemo(() => {
    return [...enrolments, ...localEnrolments];
  }, [enrolments, localEnrolments]);

  const handleNewEnrolmentNext = (data: EnrolmentFormData) => {
    // TODO: Implement API call to create enrolment
    setIsNewEnrolmentModalOpen(false);
  };

  const handleGroupEnrolmentNext = (data: GroupEnrolmentCompleteData) => {
    // Static implementation - API call ignored
    // Transform GroupEnrolmentOption to StudentEnrolment format
    const newEnrolment: StudentEnrolment = {
      id: Date.now(), // Temporary ID for local state
      program: data.groupEnrolment.course,
      teacher: data.groupEnrolment.teacher,
      day: data.groupEnrolment.day,
      fromTime: data.groupEnrolment.fromTime,
      duration: data.groupEnrolment.duration,
      startDate: data.groupEnrolment.startDate,
      endDate: data.groupEnrolment.endDate,
    };
    
    // Add to local state to display in table
    setLocalEnrolments((prev) => [...prev, newEnrolment]);
    
    // Close modal
    setIsAddGroupEnrolmentModalOpen(false);
    
    // TODO: Implement API call to create group enrolment when ready
    // The data structure is ready for API integration:
    // - data.groupEnrolment: Group enrolment details (course, teacher, day, rate, etc.)
    // - data.discountData: Discount type and value
    // - data.lessons: Array of lesson details with prices, discounts, and totals
    // After API call, call onRefresh() to reload from server
  };

  const handleRowClick = React.useCallback(
    (enrolment: StudentEnrolment) => {
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      const url = `${legacyBase}/${location}/enrolment/view?id=${enrolment.id}`;
      window.location.href = url;
    },
    [location]
  );

  return (
    <>
      <SectionCard
        title="Enrolments"
        isLoading={isLoading}
        headerActions={
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-all-enrolments"
                checked={showAll}
                onCheckedChange={(checked) => setShowAll(checked === true)}
              />
              <Label
                htmlFor="show-all-enrolments"
                className="text-sm font-normal cursor-pointer"
              >
                Show All
              </Label>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Enrolment actions"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => isDev() ? setIsNewEnrolmentModalOpen(true) : toast.info("This feature is in development...")}>
                  Add Private...
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => isDev() ? setIsAddGroupEnrolmentModalOpen(true) : toast.info("This feature is in development...")}>
                  Add Group...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      >
        {displayEnrolments.length > 0 ? (
          <CustomTable
            data={displayEnrolments}
            columns={enrolmentColumns}
            enableSearch={false}
            enableExport={false}
            enableFilter={false}
            enablePrint={false}
            enableSorting={false}
            enableRowsPerPage={false}
            onRowClick={handleRowClick}
            rowClassName="cursor-pointer"
          />
        ) : (
          <p className="text-sm text-muted-foreground">No enrolments found.</p>
        )}
      </SectionCard>

      <NewEnrolmentModal
        open={isNewEnrolmentModalOpen}
        onOpenChange={setIsNewEnrolmentModalOpen}
        onNext={handleNewEnrolmentNext}
        location={location}
      />

      <AddGroupEnrolmentModal
        open={isAddGroupEnrolmentModalOpen}
        onOpenChange={setIsAddGroupEnrolmentModalOpen}
        onNext={handleGroupEnrolmentNext}
        location={location}
      />
    </>
  );
});

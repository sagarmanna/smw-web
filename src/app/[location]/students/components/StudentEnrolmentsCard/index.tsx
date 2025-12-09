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
import { NewEnrolmentModal, type EnrolmentFormData } from "./NewEnrolmentModal";

interface Enrolment {
  program: string;
  teacher: string;
  day: string;
  fromTime: string;
  duration: string;
  startDate: string;
  endDate: string;
}

interface StudentEnrolmentsCardProps {
  enrolments: Enrolment[];
  isLoading?: boolean;
  location: string;
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
}: StudentEnrolmentsCardProps) {
  const [showAll, setShowAll] = React.useState(false);
  const [isNewEnrolmentModalOpen, setIsNewEnrolmentModalOpen] = React.useState(false);

  const handleNewEnrolmentNext = (data: EnrolmentFormData) => {
    console.log("New enrolment data:", data);
    // TODO: Implement API call to create enrolment
    setIsNewEnrolmentModalOpen(false);
  };

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
                <DropdownMenuItem onClick={() => setIsNewEnrolmentModalOpen(true)}>
                  Add Private...
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => console.log("Add Group...")}>
                  Add Group...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      >
        {enrolments.length > 0 ? (
          <CustomTable
            data={enrolments}
            columns={enrolmentColumns}
            enableSearch={false}
            enableExport={false}
            enableFilter={false}
            enablePrint={false}
            enableSorting={false}
            enableRowsPerPage={false}
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
    </>
  );
});


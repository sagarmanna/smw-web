"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

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
}: StudentEnrolmentsCardProps) {
  return (
    <SectionCard
      title="Enrolments"
      isLoading={isLoading}
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Expand enrolments"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
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
  );
});


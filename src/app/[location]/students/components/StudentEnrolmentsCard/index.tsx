"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StudentEnrolment } from "../../types";

interface StudentEnrolmentsCardProps {
  enrolments: StudentEnrolment[];
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
  const handleRowClick = React.useCallback(
    (enrolment: StudentEnrolment) => {
      // Redirect to enrolment view page with the enrolment ID
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      const url = `${legacyBase}/${location}/enrolment/view?id=${enrolment.id}`;
      // Navigate directly in the same window to avoid blank page issue
      window.location.href = url;
    },
    [location]
  );

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
          onRowClick={handleRowClick}
          rowClassName="cursor-pointer"
        />
      ) : (
        <p className="text-sm text-muted-foreground">No enrolments found.</p>
      )}
    </SectionCard>
  );
});


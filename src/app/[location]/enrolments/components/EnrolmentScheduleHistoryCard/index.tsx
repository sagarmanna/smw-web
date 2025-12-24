"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { EnrolmentScheduleHistory } from "../../types";

interface EnrolmentScheduleHistoryCardProps {
  scheduleHistory: EnrolmentScheduleHistory[];
  isLoading?: boolean;
}

export const EnrolmentScheduleHistoryCard = React.memo(function EnrolmentScheduleHistoryCard({
  scheduleHistory,
  isLoading = false,
}: EnrolmentScheduleHistoryCardProps) {
  const columns = React.useMemo<ColumnDef<EnrolmentScheduleHistory>[]>(() => [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return <span className="truncate block max-w-[220px]" title={date}>{date || "-"}</span>;
      },
    },
    {
      accessorKey: "day",
      header: "Day",
      cell: ({ getValue }) => {
        const day = getValue() as string;
        return <span>{day || "-"}</span>;
      },
    },
    {
      accessorKey: "time",
      header: "Time",
      cell: ({ getValue }) => {
        const time = getValue() as string;
        return <span>{time || "-"}</span>;
      },
    },
    {
      accessorKey: "duration",
      header: "Duration",
      cell: ({ getValue }) => {
        const duration = getValue() as string;
        return <span>{duration || "-"}</span>;
      },
    },
    {
      accessorKey: "teacher",
      header: "Teacher",
      cell: ({ getValue }) => {
        const teacher = getValue() as string;
        return <span className="truncate block max-w-[220px]" title={teacher}>{teacher || "-"}</span>;
      },
    },
  ], []);

  return (
    <SectionCard
      title="Schedule History"
      isLoading={isLoading}
      className="w-full"
    >
      <CustomTable
        data={scheduleHistory}
        columns={columns}
        size="compact"
        variant="striped"
        enableSorting={false}
        enableSearch={false}
        enableFilter={false}
        enableRowsPerPage={false}
        enablePrint={false}
        isLoading={isLoading}
      />
    </SectionCard>
  );
});


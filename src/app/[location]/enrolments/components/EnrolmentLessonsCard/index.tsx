"use client";

import * as React from "react";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { EnrolmentLesson } from "../../types";

interface EnrolmentLessonsCardProps {
  lessons: EnrolmentLesson[];
  isLoading?: boolean;
}

export const EnrolmentLessonsCard = React.memo(function EnrolmentLessonsCard({
  lessons,
  isLoading = false,
}: EnrolmentLessonsCardProps) {
  const columns = React.useMemo<ColumnDef<EnrolmentLesson>[]>(() => [
    {
      accessorKey: "dueDate",
      header: "Due Date",
      cell: ({ getValue }) => {
        const dueDate = getValue() as string;
        return <span>{dueDate || "-"}</span>;
      },
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ getValue }) => {
        const date = getValue() as string;
        return <span className="truncate block max-w-[220px]" title={date}>{date || "-"}</span>;
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
      accessorKey: "status",
      header: "Status",
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return <span>{status || "-"}</span>;
      },
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ getValue }) => {
        const price = getValue() as string;
        return <span>{price || "-"}</span>;
      },
    },
    {
      accessorKey: "owing",
      header: "Owing",
      cell: ({ getValue }) => {
        const owing = getValue() as string;
        return <span>{owing || "-"}</span>;
      },
    },
    {
      accessorKey: "online",
      header: "Online",
      cell: ({ getValue }) => {
        const online = getValue() as boolean;
        return <span>{online ? "Yes" : "No"}</span>;
      },
    },
  ], []);

  return (
    <SectionCard
      title="Lessons"
      isLoading={isLoading}
      className="w-full"
    >
      <CustomTable
        data={lessons}
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


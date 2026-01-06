"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";

interface HistoryItem {
  createdOn: string;
  message: string;
}

interface InvoiceHistoryCardProps {
  history?: HistoryItem[];
  isLoading?: boolean;
}

export const InvoiceHistoryCard = React.memo(function InvoiceHistoryCard({
  history = [],
  isLoading = false,
}: InvoiceHistoryCardProps) {
  const columns = React.useMemo<ColumnDef<HistoryItem>[]>(
    () => [
      {
        accessorKey: "createdOn",
        header: "Created on",
      },
      {
        accessorKey: "message",
        header: "Message",
      },
    ],
    []
  );

  return (
    <SectionCard
      title="History"
      isLoading={isLoading}
      className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
    >
      <div className="px-4 pb-2">
        <CustomTable
          data={history}
          columns={columns}
          isLoading={isLoading}
          size="compact"
          variant="default"
          enableSearch={false}
          enableFilter={false}
          enablePrint={false}
          enableExport={false}
          enableSorting={false}
          hideRecordCount={true}
          customEmptyState="No history available"
        />
      </div>
    </SectionCard>
  );
});


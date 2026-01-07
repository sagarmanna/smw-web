"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { LoadingAnimation } from "@/components/LoadingAnimation";

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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">History</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CustomTable
          data={history}
          columns={columns}
          size="compact"
          variant="striped"
          enableSorting={true}
          enableExport={false}
          enablePrint={false}
          enableSearch={false}
          enableFilter={false}
          className="border-0 w-full"
          isLoading={isLoading}
          customLoadingState={
            <LoadingAnimation 
              size="md" 
              text="Loading history..." 
              className="py-8"
            />
          }
          customEmptyState={
            !isLoading && history.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
                <div className="text-4xl">📋</div>
                <span className="text-sm font-medium">No history found</span>
              </div>
            ) : undefined
          }
        />
      </CardContent>
    </Card>
  );
});

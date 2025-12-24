"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { EnrolmentHistory } from "../../types";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface EnrolmentHistoryCardProps {
  history: EnrolmentHistory[];
  isLoading?: boolean;
}

export const EnrolmentHistoryCard = React.memo(function EnrolmentHistoryCard({
  history,
  isLoading = false,
}: EnrolmentHistoryCardProps) {
  const columns = React.useMemo<ColumnDef<EnrolmentHistory>[]>(() => [
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const item = row.original as EnrolmentHistory;
        const created = item.createdOn ? `On ${item.createdOn}, ` : "";
        // The API may include HTML links inside `message`; render safely and ensure links open in a new tab
        const combined = `${created}${item.message}`;
        let styled = combined.replace(
          /<a\b([^>]*)>/g,
          (_match, attrs: string) => {
            let newAttrs = attrs || "";
            if (!/target=/.test(newAttrs)) {
              newAttrs += ' target="_blank" rel="noopener noreferrer"';
            }
            const linkClasses = "text-blue-600 hover:text-blue-800 font-medium";
            if (/class=/.test(newAttrs)) {
              newAttrs = newAttrs.replace(
                /class=\"([^\"]*)\"/,
                (_m, cls: string) => `class=\"${cls} ${linkClasses}\"`
              );
            } else {
              newAttrs += ` class=\"${linkClasses}\"`;
            }
            return `<a${newAttrs}>`;
          }
        );
        // Make placeholders like {{enrolmentName}} clickable
        styled = styled.replace(/\{\{([^}]+)\}\}/g, (_m, name: string) => {
          const safeName = name.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<a href="#" data-enrolment-name="${safeName}" class=\"text-blue-600 hover:text-blue-800 font-medium underline\">${safeName}</a>`;
        });
        return (
          <div className="text-sm" dangerouslySetInnerHTML={{ __html: styled }} />
        );
      },
    },
  ], []);

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


"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTable } from "@/components/CustomTable";
import { ColumnDef } from "@tanstack/react-table";
import { PrivateLessonPayment } from "../../types";
import { LoadingAnimation } from "@/components/LoadingAnimation";

interface PrivateLessonPaymentsCardProps {
  payments: PrivateLessonPayment[];
  isLoading?: boolean;
}

export const PrivateLessonPaymentsCard = React.memo(function PrivateLessonPaymentsCard({
  payments,
  isLoading = false,
}: PrivateLessonPaymentsCardProps) {
  const columns = React.useMemo<ColumnDef<PrivateLessonPayment>[]>(() => [
    {
      accessorKey: "date",
      header: "Date",
    },
    {
      accessorKey: "paymentMethod",
      header: "Payment Method",
    },
    {
      accessorKey: "number",
      header: "Number",
    },
    {
      accessorKey: "amount",
      header: "Amount",
    },
  ], []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">
          Payments
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <CustomTable
          data={payments}
          columns={columns}
          size="compact"
          variant="striped"
          enableSorting={false}
          enableExport={false}
          enablePrint={false}
          enableSearch={false}
          enableFilter={false}
          className="border-0 w-full"
          isLoading={isLoading}
          customLoadingState={
            <div role="status" aria-label="Loading payments data">
              <LoadingAnimation 
                size="md" 
                text="Loading payments..." 
                className="py-8"
              />
            </div>
          }
          customEmptyState={
            !isLoading && payments.length === 0 ? (
              <div 
                className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8"
                role="status"
                aria-label="No payments found"
              >
                <div className="text-4xl" aria-hidden="true">💳</div>
                <span className="text-sm font-medium">No payments found</span>
              </div>
            ) : undefined
          }
        />
      </CardContent>
    </Card>
  );
});


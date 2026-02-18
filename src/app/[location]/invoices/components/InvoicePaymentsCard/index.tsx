"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { formatCurrency } from "@/utils/formatCurrency";
import type { InvoicePayment } from "../../types";

interface InvoicePaymentsCardProps {
  payments: InvoicePayment[];
  isLoading?: boolean;
}

export const InvoicePaymentsCard = React.memo(function InvoicePaymentsCard({
  payments,
  isLoading = false,
}: InvoicePaymentsCardProps) {
  const columns = React.useMemo<ColumnDef<InvoicePayment>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "ref",
        header: "Ref",
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => formatCurrency(parseFloat((getValue() as string).replace(/[$,]/g, ""))),
      },
    ],
    []
  );

  return (
    <SectionCard
      title="Payments"
      isLoading={isLoading}
      className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
    >
      <div className="px-4 pb-2">
        <CustomTable
          data={payments}
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
          customEmptyState="No payments recorded"
        />
      </div>
    </SectionCard>
  );
});


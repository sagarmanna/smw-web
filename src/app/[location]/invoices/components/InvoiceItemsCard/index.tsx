"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { formatCurrency } from "@/utils/formatCurrency";
import { InvoiceItem } from "../../mockData/invoiceDetailMockData";

interface InvoiceItemsCardProps {
  items: InvoiceItem[];
  isLoading?: boolean;
}

export const InvoiceItemsCard = React.memo(function InvoiceItemsCard({
  items,
  isLoading = false,
}: InvoiceItemsCardProps) {
  const columns = React.useMemo<ColumnDef<InvoiceItem>[]>(
    () => [
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 accent-[hsl(var(--primary))]"
              readOnly
            />
            <span>{row.getValue("description")}</span>
          </div>
        ),
      },
      {
        accessorKey: "qty",
        header: "Qty",
        cell: ({ getValue }) => {
          const value = getValue() as number;
          return value.toFixed(1);
        },
      },
      {
        accessorKey: "price",
        header: "Price",
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
    ],
    []
  );

  return (
    <SectionCard
      title="Items"
      isLoading={isLoading}
      className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
    >
      <div className="px-4 pb-2">
        <CustomTable
          data={items}
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
        />
      </div>
    </SectionCard>
  );
});


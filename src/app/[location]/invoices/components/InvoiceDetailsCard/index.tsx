"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { InvoiceDetail } from "../../mockData/invoiceDetailMockData";

interface InvoiceDetailsCardProps {
  invoice: InvoiceDetail;
  isLoading?: boolean;
}

export const InvoiceDetailsCard = React.memo(function InvoiceDetailsCard({
  invoice,
  isLoading = false,
}: InvoiceDetailsCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "ID",
        value: invoice.number || "N/A",
      },
      {
        label: "Date",
        value: invoice.date || "N/A",
      },
      {
        label: "Status",
        value: invoice.status || "N/A",
      },
    ];
  }, [invoice]);

  return (
    <SectionCard
      title="Details"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
      headerActions={
        <>
          <EditButton onClick={() => {}} />
        </>
      }
    />
  );
});


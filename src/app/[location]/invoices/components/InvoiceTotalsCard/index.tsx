"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { formatCurrency } from "@/utils/formatCurrency";

interface InvoiceTotalsCardProps {
  totals: {
    discounts: number;
    subtotal: number;
    tax: number;
    total: number;
    paid: number;
    balance: number;
  };
  isLoading?: boolean;
}

export const InvoiceTotalsCard = React.memo(function InvoiceTotalsCard({
  totals,
  isLoading = false,
}: InvoiceTotalsCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Discounts",
        value: formatCurrency(totals.discounts),
      },
      {
        label: "SubTotal",
        value: formatCurrency(totals.subtotal),
      },
      {
        label: "Tax",
        value: formatCurrency(totals.tax),
      },
      {
        label: "Total",
        value: (
          <span className="font-bold">{formatCurrency(totals.total)}</span>
        ),
      },
      {
        label: "Paid",
        value: formatCurrency(totals.paid),
      },
      {
        label: "Balance",
        value: (
          <span className="font-bold">{formatCurrency(totals.balance)}</span>
        ),
      },
    ];
  }, [totals]);

  return (
    <SectionCard
      title="Totals"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});


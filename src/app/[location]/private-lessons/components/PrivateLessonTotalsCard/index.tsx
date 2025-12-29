"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";

interface PrivateLessonTotalsCardProps {
  details: PrivateLessonDetails | null;
  isLoading?: boolean;
}

export const PrivateLessonTotalsCard = React.memo(function PrivateLessonTotalsCard({
  details,
  isLoading = false,
}: PrivateLessonTotalsCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Lesson Rate/hr",
        value: details?.totals.lessonRatePerHour || "N/A",
      },
      {
        label: "Qty",
        value: details?.totals.qty || "N/A",
      },
      {
        label: "Lesson Price",
        value: details?.totals.lessonPrice || "N/A",
      },
      {
        label: "Discount",
        value: details?.totals.discount || "N/A",
      },
      {
        label: "SubTotal",
        value: details?.totals.subTotal || "N/A",
      },
      {
        label: "Tax",
        value: details?.totals.tax || "N/A",
      },
      {
        label: "Total",
        value: details?.totals.total || "N/A",
      },
      {
        label: "Paid",
        value: details?.totals.paid || "N/A",
      },
      {
        label: "Balance",
        value: details?.totals.balance || "N/A",
      },
    ];
  }, [details]);

  return (
    <SectionCard
      title="Totals"
      data={detailRows}
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
    />
  );
});


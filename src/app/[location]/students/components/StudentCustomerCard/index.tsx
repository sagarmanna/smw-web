"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";

interface StudentCustomerCardProps {
  customer: string;
  phone: string;
  isLoading?: boolean;
}

export const StudentCustomerCard = React.memo(function StudentCustomerCard({
  customer,
  phone,
  isLoading = false,
}: StudentCustomerCardProps) {
  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Customer",
        value: customer || "N/A",
      },
      {
        label: "Phone",
        value: phone || "N/A",
      },
    ];
  }, [customer, phone]);

  return (
    <SectionCard
      title="Customer"
      data={detailRows}
      isLoading={isLoading}
    />
  );
});


"use client";

import * as React from "react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";

interface StudentCustomerCardProps {
  customer: string;
  phone: string;
  customerId?: number;
  location: string;
  isLoading?: boolean;
}

export const StudentCustomerCard = React.memo(function StudentCustomerCard({
  customer,
  phone,
  customerId,
  location,
  isLoading = false,
}: StudentCustomerCardProps) {
  const handleCustomerClick = React.useCallback(() => {
    if (customerId) {
      // Redirect to customer view page with the customer ID (same pattern as enrolment)
      const legacyBase = process.env.NEXT_PUBLIC_LEGACY_URL || "";
      const url = `${legacyBase}/${location}/customer/view?id=${customerId}`;
      // Navigate directly in the same window to avoid blank page issue
      window.location.href = url;
    }
  }, [customerId, location]);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    // Make customer name clickable if customerId is available
    const customerValue = customerId ? (
      <span
        onClick={handleCustomerClick}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
      >
        {customer || "N/A"}
      </span>
    ) : (
      customer || "N/A"
    );

    return [
      {
        label: "Customer",
        value: customerValue,
      },
      {
        label: "Phone",
        value: phone || "N/A",
      },
    ];
  }, [customer, phone, customerId, handleCustomerClick]);

  return (
    <SectionCard
      title="Customer"
      data={detailRows}
      isLoading={isLoading}
    />
  );
});


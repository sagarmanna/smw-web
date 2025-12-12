"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  const handleCustomerClick = React.useCallback(() => {
    if (customerId) {
      // Navigate to customer view page using Next.js router (client-side navigation)
      router.push(`/${location}/customers/${customerId}`);
    }
  }, [customerId, location, router]);

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


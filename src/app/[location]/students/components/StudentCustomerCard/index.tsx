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
      isLoading={isLoading}
      className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2"
    >
      <div className="flex justify-center">
        <dl className="text-sm">
          {detailRows.map((item) => (
            <div
              key={item.label}
              className="flex items-center py-1 mb-1 last:mb-0"
            >
              <dt className="text-sm font-semibold text-foreground min-w-[120px] text-right pr-6">
                {item.label}
              </dt>
              <dd className="text-sm text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </SectionCard>
  );
});

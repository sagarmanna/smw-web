"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";

interface InvoiceCustomerCardProps {
  customer: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
  };
  location: string;
  isLoading?: boolean;
}

export const InvoiceCustomerCard = React.memo(function InvoiceCustomerCard({
  customer,
  location,
  isLoading = false,
}: InvoiceCustomerCardProps) {
  const router = useRouter();

  const handleCustomerClick = React.useCallback(() => {
    if (customer.customerId) {
      router.push(`/${location}/customers/${customer.customerId}`);
    }
  }, [customer.customerId, location, router]);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const customerValue = customer.customerId ? (
      <span
        onClick={handleCustomerClick}
        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
      >
        {customer.name || "N/A"}
      </span>
    ) : (
      customer.name || "N/A"
    );

    return [
      {
        label: "Name",
        value: customerValue,
      },
      {
        label: "Phone",
        value: customer.phone || "N/A",
      },
      {
        label: "Email",
        value: customer.email || "N/A",
      },
    ];
  }, [customer, handleCustomerClick]);

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


"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChooseCustomerModal } from "../ChooseCustomerModal";

interface InvoiceCustomerCardProps {
  customer: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
  };
  location: string;
  isLoading?: boolean;
  onCustomerChange?: (customer: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
  }) => void;
}

export const InvoiceCustomerCard = React.memo(function InvoiceCustomerCard({
  customer,
  location,
  isLoading = false,
  onCustomerChange,
}: InvoiceCustomerCardProps) {
  const router = useRouter();
  const [isChooseCustomerModalOpen, setIsChooseCustomerModalOpen] = React.useState(false);

  const handleCustomerClick = React.useCallback(() => {
    if (customer.customerId) {
      router.push(`/${location}/customers/${customer.customerId}`);
    }
  }, [customer.customerId, location, router]);

  const handleCustomerKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLSpanElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (customer.customerId) {
          handleCustomerClick();
        }
      }
    },
    [customer.customerId, handleCustomerClick]
  );

  const handleCustomerSelect = React.useCallback(
    (selectedCustomer: {
      firstName: string;
      lastName: string;
      email: string;
      students: string;
      customerId?: number;
      phone?: string;
    }) => {
      if (onCustomerChange) {
        const fullName = `${selectedCustomer.firstName} ${selectedCustomer.lastName}`.trim();
        onCustomerChange({
          name: fullName || selectedCustomer.firstName || selectedCustomer.lastName,
          phone: selectedCustomer.phone || "",
          email: selectedCustomer.email || "",
          customerId: selectedCustomer.customerId,
        });
      }
    },
    [onCustomerChange]
  );

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    // Always style customer name as clickable link (blue) for better UX
    const isClickable = !!customer.customerId;
    const customerName = customer.name || "N/A";
    
    const customerValue = (
      <span
        onClick={isClickable ? handleCustomerClick : undefined}
        onKeyDown={isClickable ? handleCustomerKeyDown : undefined}
        role={isClickable ? "link" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        aria-label={isClickable ? `View customer details for ${customerName}` : undefined}
        className={`${
          isClickable
            ? "text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            : "text-blue-600 cursor-default"
        }`}
      >
        {customerName}
      </span>
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
  }, [customer, handleCustomerClick, handleCustomerKeyDown]);

  return (
    <>
      <SectionCard
        title="Customer"
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2"
        headerActions={
          onCustomerChange ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsChooseCustomerModalOpen(true)}>
                  Change Customer...
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined
        }
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

      {onCustomerChange && (
        <ChooseCustomerModal
          open={isChooseCustomerModalOpen}
          onClose={() => setIsChooseCustomerModalOpen(false)}
          onSelect={handleCustomerSelect}
          currentCustomerId={customer.customerId}
        />
      )}
    </>
  );
});


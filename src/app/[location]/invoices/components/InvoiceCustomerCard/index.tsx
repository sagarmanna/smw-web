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
import { toast } from "sonner";
import { createInvoiceWalkIn, updateInvoiceWalkIn } from "../../[id]/invoices-details.api";
import { ChooseCustomerModal } from "../modals/ChooseCustomerModal";
import {
  AddWalkInModal,
  type WalkInFormData,
  type WalkInInitialData,
} from "../modals/AddWalkInModal";

interface InvoiceCustomerCardProps {
  customer: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
    type?: 1 | 2;
  };
  location: string;
  invoiceId: number;
  isLoading?: boolean;
  onCustomerChange?: (customer: {
    name: string;
    phone: string;
    email: string;
    customerId?: number;
    type?: 1 | 2;
  }) => void;
}

export const InvoiceCustomerCard = React.memo(function InvoiceCustomerCard({
  customer,
  location,
  invoiceId,
  isLoading = false,
  onCustomerChange,
}: InvoiceCustomerCardProps) {
  const router = useRouter();
  const [isChooseCustomerModalOpen, setIsChooseCustomerModalOpen] = React.useState(false);
  const [isWalkInModalOpen, setIsWalkInModalOpen] = React.useState(false);
  const [isSavingWalkIn, setIsSavingWalkIn] = React.useState(false);
  const [walkInMode, setWalkInMode] = React.useState<"add" | "edit">("add");
  const [walkInModalTitle, setWalkInModalTitle] = React.useState("Add Walkin");
  const [walkInInitialData, setWalkInInitialData] = React.useState<WalkInInitialData | undefined>(undefined);

  const hasCustomer = React.useMemo(() => {
    return Boolean(
      customer.customerId ||
      customer.name?.trim() ||
      customer.phone?.trim() ||
      customer.email?.trim()
    );
  }, [customer.customerId, customer.name, customer.phone, customer.email]);

  const customerType = Number(customer.type);
  const isWalkInCustomer = customerType === 2;
  const isRegularCustomer = customerType === 1;

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
          type: 1,
        });
      }
    },
    [onCustomerChange]
  );

  const handleAddWalkInWithName = React.useCallback(() => {
    setWalkInMode("add");
    setWalkInModalTitle("Add Walkin");
    setWalkInInitialData(undefined);
    setIsWalkInModalOpen(true);
  }, []);

  const handleEditWalkIn = React.useCallback(() => {
    const nameParts = (customer.name || "").trim().split(/\s+/).filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ");

    setWalkInMode("edit");
    setWalkInModalTitle("Edit Walk-in");
    setWalkInInitialData({
      firstName,
      lastName,
      email: customer.email || "",
    });
    setIsWalkInModalOpen(true);
  }, [customer.name, customer.email]);

  const handleWalkInSave = React.useCallback(async (data: WalkInFormData) => {
    setIsSavingWalkIn(true);

    try {
      const isEditWalkIn = walkInMode === "edit";
      const walkInPayload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
      };

      const result = isEditWalkIn
        ? await updateInvoiceWalkIn(location, invoiceId, walkInPayload)
        : await createInvoiceWalkIn(location, invoiceId, walkInPayload);

      if (!result?.success) {
        return {
          ok: false,
          message: result?.message || (isEditWalkIn ? "Failed to update walk-in customer" : "Failed to add walk-in customer"),
        };
      }

      if (onCustomerChange) {
        const fullName = `${data.firstName} ${data.lastName}`.trim();
        onCustomerChange({
          name: result.data?.customerName || fullName,
          phone: "",
          email: result.data?.email || data.email,
          customerId: result.data?.body?.customerId ?? result.data?.customerId,
          type: 2,
        });
      }

      toast.success(result.message || (isEditWalkIn ? "Walk-in customer updated" : "Walk-in customer added"));
      return { ok: true };
    } catch (error) {
      return {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to save walk-in customer",
      };
    } finally {
      setIsSavingWalkIn(false);
    }
  }, [
    invoiceId,
    location,
    onCustomerChange,
    walkInMode,
  ]);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
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

    if (!hasCustomer) {
      return [];
    }

    const hasPhone = Boolean(customer.phone?.trim());
    const hasEmail = Boolean(customer.email?.trim());
    const buildRows = (options: { includePhone: boolean; includeEmail: boolean }): SectionCardDataRow[] => {
      const rows: SectionCardDataRow[] = [
        {
          label: "Name",
          value: customerValue,
        },
      ];

      if (options.includePhone && hasPhone) {
        rows.push({
          label: "Phone",
          value: customer.phone,
        });
      }

      if (options.includeEmail && hasEmail) {
        rows.push({
          label: "Email",
          value: customer.email,
        });
      }

      return rows;
    };

    if (isRegularCustomer) {
      return buildRows({ includePhone: true, includeEmail: true });
    }

    return buildRows({ includePhone: false, includeEmail: true });
  }, [customer, hasCustomer, isRegularCustomer, handleCustomerClick, handleCustomerKeyDown]);

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
                {!hasCustomer ? (
                  <>
                    <DropdownMenuItem onClick={() => setIsChooseCustomerModalOpen(true)}>
                      Add Existing Customer...
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddWalkInWithName}>
                      Add Walk-in With Name...
                    </DropdownMenuItem>
                  </>
                ) : isWalkInCustomer ? (
                  <DropdownMenuItem onClick={handleEditWalkIn}>
                    Edit Walk-in...
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => setIsChooseCustomerModalOpen(true)}>
                    Change Customer...
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : undefined
        }
      >
        <div className="flex justify-center min-h-[64px]">
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
          location={location}
          open={isChooseCustomerModalOpen}
          onClose={() => setIsChooseCustomerModalOpen(false)}
          onSelect={handleCustomerSelect}
          currentCustomerId={customer.customerId}
        />
      )}

      <AddWalkInModal
        open={isWalkInModalOpen}
        onOpenChange={(open) => {
          setIsWalkInModalOpen(open);
          if (!open) {
            setWalkInInitialData(undefined);
            setWalkInModalTitle("Add Walkin");
            setWalkInMode("add");
          }
        }}
        isSaving={isSavingWalkIn}
        title={walkInModalTitle}
        initialData={walkInInitialData}
        onSave={handleWalkInSave}
      />
    </>
  );
});


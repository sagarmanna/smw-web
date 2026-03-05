"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { PrivateLessonDetails } from "../../types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditDiscountModal } from "../modals/EditDiscountModal";
import { EditPriceModal } from "../modals/EditPriceModal";
import { EditTaxModal } from "../modals/EditTaxModal";

interface PrivateLessonTotalsCardProps {
  location: string;
  details: PrivateLessonDetails | null;
  onSaveDiscount: (discountFields: {
    customerDiscount: number;
    paymentFrequencyDiscount: number;
    multiEnrolmentDiscount: number;
    lineItemDiscount: number;
    lineItemDiscountValueType: number;
  }) => Promise<boolean>;
  onSaveTax: (tax: string) => Promise<boolean>;
  onSavePrice: (lessonRatePerHour: string) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export const PrivateLessonTotalsCard = React.memo(function PrivateLessonTotalsCard({
  location,
  details,
  onSaveDiscount,
  onSavePrice,
  onSaveTax,
  savingDetails = false,
  isLoading = false,
}: PrivateLessonTotalsCardProps) {
  const router = useRouter();
  const [isDiscountModalOpen, setIsDiscountModalOpen] = React.useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = React.useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = React.useState(false);

  const handleInvoiceClick = React.useCallback(() => {
    const invoiceId = details?.totals?.invoiceId;
    if (typeof invoiceId === "number") {
      router.push(`/${location}/invoices/${invoiceId}`);
    }
  }, [details?.totals?.invoiceId, location, router]);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    const rows: SectionCardDataRow[] = [
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

    const status = details?.status?.toLowerCase() || "";
    const isAbsentOrCompleted =
      status.includes("absent") || status.includes("completed");
    if (isAbsentOrCompleted) {
      const invoiceLabel =
        (details?.totals?.invoiceNumber && details.totals.invoiceNumber.trim() !== "")
          ? details.totals.invoiceNumber
          : (typeof details?.totals?.invoiceId === "number" ? String(details.totals.invoiceId) : "N/A");

      const invoiceValue =
        typeof details?.totals.invoiceId === "number" ? (
          <span
            onClick={handleInvoiceClick}
            className="text-blue-600 hover:text-blue-800 hover:underline transition-colors cursor-pointer"
          >
            {invoiceLabel}
          </span>
        ) : (
          invoiceLabel
        );

      rows.push({
        label: "Invoice",
        value: invoiceValue,
      });

      rows.push({
        label: "Owing",
        value:
          (details?.totals?.invoiceOwing && details.totals.invoiceOwing.trim() !== "")
            ? details.totals.invoiceOwing
            : (details?.totals?.balance || "N/A"),
      });
    }

    return rows;
  }, [details, handleInvoiceClick]);

  const handleEditDiscountClick = React.useCallback(() => {
    setIsDiscountModalOpen(true);
  }, []);

  const handleEditTaxClick = React.useCallback(() => {
    setIsTaxModalOpen(true);
  }, []);

  const handleEditPriceClick = React.useCallback(() => {
    setIsPriceModalOpen(true);
  }, []);

  const handleDiscountClose = React.useCallback(() => {
    setIsDiscountModalOpen(false);
  }, []);

  const handlePriceClose = React.useCallback(() => {
    setIsPriceModalOpen(false);
  }, []);

  const handleTaxClose = React.useCallback(() => {
    setIsTaxModalOpen(false);
  }, []);

  const handleDiscountSubmit = React.useCallback(
    async (discountFields: {
      customerDiscount: number;
      paymentFrequencyDiscount: number;
      multiEnrolmentDiscount: number;
      lineItemDiscount: number;
      lineItemDiscountValueType: number;
    }): Promise<boolean> => {
      return await onSaveDiscount(discountFields);
    },
    [onSaveDiscount]
  );

  const handlePriceSubmit = React.useCallback(
    async (rate: string): Promise<boolean> => {
      return await onSavePrice(rate);
    },
    [onSavePrice]
  );

  const handleTaxSubmit = React.useCallback(
    async (tax: string): Promise<boolean> => {
      return await onSaveTax(tax);
    },
    [onSaveTax]
  );

  return (
    <>
      <SectionCard
        title="Totals"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditDiscountClick}>
                Edit Discount...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditTaxClick}>
                Edit Tax...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleEditPriceClick}>
                Edit Price...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <EditDiscountModal
        open={isDiscountModalOpen}
        onClose={handleDiscountClose}
        location={location}
        lessonId={details?.id ?? null}
        onSubmit={handleDiscountSubmit}
        saving={savingDetails}
      />
      <EditPriceModal
        open={isPriceModalOpen}
        onClose={handlePriceClose}
        lessonRatePerHour={details?.totals.lessonRatePerHour || ""}
        onSubmit={handlePriceSubmit}
        saving={savingDetails}
      />
      <EditTaxModal
        open={isTaxModalOpen}
        onClose={handleTaxClose}
        tax={details?.totals.tax || ""}
        onSubmit={handleTaxSubmit}
        saving={savingDetails}
      />
    </>
  );
});


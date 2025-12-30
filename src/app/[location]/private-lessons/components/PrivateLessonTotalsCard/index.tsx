"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
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

interface PrivateLessonTotalsCardProps {
  details: PrivateLessonDetails | null;
  onSaveDiscount: (discount: string) => Promise<boolean>;
  onSavePrice: (lessonRatePerHour: string) => Promise<boolean>;
  savingDetails?: boolean;
  isLoading?: boolean;
}

export const PrivateLessonTotalsCard = React.memo(function PrivateLessonTotalsCard({
  details,
  onSaveDiscount,
  onSavePrice,
  savingDetails = false,
  isLoading = false,
}: PrivateLessonTotalsCardProps) {
  const [isDiscountModalOpen, setIsDiscountModalOpen] = React.useState(false);
  const [isPriceModalOpen, setIsPriceModalOpen] = React.useState(false);

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

  const handleEditDiscountClick = React.useCallback(() => {
    setIsDiscountModalOpen(true);
  }, []);

  const handleEditTaxClick = React.useCallback(() => {
    toast.info("This feature is under process");
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

  const handleDiscountSubmit = React.useCallback(
    async (discount: string): Promise<boolean> => {
      return await onSaveDiscount(discount);
    },
    [onSaveDiscount]
  );

  const handlePriceSubmit = React.useCallback(
    async (rate: string): Promise<boolean> => {
      return await onSavePrice(rate);
    },
    [onSavePrice]
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
        discount={details?.totals.discount || ""}
        lessonPrice={details?.totals.lessonPrice || "$0.00"}
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
    </>
  );
});


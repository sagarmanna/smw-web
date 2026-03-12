"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  SectionCard,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdjustTaxModal, TaxAdjustmentData } from "../modals/AdjustTaxModal";

interface InvoiceTotalsCardProps {
  totals: {
    discounts: number;
    subtotal: number;
    tax: number;
    total: number;
    paid: number;
    balance: number;
  };
  isLoading?: boolean;
  isVoided?: boolean;
  hasNoCustomer?: boolean;
  onAdjustTax?: (adjustmentData: TaxAdjustmentData) => void;
}

export const InvoiceTotalsCard = React.memo(function InvoiceTotalsCard({
  totals,
  isLoading = false,
  isVoided = false,
  hasNoCustomer = false,
  onAdjustTax,
}: InvoiceTotalsCardProps) {
  const [isAdjustTaxModalOpen, setIsAdjustTaxModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "Discounts",
        value: formatCurrency(totals.discounts),
      },
      {
        label: "SubTotal",
        value: formatCurrency(totals.subtotal),
      },
      {
        label: "Tax",
        value: formatCurrency(totals.tax),
      },
      {
        label: "Total",
        value: (
          <span className="font-bold">{formatCurrency(totals.total)}</span>
        ),
      },
      {
        label: "Paid",
        value: formatCurrency(totals.paid),
      },
      {
        label: "Balance",
        value: (
          <span className="font-bold">{formatCurrency(totals.balance)}</span>
        ),
      },
    ];
  }, [totals]);

  const handleOpenAdjustTaxModal = React.useCallback(() => {
    if (isVoided || hasNoCustomer) return;
    setIsAdjustTaxModalOpen(true);
  }, [isVoided, hasNoCustomer]);

  const handleSaveTaxAdjustment = React.useCallback(
    (adjustmentData: TaxAdjustmentData) => {
      if (onAdjustTax) {
        onAdjustTax(adjustmentData);
      }
      setIsAdjustTaxModalOpen(false);
    },
    [onAdjustTax]
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
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={handleOpenAdjustTaxModal}
                disabled={isVoided || hasNoCustomer}
              >
                Adjust Tax...
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <AdjustTaxModal
        open={isAdjustTaxModalOpen}
        onClose={() => setIsAdjustTaxModalOpen(false)}
        onSave={onAdjustTax ? handleSaveTaxAdjustment : undefined}
        currentTax={totals.tax}
      />
    </>
  );
});


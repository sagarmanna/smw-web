"use client";

import * as React from "react";
import {
  SectionCard,
  EditButton,
} from "@/components/SectionCard";
import { SectionCardDataRow } from "@/components/SectionCard/types";
import { InvoiceDetail } from "../../mockData/invoiceDetailMockData";
import { EditInvoiceDetailsModal } from "../modals/EditInvoiceDetailsModal";

interface InvoiceDetailsCardProps {
  invoice: InvoiceDetail;
  isLoading?: boolean;
  onSaveDetails?: (invoice: Partial<InvoiceDetail>) => Promise<boolean>;
  savingDetails?: boolean;
}

export const InvoiceDetailsCard = React.memo(function InvoiceDetailsCard({
  invoice,
  isLoading = false,
  onSaveDetails,
  savingDetails = false,
}: InvoiceDetailsCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const detailRows = React.useMemo<SectionCardDataRow[]>(() => {
    return [
      {
        label: "ID",
        value: invoice.number || "N/A",
      },
      {
        label: "Date",
        value: invoice.date || "N/A",
      },
      {
        label: "Status",
        value: invoice.status || "N/A",
      },
    ];
  }, [invoice]);

  const handleSave = React.useCallback(
    async (data: Partial<InvoiceDetail>): Promise<boolean> => {
      if (!onSaveDetails) return false;
      
      const success = await onSaveDetails(data);
      
      if (success) {
        setIsEditModalOpen(false);
      }
      
      return success;
    },
    [onSaveDetails]
  );

  return (
    <>
      <SectionCard
        title="Details"
        data={detailRows}
        isLoading={isLoading}
        className="self-start h-fit [&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1 [&>div:last-child]:px-4 [&>div:last-child]:py-1 [&>div:last-child]:pt-0 [&>div:last-child]:pb-2 [&>div:last-child>div>dl>div]:py-1 [&>div:last-child>div>dl>div]:mb-1"
        headerActions={
          <>
            <EditButton onClick={() => setIsEditModalOpen(true)} />
          </>
        }
      />

      <EditInvoiceDetailsModal
        open={isEditModalOpen && !!onSaveDetails}
        onClose={() => setIsEditModalOpen(false)}
        invoice={invoice}
        onSubmit={handleSave}
        saving={savingDetails}
      />
    </>
  );
});


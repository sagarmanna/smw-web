"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { SectionCard } from "@/components/SectionCard";
import { CustomTable } from "@/components/CustomTable";
import { PaymentReceiptModalContainer } from "@/components/modal/PaymentReceiptModal";
import { formatCurrency } from "@/utils/formatCurrency";
import type { InvoicePayment } from "../../types";

interface InvoicePaymentsCardProps {
  location: string;
  customerId?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  payments: InvoicePayment[];
  isLoading?: boolean;
  onPaymentUpdated?: () => Promise<void> | void;
}

export const InvoicePaymentsCard = React.memo(function InvoicePaymentsCard({
  location,
  customerId,
  customerName,
  customerEmail,
  customerPhone,
  payments,
  isLoading = false,
  onPaymentUpdated,
}: InvoicePaymentsCardProps) {
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<number | null>(null);

  const columns = React.useMemo<ColumnDef<InvoicePayment>[]>(
    () => [
      {
        accessorKey: "date",
        header: "Date",
      },
      {
        accessorKey: "type",
        header: "Type",
      },
      {
        accessorKey: "ref",
        header: "Ref",
      },
      {
        accessorKey: "notes",
        header: "Notes",
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }) => formatCurrency(parseFloat((getValue() as string).replace(/[$,]/g, ""))),
      },
    ],
    []
  );

  return (
    <>
      <SectionCard
        title="Payments"
        isLoading={isLoading}
        className="[&>div:first-child]:px-4 [&>div:first-child]:py-2 [&>div:first-child]:pb-1"
      >
        <div className="px-4 pb-2">
          <CustomTable
            data={payments}
            columns={columns}
            isLoading={isLoading}
            size="compact"
            variant="default"
            enableSearch={false}
            enableFilter={false}
            enablePrint={false}
            enableExport={false}
            enableSorting={false}
            hideRecordCount={true}
            customEmptyState="No payments recorded"
            onRowClick={(row) => {
              setSelectedPaymentId(row.id);
              setIsReceiptModalOpen(true);
            }}
          />
        </div>
      </SectionCard>

      {selectedPaymentId !== null && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={(open) => {
            setIsReceiptModalOpen(open);
            if (!open) {
              setSelectedPaymentId(null);
            }
          }}
          location={location}
          customerId={customerId}
          paymentId={selectedPaymentId}
          customerName={customerName}
          customerEmail={customerEmail}
          customerPhone={customerPhone}
          onEdit={onPaymentUpdated}
          onDelete={onPaymentUpdated}
        />
      )}
    </>
  );
});


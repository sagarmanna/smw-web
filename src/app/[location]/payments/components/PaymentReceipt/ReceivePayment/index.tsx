"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { formatCurrency } from "@/utils/formatCurrency";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface PaymentRow {
  id: string;
  number: string;
  date: Date;
  customer: string;
  paymentMethod: string;
  notes?: string | null;
  reference?: string | null;
  amount: number;
}

interface PaymentsReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row?: PaymentRow;
  locationName: string;
}

/**
 * Modal to display payment receipt details
 */
export function PaymentsReceiptModal({
  open,
  onOpenChange,
  row,
  locationName,
}: PaymentsReceiptModalProps) {
  const handlePrint = () => {
    window.print();
  };

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Receipt - {row.number}</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="print:hidden"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="print:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Header Section */}
          <div className="text-center border-b pb-4">
            <h2 className="text-2xl font-bold">{locationName}</h2>
            <p className="text-lg font-semibold mt-2">Payment Receipt</p>
          </div>

          {/* Payment Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Payment Number</p>
              <p className="font-semibold">{row.number}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-semibold">{format(row.date, "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Customer</p>
              <p className="font-semibold">{row.customer}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-semibold">{row.paymentMethod}</p>
            </div>
            {row.reference && (
              <div>
                <p className="text-sm text-muted-foreground">Reference</p>
                <p className="font-semibold">{row.reference}</p>
              </div>
            )}
            {row.notes && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Notes</p>
                <p className="font-semibold">{row.notes}</p>
              </div>
            )}
          </div>

          {/* Amount Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
              <span className="text-lg font-semibold">Amount Paid</span>
              <span className={`text-2xl font-bold ${row.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                {formatCurrency(row.amount)}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-4">
            <p>Thank you for your payment!</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Remove re-export to avoid circular dependency
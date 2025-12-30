"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditDiscountModalProps {
  open: boolean;
  onClose: () => void;
  discount: string;
  lessonPrice: string;
  onSubmit: (discount: string) => Promise<boolean>;
  saving?: boolean;
}

export function EditDiscountModal({
  open,
  onClose,
  discount,
  lessonPrice,
  onSubmit,
  saving = false,
}: EditDiscountModalProps) {
  const [paymentFrequencyDiscount, setPaymentFrequencyDiscount] = React.useState<string>("");
  const [customerDiscount, setCustomerDiscount] = React.useState<string>("");
  const [multipleEnrollmentDiscount, setMultipleEnrollmentDiscount] = React.useState<string>("");
  const [lineItemDiscountType, setLineItemDiscountType] = React.useState<"$" | "%">("$");
  const [lineItemDiscount, setLineItemDiscount] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");

  // Initialize values when modal opens
  React.useEffect(() => {
    if (open) {
      // Parse discount value if needed (for now, just set defaults)
      setPaymentFrequencyDiscount("10");
      setCustomerDiscount("0");
      setMultipleEnrollmentDiscount("1.25");
      setLineItemDiscountType("$");
      setLineItemDiscount("0");
      setError("");
    }
  }, [open, discount]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Calculate total discount amount from all fields
    const basePrice = parseFloat(lessonPrice?.replace("$", "") || "0") || 0;
    if (basePrice === 0) {
      setError("Lesson price is required to calculate discount");
      return;
    }

    let discountedPrice = basePrice;
    let totalDiscount = 0;

    // Apply Payment Frequency Discount (percentage)
    const pfDiscount = parseFloat(paymentFrequencyDiscount) || 0;
    if (pfDiscount > 0) {
      const discountAmount = discountedPrice * (pfDiscount / 100);
      discountedPrice = discountedPrice - discountAmount;
      totalDiscount += discountAmount;
    }

    // Apply Customer Discount (percentage)
    const custDiscount = parseFloat(customerDiscount) || 0;
    if (custDiscount > 0) {
      const discountAmount = discountedPrice * (custDiscount / 100);
      discountedPrice = discountedPrice - discountAmount;
      totalDiscount += discountAmount;
    }

    // Apply Multiple Enrollment Discount (fixed $)
    const multiEnrollDiscount = parseFloat(multipleEnrollmentDiscount) || 0;
    if (multiEnrollDiscount > 0) {
      discountedPrice = discountedPrice - multiEnrollDiscount;
      totalDiscount += multiEnrollDiscount;
    }

    // Apply Line Item Discount (fixed $ or percentage)
    const lineItemValue = parseFloat(lineItemDiscount) || 0;
    if (lineItemValue > 0) {
      if (lineItemDiscountType === "$") {
        discountedPrice = discountedPrice - lineItemValue;
        totalDiscount += lineItemValue;
      } else {
        // percentage
        const discountAmount = discountedPrice * (lineItemValue / 100);
        discountedPrice = discountedPrice - discountAmount;
        totalDiscount += discountAmount;
      }
    }

    // Format discount as dollar amount
    const formattedDiscount = `$${totalDiscount.toFixed(2)}`;

    const success = await onSubmit(formattedDiscount);
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Discount</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Warning: You have entered a non-approved Arcadia discount. All non-approved discounts must be submitted in writing and approved by Head Office prior to entering a discount, otherwise you are in breach of your agreement.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="payment-frequency-discount" className="font-semibold">
              Payment Frequency Discount
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="payment-frequency-discount"
                type="number"
                value={paymentFrequencyDiscount}
                onChange={(e) => setPaymentFrequencyDiscount(e.target.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-discount" className="font-semibold">
              Customer Discount
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="customer-discount"
                type="number"
                value={customerDiscount}
                onChange={(e) => setCustomerDiscount(e.target.value)}
                className="flex-1"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="multiple-enrollment-discount" className="font-semibold">
              Multiple Enrollment Discount
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">$</span>
              <Input
                id="multiple-enrollment-discount"
                type="number"
                step="0.01"
                value={multipleEnrollmentDiscount}
                onChange={(e) => setMultipleEnrollmentDiscount(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="line-item-discount" className="font-semibold">
              Line Item Discount
            </Label>
            <div className="flex items-center gap-2">
              {/* Segmented Control */}
              <div className="flex gap-1 border rounded-md overflow-hidden bg-background">
                <button
                  type="button"
                  onClick={() => setLineItemDiscountType("$")}
                  className={cn(
                    "text-sm px-3 py-1.5 transition-colors",
                    lineItemDiscountType === "$"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  $
                </button>
                <button
                  type="button"
                  onClick={() => setLineItemDiscountType("%")}
                  className={cn(
                    "text-sm px-3 py-1.5 transition-colors",
                    lineItemDiscountType === "%"
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  %
                </button>
              </div>
              <Input
                id="line-item-discount"
                type="number"
                step="0.01"
                value={lineItemDiscount}
                onChange={(e) => setLineItemDiscount(e.target.value)}
                className="flex-1"
              />
              {lineItemDiscountType === "%" && (
                <span className="text-muted-foreground">%</span>
              )}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Close
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


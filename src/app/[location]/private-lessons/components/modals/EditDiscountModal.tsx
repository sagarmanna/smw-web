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
import { getDiscountValues } from "../../actionApi/discount.api";

interface EditDiscountModalProps {
  open: boolean;
  onClose: () => void;
  location: string;
  lessonId: number | null;
  // Accepts the full discount object
  onSubmit: (discountFields: {
    customerDiscount: number;
    paymentFrequencyDiscount: number;
    multiEnrolmentDiscount: number;
    lineItemDiscount: number;
    lineItemDiscountValueType: number;
  }) => Promise<boolean>;
  saving?: boolean;
}

export function EditDiscountModal({
  open,
  onClose,
  location,
  lessonId,
  onSubmit,
  saving = false,
}: EditDiscountModalProps) {
  const [paymentFrequencyDiscount, setPaymentFrequencyDiscount] = React.useState<string>("");
  const [customerDiscount, setCustomerDiscount] = React.useState<string>("");
  const [multipleEnrollmentDiscount, setMultipleEnrollmentDiscount] = React.useState<string>("");
  const [lineItemDiscountType, setLineItemDiscountType] = React.useState<"$" | "%">("$");
  const [lineItemDiscount, setLineItemDiscount] = React.useState<string>("");
  const [error, setError] = React.useState<string>("");
  const [isLoadingDiscount, setIsLoadingDiscount] = React.useState(false);

  const resetToZero = React.useCallback(() => {
    setPaymentFrequencyDiscount("0");
    setCustomerDiscount("0");
    setMultipleEnrollmentDiscount("0");
    setLineItemDiscountType("$");
    setLineItemDiscount("0");
  }, []);

  // Always load latest persisted discount values when modal opens.
  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (!lessonId || Number.isNaN(lessonId)) {
      resetToZero();
      setError("Invalid lesson id.");
      return;
    }

    let isCancelled = false;
    setIsLoadingDiscount(true);
    setError("");

    getDiscountValues(location, [lessonId])
      .then((response) => {
        if (isCancelled) return;
        const body = response.data?.body;
        setPaymentFrequencyDiscount(String(body?.paymentFrequencyDiscount ?? 0));
        setCustomerDiscount(String(body?.customerDiscount ?? 0));
        setMultipleEnrollmentDiscount(String(body?.multiEnrolmentDiscount ?? 0));
        setLineItemDiscount(String(body?.lineItemDiscount ?? 0));
        setLineItemDiscountType(body?.lineItemDiscountValueType === 1 ? "%" : "$");
      })
      .catch((fetchError: unknown) => {
        if (isCancelled) return;
        resetToZero();
        const message =
          fetchError instanceof Error && fetchError.message.trim() !== ""
            ? fetchError.message
            : "Failed to load discount values";
        setError(message);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoadingDiscount(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [open, location, lessonId, resetToZero]);

  React.useEffect(() => {
    if (open) {
      setError("");
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    // Prepare discount fields for API
    const discountFields = {
      customerDiscount: parseFloat(customerDiscount) || 0,
      paymentFrequencyDiscount: parseFloat(paymentFrequencyDiscount) || 0,
      multiEnrolmentDiscount: parseFloat(multipleEnrollmentDiscount) || 0,
      lineItemDiscount: parseFloat(lineItemDiscount) || 0,
      lineItemDiscountValueType: lineItemDiscountType === "$" ? 0 : 1,
    };

    // Optionally validate here (e.g., at least one field is set)

    const success = await onSubmit(discountFields);
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
              disabled={saving || isLoadingDiscount}
            >
              Close
            </Button>
            <Button type="submit" disabled={saving || isLoadingDiscount}>
              {isLoadingDiscount ? "Loading..." : saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


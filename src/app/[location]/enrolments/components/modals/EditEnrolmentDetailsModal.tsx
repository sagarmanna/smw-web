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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EnrolmentDetails, UpdateEnrolmentDetails } from "../../types";

interface EditEnrolmentDetailsModalProps {
  open: boolean;
  onClose: () => void;
  details: EnrolmentDetails | null;
  onSubmit: (details: UpdateEnrolmentDetails) => Promise<boolean>;
  saving?: boolean;
}

export function EditEnrolmentDetailsModal({
  open,
  onClose,
  details,
  onSubmit,
  saving = false,
}: EditEnrolmentDetailsModalProps) {
  const [formData, setFormData] = React.useState<{
    rates: Array<{ amount: string; fromDate: string; toDate: string }>;
    autoRenewal: boolean;
    online: boolean;
  }>({
    rates: [],
    autoRenewal: false,
    online: false,
  });

  React.useEffect(() => {
    if (details) {
      // Handle multiple rates (matches legacy: loops through all courseProgramRates)
      const rates = details.rates && details.rates.length > 0 
        ? details.rates.map(rate => ({
            amount: rate.amount?.replace(/[^0-9.]/g, "") || "",
            fromDate: rate.fromDate || "",
            toDate: rate.toDate || "",
          }))
        : // Fallback to single rate if rates array is empty
          details.rate 
            ? [{
                amount: details.rate.replace(/[^0-9.]/g, "") || "",
                fromDate: details.rateFromDate || "",
                toDate: details.rateToDate || "",
              }]
            : [];
      
      setFormData({
        rates,
        autoRenewal: details.autoRenewal === "Enabled",
        online: details.online || false,
      });
    } else {
      setFormData({
        rates: [],
        autoRenewal: false,
        online: false,
      });
    }
  }, [details, open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    if (!details) return;
    
    // Prepare rates array (matches legacy: CourseProgramRate[$key][programRate])
    // Preserve all rates - use edited value if provided, otherwise use original
    const rates = formData.rates.map((rate, index) => {
      let amount = rate.amount?.trim();
      const originalRate = details.rates?.[index];
      
      // If amount is empty or invalid, ALWAYS fallback to original rate from details
      if (!amount || amount === "" || isNaN(parseFloat(amount))) {
        if (originalRate?.amount) {
          // Use original formatted amount from rates array (e.g., "$20.00")
          amount = originalRate.amount;
        } else if (details.rate && index === 0 && (!details.rates || details.rates.length === 0)) {
          // Fallback to single rate if no rates array exists
          amount = details.rate;
        }
      }
      
      // Format amount - if amount is already formatted (starts with $), use it as-is
      // Otherwise, format the numeric value
      let formattedAmount = "";
      if (amount && amount !== "") {
        if (amount.startsWith("$")) {
          // Already formatted (from original), use as-is
          formattedAmount = amount;
        } else {
          // Extract numeric value and format
          const numValue = parseFloat(amount.replace(/[^0-9.]/g, ""));
          if (!isNaN(numValue) && numValue >= 0) {
            formattedAmount = `$${numValue.toFixed(2)}`;
          } else {
            // If parsing fails, fallback to original formatted amount
            formattedAmount = originalRate?.amount || amount;
          }
        }
      } else if (originalRate?.amount) {
        // If amount is still empty, use original formatted amount
        formattedAmount = originalRate.amount;
      }
      
      return {
        amount: formattedAmount,
        fromDate: rate.fromDate || originalRate?.fromDate || details.rateFromDate || "",
        toDate: rate.toDate || originalRate?.toDate || details.rateToDate || "",
      };
    });
    
    // Prepare submission data
    const submitData: UpdateEnrolmentDetails = {
      id: details.id,
      autoRenewal: formData.autoRenewal ? "Enabled" : "Disabled",
      online: formData.online,
    };

    // Determine if we have multiple rates (check both formData and original details)
    const hasMultipleRates = (details.rates && details.rates.length > 1) || formData.rates.length > 1;
    const hasRatesInFormData = formData.rates.length > 0;
    const hasRatesInDetails = (details.rates && details.rates.length > 0) || !!details.rate;
    
    // Always send rates if we have them (matches legacy: always sends all courseProgramRates)
    // Priority: formData.rates > details.rates > details.rate
    if (hasRatesInFormData && rates.length > 0) {
      // We have rates in formData - use them (even if some amounts are empty)
      if (hasMultipleRates) {
        // Multiple rates - send as array
        submitData.rates = rates;
      } else {
        // Single rate - send both for backward compatibility
        submitData.rates = rates;
        if (rates[0]?.amount) {
          submitData.rate = rates[0].amount;
        }
      }
    } else if (hasRatesInDetails) {
      // Fallback: use original rates from details if formData is empty or rates array is empty
      if (details.rates && details.rates.length > 0) {
        submitData.rates = details.rates;
      } else if (details.rate) {
        submitData.rate = details.rate;
      }
    }

    const success = await onSubmit(submitData);
    
    if (success) {
      onClose();
    }
  };

  const handleRateChange = (index: number, value: string) => {
    setFormData((prev) => {
      const newRates = [...prev.rates];
      if (newRates[index]) {
        newRates[index] = { ...newRates[index], amount: value };
      }
      return { ...prev, rates: newRates };
    });
  };

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Render all rates (matches legacy: foreach courseProgramRates) */}
          {formData.rates.length > 0 ? (
            formData.rates.map((rate, index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`enrolment-rate-${index}`} className="font-semibold">
                  {rate.fromDate && rate.toDate
                    ? `Rate From ${rate.fromDate} To ${rate.toDate}`
                    : "Rate"}
                </Label>
                <Input
                  id={`enrolment-rate-${index}`}
                  type="number"
                  step="0.01"
                  min="0"
                  value={rate.amount}
                  onChange={(e) => handleRateChange(index, e.target.value)}
                  placeholder="Enter rate"
                  className="focus:ring-2 focus:ring-primary"
                />
              </div>
            ))
          ) : (
            <div className="space-y-2">
              <Label htmlFor="enrolment-rate" className="font-semibold">
                Rate
              </Label>
              <Input
                id="enrolment-rate"
                type="number"
                step="0.01"
                min="0"
                value=""
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    rates: [{ amount: e.target.value, fromDate: "", toDate: "" }],
                  }));
                }}
                placeholder="Enter rate"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enrolment-auto-renew"
              checked={formData.autoRenewal}
              onCheckedChange={(checked) => 
                setFormData((prev) => ({ ...prev, autoRenewal: checked as boolean }))
              }
            />
            <Label 
              htmlFor="enrolment-auto-renew" 
              className="text-sm font-normal cursor-pointer"
            >
              Auto Renew
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enrolment-online"
              checked={formData.online}
              onCheckedChange={(checked) => 
                setFormData((prev) => ({ ...prev, online: checked as boolean }))
              }
            />
            <Label 
              htmlFor="enrolment-online" 
              className="text-sm font-normal cursor-pointer"
            >
              Online
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
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


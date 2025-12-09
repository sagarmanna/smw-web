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
import { Clock } from "lucide-react";
import { getProgramsList, Program } from "../../../teachers/teachers.api";
import { SearchableSelect } from "@/components/ui/searchable-select";

interface NewEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: (data: EnrolmentFormData) => void;
}

export interface EnrolmentFormData {
  program: string;
  ratePerHour: string;
  duration: string;
  ratePerMonth: string;
  paymentFrequency: string;
  paymentFrequencyDiscount: string;
  multipleEnrolDiscount: string;
  discountedRatePerMonth: string;
  numberOfLessons: string;
  autoRenew: boolean;
}

// Payment frequency options
const paymentFrequencyOptions = [
  "Monthly",
  "Bi-Monthly",
  "Quarterly",
  "Every 4 Months",
  "Every 5 Months",
  "Every 6 Months",
  "Semi-Annually",
  "Every 7 Months",
  "Every 8 Months",
  "Every 9 Months",
  "Every 10 Months",
  "Every 11 Months",
  "Annually",
];

export function NewEnrolmentModal({
  open,
  onOpenChange,
  onNext,
}: NewEnrolmentModalProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [formData, setFormData] = React.useState<EnrolmentFormData>({
    program: "",
    ratePerHour: "",
    duration: "00:30",
    ratePerMonth: "",
    paymentFrequency: "Monthly",
    paymentFrequencyDiscount: "",
    multipleEnrolDiscount: "",
    discountedRatePerMonth: "",
    numberOfLessons: "96",
    autoRenew: true,
  });

  // Fetch programs when modal opens
  React.useEffect(() => {
    if (open) {
      setLoadingPrograms(true);
      getProgramsList("private")
        .then((programList) => {
          setPrograms(programList);
        })
        .catch((err) => {
          console.error("Error fetching programs:", err);
        })
        .finally(() => {
          setLoadingPrograms(false);
        });
    } else {
      // Reset form when modal closes
      setFormData({
        program: "",
        ratePerHour: "",
        duration: "00:30",
        ratePerMonth: "",
        paymentFrequency: "Monthly",
        paymentFrequencyDiscount: "",
        multipleEnrolDiscount: "",
        discountedRatePerMonth: "",
        numberOfLessons: "96",
        autoRenew: true,
      });
    }
  }, [open]);

  // Transform programs to SearchableSelectOption format
  const programOptions = React.useMemo(() => {
    return programs.map((program) => ({
      value: program.id.toString(),
      label: program.name,
    }));
  }, [programs]);

  // Transform payment frequencies to SearchableSelectOption format
  const paymentFrequencySelectOptions = React.useMemo(() => {
    return paymentFrequencyOptions.map((frequency) => ({
      value: frequency,
      label: frequency,
    }));
  }, []);

  const handleFieldChange = (field: keyof EnrolmentFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    onNext?.(formData);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">New Enrolment Basic</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Program */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="program">Program</Label>
            <div className="w-64">
              <SearchableSelect
                id="program"
                options={programOptions}
                value={formData.program}
                onValueChange={(value) => handleFieldChange("program", value)}
                placeholder="Select program..."
                searchPlaceholder="Search programs..."
                emptyText="No programs available"
                loadingText="Loading programs..."
                noResultsText="No programs found"
                className="w-full"
                disabled={loadingPrograms}
                isLoading={loadingPrograms}
              />
            </div>
          </div>

          {/* Rate (per hour) */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="rate-per-hour">Rate (per hour)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                id="rate-per-hour"
                type="number"
                value={formData.ratePerHour}
                onChange={(e) => handleFieldChange("ratePerHour", e.target.value)}
                className="w-32"
                placeholder="0.00"
              />
              <span className="text-sm text-muted-foreground">/hr</span>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="duration">Duration</Label>
            <div className="flex items-center gap-2">
              <Input
                id="duration"
                type="time"
                value={formData.duration}
                onChange={(e) => handleFieldChange("duration", e.target.value)}
                className="w-32"
              />
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">mins.</span>
            </div>
          </div>

          {/* Rate (per month) */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="rate-per-month">Rate (per month)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                id="rate-per-month"
                type="number"
                value={formData.ratePerMonth}
                onChange={(e) => handleFieldChange("ratePerMonth", e.target.value)}
                className="w-32"
                placeholder="0.00"
                disabled
              />
              <span className="text-sm text-muted-foreground">/mn</span>
            </div>
          </div>

          {/* Payment Frequency */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="payment-frequency">Payment Frequency</Label>
            <div className="w-64">
              <SearchableSelect
                id="payment-frequency"
                options={paymentFrequencySelectOptions}
                value={formData.paymentFrequency}
                onValueChange={(value) => handleFieldChange("paymentFrequency", value)}
                placeholder="Payment Frequency"
                searchPlaceholder="Search payment frequency..."
                emptyText="No payment frequencies available"
                noResultsText="No payment frequencies found"
                className="w-full"
              />
            </div>
          </div>

          {/* Payment Frequency Discount */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="payment-frequency-discount">Payment Frequency Discount</Label>
            <div className="flex items-center gap-2">
              <Input
                id="payment-frequency-discount"
                type="number"
                value={formData.paymentFrequencyDiscount}
                onChange={(e) =>
                  handleFieldChange("paymentFrequencyDiscount", e.target.value)
                }
                className="w-32"
                placeholder="0"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>

          {/* Multiple Enrol. Discount (per month) */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="multiple-enrol-discount">
              Multiple Enrol. Discount (per month)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                id="multiple-enrol-discount"
                type="number"
                value={formData.multipleEnrolDiscount}
                onChange={(e) =>
                  handleFieldChange("multipleEnrolDiscount", e.target.value)
                }
                className="w-32"
                placeholder="0.00"
              />
              <span className="text-sm text-muted-foreground">/mn</span>
            </div>
          </div>

          {/* Discounted Rate (per month) */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="discounted-rate">Discounted Rate (per month)</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                id="discounted-rate"
                type="number"
                value={formData.discountedRatePerMonth}
                onChange={(e) =>
                  handleFieldChange("discountedRatePerMonth", e.target.value)
                }
                className="w-32"
                placeholder="0.00"
                disabled
              />
              <span className="text-sm text-muted-foreground">/mn</span>
            </div>
          </div>

          {/* Number of Lessons */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="number-of-lessons">Number of Lessons</Label>
            <Input
              id="number-of-lessons"
              type="number"
              value={formData.numberOfLessons}
              onChange={(e) => handleFieldChange("numberOfLessons", e.target.value)}
              className="w-32"
            />
          </div>

          {/* Auto Renew */}
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="auto-renew">
              Should this enrolment automatically renew itself?
            </Label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1 border rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleFieldChange("autoRenew", true)}
                  className={`text-sm px-3 py-1.5 transition-colors ${
                    formData.autoRenew
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleFieldChange("autoRenew", false)}
                  className={`text-sm px-3 py-1.5 transition-colors ${
                    !formData.autoRenew
                      ? "bg-blue-600 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleNext} className="bg-teal-600 hover:bg-teal-700">
            Next
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
import { getProgramsList, Program } from "../../../../teachers/teachers.api";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  EnrolmentStartDateModal,
  type EnrolmentStartDateFormData,
} from "./EnrolmentStartDateModal";
import {
  NewEnrolmentDetailModal,
  type EnrolmentDetailFormData,
} from "./NewEnrolmentDetailModal";

interface NewEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: (data: EnrolmentFormData) => void;
  location: string;
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
  startDate?: string;
  paymentCycleEffectiveDate?: string;
  isOnline?: boolean;
}

const paymentFrequencyOptions = [
  "Monthly", "Bi-Monthly", "Quarterly", "Every 4 Months", "Every 5 Months",
  "Every 6 Months", "Semi-Annually", "Every 7 Months", "Every 8 Months",
  "Every 9 Months", "Every 10 Months", "Every 11 Months", "Annually",
];

const defaultFormData: EnrolmentFormData = {
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
};

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}

const NumberField: React.FC<NumberFieldProps> = ({ id, label, value, onChange, prefix, suffix, placeholder, disabled, error, className }) => (
  <div className="flex items-center justify-between gap-4">
    <Label htmlFor={id} className={cn(error && "text-red-600 dark:text-red-400")}>
      {label}
    </Label>
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-center gap-2">
        {prefix && <span className="text-sm">{prefix}</span>}
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={cn("w-32", error && "border-red-500 focus-visible:ring-red-500")}
          placeholder={placeholder}
          disabled={disabled}
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  </div>
);

export function NewEnrolmentModal({
  open,
  onOpenChange,
  onNext,
  location,
}: NewEnrolmentModalProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [formData, setFormData] = React.useState<EnrolmentFormData>(defaultFormData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isStartDateModalOpen, setIsStartDateModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [currentFormData, setCurrentFormData] = React.useState<EnrolmentFormData | null>(null);

  React.useEffect(() => {
    if (open) {
      setLoadingPrograms(true);
      getProgramsList("private")
        .then((programList) => setPrograms(programList))
        .catch((err) => console.error("Error fetching programs:", err))
        .finally(() => setLoadingPrograms(false));
    } else {
      setFormData(defaultFormData);
      setErrors({});
    }
  }, [open]);

  const programOptions = React.useMemo(() => programs.map((p) => ({ value: p.id.toString(), label: p.name })), [programs]);
  const paymentFrequencySelectOptions = React.useMemo(() => paymentFrequencyOptions.map((f) => ({ value: f, label: f })), []);

  const handleFieldChange = (field: keyof EnrolmentFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.program?.trim()) newErrors.program = "Program Id cannot be blank.";
    if (!formData.ratePerHour?.trim()) newErrors.ratePerHour = "Program Rate cannot be blank.";
    if (!formData.numberOfLessons?.trim()) newErrors.numberOfLessons = "Lessons Count cannot be blank.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    onOpenChange(false);
    setIsStartDateModalOpen(true);
  };

  const handleStartDateModalNext = (startDateData: EnrolmentStartDateFormData) => {
    const combinedData: EnrolmentFormData = {
      ...formData,
      startDate: startDateData.startDate,
      paymentCycleEffectiveDate: startDateData.paymentCycleEffectiveDate,
      isOnline: startDateData.isOnline,
    };
    setCurrentFormData(combinedData);
    setIsStartDateModalOpen(false);
    setIsDetailModalOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">New Enrolment Basic</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="program" className={cn(errors.program && "text-red-600 dark:text-red-400")}>Program</Label>
            <div className="flex flex-col w-64">
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
                className={cn("w-full", errors.program && "border-red-500")}
                disabled={loadingPrograms}
                isLoading={loadingPrograms}
              />
              {errors.program && <p className="text-xs text-red-500 mt-1">{errors.program}</p>}
            </div>
          </div>

          <NumberField id="rate-per-hour" label="Rate (per hour)" value={formData.ratePerHour} onChange={(v) => handleFieldChange("ratePerHour", v)} prefix="$" suffix="/hr" placeholder="0.00" error={errors.ratePerHour} />

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="duration">Duration</Label>
            <div className="flex items-center gap-2">
              <Input id="duration" type="time" value={formData.duration} onChange={(e) => handleFieldChange("duration", e.target.value)} className="w-32" />
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">mins.</span>
            </div>
          </div>

          <NumberField id="rate-per-month" label="Rate (per month)" value={formData.ratePerMonth} onChange={(v) => handleFieldChange("ratePerMonth", v)} prefix="$" suffix="/mn" placeholder="0.00" disabled />

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

          <NumberField id="payment-frequency-discount" label="Payment Frequency Discount" value={formData.paymentFrequencyDiscount} onChange={(v) => handleFieldChange("paymentFrequencyDiscount", v)} suffix="%" placeholder="0" />
          <NumberField id="multiple-enrol-discount" label="Multiple Enrol. Discount (per month)" value={formData.multipleEnrolDiscount} onChange={(v) => handleFieldChange("multipleEnrolDiscount", v)} prefix="$" suffix="/mn" placeholder="0.00" />
          <NumberField id="discounted-rate" label="Discounted Rate (per month)" value={formData.discountedRatePerMonth} onChange={(v) => handleFieldChange("discountedRatePerMonth", v)} prefix="$" suffix="/mn" placeholder="0.00" disabled />
          <NumberField id="number-of-lessons" label="Number of Lessons" value={formData.numberOfLessons} onChange={(v) => handleFieldChange("numberOfLessons", v)} error={errors.numberOfLessons} />

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="auto-renew">Should this enrolment automatically renew itself?</Label>
            <div className="flex gap-1 border rounded-md overflow-hidden">
              <button type="button" onClick={() => handleFieldChange("autoRenew", true)} className={cn("text-sm px-3 py-1.5 transition-colors", formData.autoRenew ? "bg-blue-600 text-white" : "bg-transparent text-gray-700 hover:bg-gray-100")}>Yes</button>
              <button type="button" onClick={() => handleFieldChange("autoRenew", false)} className={cn("text-sm px-3 py-1.5 transition-colors", !formData.autoRenew ? "bg-blue-600 text-white" : "bg-transparent text-gray-700 hover:bg-gray-100")}>No</button>
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleNext}>Next</Button>
        </DialogFooter>
      </DialogContent>

      <EnrolmentStartDateModal
        open={isStartDateModalOpen}
        onOpenChange={setIsStartDateModalOpen}
        onBack={() => {
          setIsStartDateModalOpen(false);
          onOpenChange(true);
        }}
        onNext={handleStartDateModalNext}
        location={location}
      />

      <NewEnrolmentDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onBack={() => {
          setIsDetailModalOpen(false);
          setIsStartDateModalOpen(true);
        }}
        onPreviewLessons={() => {
          if (currentFormData) {
            onNext?.(currentFormData);
            setIsDetailModalOpen(false);
          }
        }}
        location={location}
        initialData={{
          startDate: currentFormData?.startDate,
          showAll: false,
        }}
      />
    </Dialog>
  );
}

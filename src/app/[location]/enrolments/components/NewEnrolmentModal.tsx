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
import { SegmentedControl } from "@/components/ui/segmented-control";
import { DurationPicker } from "@/components/DurationPicker";
import { getProgramsList, Program } from "../../teachers/teachers.api";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  EnrolmentStartDateModal,
  type EnrolmentStartDateFormData,
} from "../../students/components/StudentEnrolmentsCard/AddPrivateModal/EnrolmentStartDateModal";
import {
  NewEnrolmentDetailModal,
  type EnrolmentDetailFormData,
} from "@/components/EnrolmentWizard/NewEnrolmentDetailModal";
import {
  NewCustomerDetailsModal,
  type CustomerDetailsFormData,
} from "./NewCustomerDetailsModal";
import {
  NewStudentDetailsModal,
  type StudentDetailsFormData,
} from "./NewStudentDetailsModal";

interface NewEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: (data: EnrolmentFormData) => void;
  location: string;
  /**
   * Custom text for the final button on the shared detail modal.
   * Defaults to "Next" for the enrolments flow.
   */
  nextButtonText?: string;
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
  nextButtonText,
}: NewEnrolmentModalProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [formData, setFormData] = React.useState<EnrolmentFormData>(defaultFormData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isStartDateModalOpen, setIsStartDateModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [isCustomerDetailsModalOpen, setIsCustomerDetailsModalOpen] = React.useState(false);
  const [isStudentDetailsModalOpen, setIsStudentDetailsModalOpen] = React.useState(false);
  const [currentFormData, setCurrentFormData] = React.useState<EnrolmentFormData | null>(null);
  const [enrolmentDetailData, setEnrolmentDetailData] = React.useState<EnrolmentDetailFormData | null>(null);
  const [customerDetailsData, setCustomerDetailsData] = React.useState<CustomerDetailsFormData | null>(null);
  const [startDateData, setStartDateData] = React.useState<EnrolmentStartDateFormData | null>(null);

  React.useEffect(() => {
    if (open) {
      setLoadingPrograms(true);
      getProgramsList("private")
        .then((programList) => setPrograms(programList))
        .catch((err) => console.error("Error fetching programs:", err))
        .finally(() => setLoadingPrograms(false));
    }
  }, [open]);

  // Reset the wizard only when everything is fully closed (not while moving to the next step).
  React.useEffect(() => {
    if (!open && !isStartDateModalOpen && !isDetailModalOpen && !isCustomerDetailsModalOpen && !isStudentDetailsModalOpen) {
      setFormData(defaultFormData);
      setErrors({});
      setCurrentFormData(null);
      setStartDateData(null);
      setEnrolmentDetailData(null);
      setCustomerDetailsData(null);
    }
  }, [open, isStartDateModalOpen, isDetailModalOpen, isCustomerDetailsModalOpen, isStudentDetailsModalOpen]);

  const programOptions = React.useMemo(
    () => programs.map((p) => ({ value: p.id.toString(), label: p.name })),
    [programs]
  );
  const paymentFrequencySelectOptions = React.useMemo(() => paymentFrequencyOptions.map((f) => ({ value: f, label: f })), []);

  const recalculateRates = (data: EnrolmentFormData): EnrolmentFormData => {
    try {
      const [hoursStr = "0", minutesStr = "0"] = (data.duration || "00:30").split(":");
      const hours = parseInt(hoursStr, 10) || 0;
      const minutes = parseInt(minutesStr, 10) || 0;
      const unit = (hours * 60 + minutes) / 60; // duration in hours

      const rate = parseFloat(data.ratePerHour || "0") || 0;
      if (!rate || !unit) {
        return {
          ...data,
          ratePerMonth: "",
          discountedRatePerMonth: "",
        };
      }

      const ratePerLesson = unit * rate;
      const ratePerMonth = ratePerLesson * 4;

      let discount = 0;
      const multiEnrol = parseFloat(data.multipleEnrolDiscount || "0") || 0;
      const pfDiscount = parseFloat(data.paymentFrequencyDiscount || "0") || 0;

      if (multiEnrol) {
        discount += multiEnrol / 4; // per-lesson discount from monthly amount
      }

      // Customer discount is not exposed in new UI yet; treated as 0 for now.

      if (pfDiscount) {
        discount += (ratePerLesson - discount) * (pfDiscount / 100);
      }

      const ratePerLessonWithDiscount = ratePerLesson - discount;
      const ratePerMonthWithDiscount = ratePerLessonWithDiscount * 4;

      return {
        ...data,
        ratePerMonth: ratePerMonth.toFixed(2),
        discountedRatePerMonth: ratePerMonthWithDiscount.toFixed(2),
      };
    } catch {
      return {
        ...data,
        ratePerMonth: data.ratePerMonth,
        discountedRatePerMonth: data.discountedRatePerMonth,
      };
    }
  };

  const handleFieldChange = (field: keyof EnrolmentFormData, value: string | boolean) => {
    setFormData((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const next: EnrolmentFormData = { ...prev, [field]: value as any };
      if (
        field === "ratePerHour" ||
        field === "duration" ||
        field === "paymentFrequencyDiscount" ||
        field === "multipleEnrolDiscount"
      ) {
        return recalculateRates(next);
      }
      return next;
    });
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleProgramChange = (programId: string) => {
    const selectedProgram = programs.find((p) => p.id.toString() === programId);
    setFormData((prev) => {
      const rawRate = selectedProgram?.rate;
      const numericRate =
        rawRate !== undefined && rawRate !== null && rawRate !== ""
          ? Number(rawRate)
          : NaN;
      const base: EnrolmentFormData = {
        ...prev,
        program: programId,
        ratePerHour:
          !Number.isNaN(numericRate) && Number.isFinite(numericRate)
            ? numericRate.toFixed(2)
            : prev.ratePerHour,
      };
      return recalculateRates(base);
    });
    if (errors.program) setErrors((prev) => ({ ...prev, program: "" }));
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
    // Snapshot current selection (e.g. duration) before closing this modal.
    setCurrentFormData(formData);
    onOpenChange(false);
    setIsStartDateModalOpen(true);
  };

  const handleStartDateModalNext = (startDateData: EnrolmentStartDateFormData) => {
    setStartDateData(startDateData);
    const baseData = currentFormData ?? formData;
    const combinedData: EnrolmentFormData = {
      ...baseData,
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
                onValueChange={handleProgramChange}
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
              <DurationPicker
                value={formData.duration}
                onChange={(value) => handleFieldChange("duration", value)}
              />
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
            <SegmentedControl
              options={[
                { value: true, label: "Yes" },
                { value: false, label: "No" },
              ]}
              value={formData.autoRenew}
              onValueChange={(value) => handleFieldChange("autoRenew", value)}
              variant="default"
            />
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
        initialData={startDateData ?? undefined}
        location={location}
      />

      <NewEnrolmentDetailModal
        open={isDetailModalOpen}
        onOpenChange={setIsDetailModalOpen}
        onBack={() => {
          setIsDetailModalOpen(false);
          setIsStartDateModalOpen(true);
        }}
        onPreviewLessons={(detailData) => {
          setEnrolmentDetailData(detailData);
          setIsDetailModalOpen(false);
          setIsCustomerDetailsModalOpen(true);
        }}
        location={location}
        initialData={{
          startDate: currentFormData?.startDate,
          // Use the latest duration selected in the basic enrolment modal
          // so the calendar slot preview reflects this value (e.g. 45 mins).
          duration: currentFormData?.duration ?? formData.duration,
          // Restore previously selected detail data when navigating back
          teacherId: enrolmentDetailData?.teacherId,
          day: enrolmentDetailData?.day,
          startTime: enrolmentDetailData?.startTime,
          goToDate: enrolmentDetailData?.goToDate,
          showAll: enrolmentDetailData?.showAll ?? false,
        }}
        nextButtonText={nextButtonText ?? "Next"}
      />

      <NewCustomerDetailsModal
        open={isCustomerDetailsModalOpen}
        onOpenChange={setIsCustomerDetailsModalOpen}
        onBack={() => {
          setIsCustomerDetailsModalOpen(false);
          setIsDetailModalOpen(true);
        }}
        onNext={(customerData) => {
          setCustomerDetailsData(customerData);
          setIsCustomerDetailsModalOpen(false);
          setIsStudentDetailsModalOpen(true);
        }}
        initialData={customerDetailsData ?? undefined}
        location={location}
      />

      <NewStudentDetailsModal
        open={isStudentDetailsModalOpen}
        onOpenChange={setIsStudentDetailsModalOpen}
        onBack={() => {
          setIsStudentDetailsModalOpen(false);
          setIsCustomerDetailsModalOpen(true);
        }}
        initialData={{
          firstName: customerDetailsData?.firstName ?? "",
          lastName: customerDetailsData?.lastName ?? "",
        }}
        onNext={(studentData) => {
          // Combine all data and pass to parent
          if (currentFormData && enrolmentDetailData && customerDetailsData) {
            // TODO: Combine enrolment data with customer details and student details
            // For now, just pass the enrolment data
            onNext?.(currentFormData);
            setIsStudentDetailsModalOpen(false);
          }
        }}
      />
    </Dialog>
  );
}


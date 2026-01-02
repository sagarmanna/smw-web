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
import type { Program } from "../../../../teachers/teachers.api";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/utils";
import {
  EnrolmentStartDateModal,
  type EnrolmentStartDateFormData,
} from "./EnrolmentStartDateModal";
import {
  NewEnrolmentDetailModal,
  type EnrolmentDetailFormData,
} from "@/components/EnrolmentWizard/NewEnrolmentDetailModal";
import {
  NewEnrolmentReviewModal,
  type LessonPreview,
  type EnrolmentReviewDetails,
} from "@/components/EnrolmentWizard/NewEnrolmentReviewModal";
import {
  createStudentEnrolment,
  getLessonReview,
  confirmLessons,
  type CreateStudentEnrolmentRequest,
} from "../../../[id]/students-details.api";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";

interface NewEnrolmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNext?: (data: EnrolmentFormData) => void;
  location: string;
  customerId?: number;
  studentId?: number; // Student ID for creating enrolment
  nextButtonText?: string; // Custom button text for NewEnrolmentDetailModal, defaults to "Preview Lessons"
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
  customerDiscount?: string;
  startDate?: string;
  paymentCycleEffectiveDate?: string;
  isOnline?: boolean;
  // Detail step fields
  teacherId?: string;
  teacherName?: string;
  day?: string;
  startTime?: string;
  goToDate?: string;
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
  customerId,
  studentId,
  nextButtonText,
}: NewEnrolmentModalProps) {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [paymentFrequencies, setPaymentFrequencies] = React.useState<
    { id: number; name: string; frequencyLength: number }[]
  >([]);
  const [loadingPrograms, setLoadingPrograms] = React.useState(false);
  const [formData, setFormData] = React.useState<EnrolmentFormData>(defaultFormData);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isStartDateModalOpen, setIsStartDateModalOpen] = React.useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = React.useState(false);
  const [currentFormData, setCurrentFormData] = React.useState<EnrolmentFormData | null>(null);
  const [startDateData, setStartDateData] = React.useState<EnrolmentStartDateFormData | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [lessonPreviews, setLessonPreviews] = React.useState<LessonPreview[]>([]);
  const [reviewDetails, setReviewDetails] = React.useState<EnrolmentReviewDetails | undefined>(undefined);
  const [loadingReview, setLoadingReview] = React.useState(false);
  const [createdCourseId, setCreatedCourseId] = React.useState<number | null>(null);
  
  // Get user info to check if user is admin (for rate editing permission)
  const { userInfo } = useAppSelector((state) => state.user);
  const isAdmin = userInfo?.role === 'administrator';

  React.useEffect(() => {
    if (!open) return;

    setLoadingPrograms(true);

    // Fetch enrolment metadata: programs, payment frequencies, customer discount
    if (customerId && location) {
      import("../../../[id]/students-details.api")
        .then(({ getCustomerEnrolmentMetadata }) =>
          getCustomerEnrolmentMetadata(location, customerId),
        )
        .then((result) => {
          if (result && result.success) {
            setPrograms(result.data.programs as Program[]);
            setPaymentFrequencies(result.data.paymentFrequencies);
            if (result.data.discount?.value != null) {
              setFormData((prev) => ({
                ...prev,
                customerDiscount: result.data.discount!.value.toString(),
              }));
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching enrolment metadata:", err);
        })
        .finally(() => setLoadingPrograms(false));
    } else {
      // Fallback: only load programs if customerId is missing
      import("../../../../teachers/teachers.api")
        .then(({ getProgramsList }) => getProgramsList("private"))
        .then((programList) => setPrograms(programList))
        .catch((err) => console.error("Error fetching programs:", err))
        .finally(() => setLoadingPrograms(false));
    }
  }, [open, customerId, location]);

  // Reset the wizard only when everything is fully closed (not while moving to the next step).
  React.useEffect(() => {
    if (!open && !isStartDateModalOpen && !isDetailModalOpen && !isReviewModalOpen) {
      setFormData(defaultFormData);
      setErrors({});
      setCurrentFormData(null);
      setStartDateData(null);
      setLessonPreviews([]);
      setReviewDetails(undefined);
    }
  }, [open, isStartDateModalOpen, isDetailModalOpen, isReviewModalOpen]);

  const programOptions = React.useMemo(
    () => programs.map((p) => ({ value: p.id.toString(), label: p.name })),
    [programs]
  );
  const paymentFrequencySelectOptions = React.useMemo(
    () =>
      paymentFrequencies.length > 0
        ? paymentFrequencies.map((pf) => ({ value: pf.name, label: pf.name }))
        : paymentFrequencyOptions.map((f) => ({ value: f, label: f })),
    [paymentFrequencies]
  );

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
      const customerDisc = parseFloat(data.customerDiscount || "0") || 0;

      if (multiEnrol) {
        discount += multiEnrol / 4; // per-lesson discount from monthly amount
      }

      if (customerDisc) {
        discount += (ratePerLesson - discount) * (customerDisc / 100);
      }

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
      // Recalculate when relevant fields change
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
    if (!formData.duration?.trim()) newErrors.duration = "Duration cannot be blank.";
    if (!formData.paymentFrequency?.trim()) newErrors.paymentFrequency = "Payment Frequency cannot be blank.";
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

          <NumberField id="rate-per-hour" label="Rate (per hour)" value={formData.ratePerHour} onChange={(v) => handleFieldChange("ratePerHour", v)} prefix="$" suffix="/hr" placeholder="0.00" error={errors.ratePerHour} disabled={!isAdmin} />

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="duration" className={cn(errors.duration && "text-red-600 dark:text-red-400")}>Duration</Label>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <DurationPicker
                  value={formData.duration}
                  onChange={(value) => handleFieldChange("duration", value)}
                  error={errors.duration}
                />
                <span className="text-sm text-muted-foreground">mins.</span>
              </div>
              {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
            </div>
          </div>

          <NumberField id="rate-per-month" label="Rate (per month)" value={formData.ratePerMonth} onChange={(v) => handleFieldChange("ratePerMonth", v)} prefix="$" suffix="/mn" placeholder="0.00" disabled />

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="payment-frequency" className={cn(errors.paymentFrequency && "text-red-600 dark:text-red-400")}>Payment Frequency</Label>
            <div className="flex flex-col w-64">
              <SearchableSelect
                id="payment-frequency"
                options={paymentFrequencySelectOptions}
                value={formData.paymentFrequency}
                onValueChange={(value) => handleFieldChange("paymentFrequency", value)}
                placeholder="Payment Frequency"
                searchPlaceholder="Search payment frequency..."
                emptyText="No payment frequencies available"
                noResultsText="No payment frequencies found"
                className={cn("w-full", errors.paymentFrequency && "border-red-500")}
              />
              {errors.paymentFrequency && <p className="text-xs text-red-500 mt-1">{errors.paymentFrequency}</p>}
            </div>
          </div>

          <NumberField id="payment-frequency-discount" label="Payment Frequency Discount" value={formData.paymentFrequencyDiscount} onChange={(v) => handleFieldChange("paymentFrequencyDiscount", v)} suffix="%" placeholder="0" />
          <NumberField id="multiple-enrol-discount" label="Multiple Enrol. Discount (per month)" value={formData.multipleEnrolDiscount} onChange={(v) => handleFieldChange("multipleEnrolDiscount", v)} prefix="$" suffix="/mn" placeholder="0.00" />
          <NumberField
            id="customer-discount"
            label="Customer Discount"
            value={formData.customerDiscount || ""}
            onChange={() => {}}
            suffix="%"
            placeholder="0"
            disabled
          />
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
        isLoading={loadingReview}
        onPreviewLessons={async (detailData) => {
          if (!currentFormData || !studentId) {
            toast.error("Missing required data to create enrolment");
            return;
          }

            const combinedData: EnrolmentFormData = {
              ...currentFormData,
              teacherId: detailData.teacherId,
              teacherName: detailData.teacherName,
              day: detailData.day,
              startTime: detailData.startTime,
              goToDate: detailData.goToDate,
              duration: detailData.duration ?? currentFormData.duration,
              // Use startDate from detail modal if available (when user selects a time slot),
              // otherwise fall back to the startDate from EnrolmentStartDateModal
              startDate: detailData.startDate ?? currentFormData.startDate,
            };
            setCurrentFormData(combinedData);

          setLoadingReview(true);
          try {
            // Create enrolment (matching legacy: creates course, enrolment, and lessons)
            const payload: CreateStudentEnrolmentRequest = {
              programId: Number(combinedData.program),
              programRate: Number(combinedData.ratePerHour || 0),
              duration: combinedData.duration,
              paymentFrequency: combinedData.paymentFrequency,
              paymentFrequencyDiscount: combinedData.paymentFrequencyDiscount
                ? Number(combinedData.paymentFrequencyDiscount)
                : undefined,
              multipleEnrolDiscount: combinedData.multipleEnrolDiscount
                ? Number(combinedData.multipleEnrolDiscount)
                : undefined,
              discountedRatePerMonth: Number(combinedData.discountedRatePerMonth || 0),
              lessonsCount: Number(combinedData.numberOfLessons || 0),
              autoRenew: combinedData.autoRenew,
              startDate: combinedData.startDate || "",
              paymentCycleEffectiveDate: combinedData.paymentCycleEffectiveDate || "",
              isOnline: combinedData.isOnline ?? false,
              teacherId: combinedData.teacherId ? Number(combinedData.teacherId) : 0,
              day: combinedData.day || "",
              startTime: combinedData.startTime || "",
            };

            // Basic validation
            if (
              !payload.programId ||
              !payload.lessonsCount ||
              !payload.startDate ||
              !payload.paymentCycleEffectiveDate ||
              !payload.teacherId ||
              !payload.day ||
              !payload.startTime
            ) {
              toast.error("Please complete all enrolment steps before previewing.");
              setLoadingReview(false);
              return;
            }

            const createResult = await createStudentEnrolment(location, studentId.toString(), payload);

            if (!createResult || !createResult.success || !createResult.data) {
              toast.error(createResult?.message || "Failed to create enrolment");
              setLoadingReview(false);
              return;
            }

            // Get courseId from the created enrolment response
            const courseId = createResult.data.courseId;
            
            if (!courseId) {
              toast.error("Course ID not available in response");
              setLoadingReview(false);
              return;
            }

            // Fetch lesson review data (matching legacy GET /lesson/review)
            const reviewResult = await getLessonReview(location, courseId, false);
            
            if (!reviewResult || !reviewResult.success || !reviewResult.data) {
              toast.error("Failed to load lesson review data");
              setLoadingReview(false);
              return;
            }

            const reviewData = reviewResult.data;
            
            // Transform review lessons to LessonPreview format
            const previews: LessonPreview[] = reviewData.lessons.map((lesson, index) => {
              const lessonDate = new Date(lesson.date);
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
              const dayName = dayNames[lessonDate.getDay()];
              
              // Extract UTC time from the date string to avoid timezone conversion
              // The API returns dates like "2025-12-28T22:00:00.000Z" which should be displayed as 10:00 PM
              // Use UTC methods to get the exact time without timezone conversion
              const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
              const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
              const startTime = `${utcHours}:${utcMinutes}`;
              
              return {
                index: index + 1,
                id: lesson.id, // Lesson ID for editing
                date: lessonDate.toISOString().split('T')[0],
                day: dayName,
                startTime: startTime, // HH:mm in UTC (exact time from API)
                duration: lesson.duration,
                conflict: lesson.conflict,
                isHolidayConflict: lesson.isHolidayConflict,
                isConflict: lesson.isConflict,
                isUnscheduled: lesson.isUnscheduled,
              };
            });

            setLessonPreviews(previews);
            setReviewDetails({
              studentName: reviewData.studentName,
              programName: reviewData.programName,
              teacherName: reviewData.teacherName,
              teacherId: currentFormData?.teacherId ? Number(currentFormData.teacherId) : undefined,
              startDate: reviewData.startDate,
              endDate: reviewData.endDate,
              startTime: reviewData.startTime,
            });
            setCreatedCourseId(reviewData.courseId);
          } catch (error) {
            console.error("Error creating enrolment or fetching review:", error);
            toast.error("Failed to create enrolment or load review data");
          } finally {
            setLoadingReview(false);
            setIsDetailModalOpen(false);
            setIsReviewModalOpen(true);
          }
        }}
        location={location}
        programId={currentFormData?.program || formData.program}
        initialData={{
          startDate: currentFormData?.startDate,
          showAll: false,
          // Use the latest duration selected in the basic enrolment modal
          // so the calendar slot preview reflects this value (e.g. 45 mins).
          duration: currentFormData?.duration ?? formData.duration,
        }}
        nextButtonText={nextButtonText}
      />

      <NewEnrolmentReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        lessons={lessonPreviews}
        details={reviewDetails}
        onBack={() => {
          setIsReviewModalOpen(false);
          setIsDetailModalOpen(true);
        }}
        isLoading={loadingReview}
        location={location}
        courseId={createdCourseId || undefined}
        programId={currentFormData?.program || formData.program}
        onLessonUpdated={async () => {
          // Refresh lesson review data after lesson update
          if (createdCourseId) {
            try {
              const reviewResult = await getLessonReview(location, createdCourseId, false);
              if (reviewResult?.success && reviewResult.data) {
                const reviewData = reviewResult.data;
                
                // Transform review lessons to LessonPreview format
                const previews: LessonPreview[] = reviewData.lessons.map((lesson, index) => {
                  const lessonDate = new Date(lesson.date);
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const dayName = dayNames[lessonDate.getDay()];
                  
                  // Extract UTC time from the date string to avoid timezone conversion
                  const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
                  const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
                  const startTime = `${utcHours}:${utcMinutes}`;
                  
                  return {
                    index: index + 1,
                    id: lesson.id, // Lesson ID for editing
                    date: lessonDate.toISOString().split('T')[0],
                    day: dayName,
                    startTime: startTime, // HH:mm in UTC (exact time from API)
                    duration: lesson.duration,
                    conflict: lesson.conflict,
                    isHolidayConflict: lesson.isHolidayConflict,
                    isConflict: lesson.isConflict,
                    isUnscheduled: lesson.isUnscheduled,
                  };
                });

                setLessonPreviews(previews);
              }
            } catch (error) {
              console.error('Error refreshing lesson review:', error);
            }
          }
        }}
        onConfirm={async () => {
          if (!createdCourseId) {
            toast.error("Cannot confirm: Course ID missing");
            return;
          }

          setLoadingReview(true);
          try {
            // Call the lesson confirmation API (separate endpoint)
            const result = await confirmLessons(location, createdCourseId);

            if (result && result.success) {
              toast.success(result.message || "Lessons confirmed successfully");
              setIsReviewModalOpen(false);
              onOpenChange(false);
              // Refresh enrolments list if onNext is available
          if (currentFormData) {
            onNext?.(currentFormData);
              }
            } else {
              toast.error(result?.message || "Failed to confirm lessons");
            }
          } catch (error: unknown) {
            console.error("Error confirming lessons:", error);
            toast.error("Failed to confirm lessons");
          } finally {
            setLoadingReview(false);
          }
        }}
      />
    </Dialog>
  );
}

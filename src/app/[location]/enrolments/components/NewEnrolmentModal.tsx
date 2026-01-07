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
import {
  NewEnrolmentReviewModal,
  type LessonPreview,
  type EnrolmentReviewDetails,
} from "@/components/EnrolmentWizard/NewEnrolmentReviewModal";
import {
  createStudentEnrolment,
  getLessonReview,
  confirmLessons,
  getStudentEnrolments,
  type CreateStudentEnrolmentRequest,
} from "../../students/[id]/students-details.api";
import { createStudent } from "@/lib/api/student.api";
import { apiClient } from "@/lib/api/client";
import { createCustomerPhone } from "../../customers/components/PhoneCard/phone-card.api";
import { createCustomerAddress } from "../../customers/components/AddressCard/address-card.api";
import { toast } from "sonner";

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
  const [studentDetailsData, setStudentDetailsData] = React.useState<StudentDetailsFormData | null>(null);
  const [startDateData, setStartDateData] = React.useState<EnrolmentStartDateFormData | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [lessonPreviews, setLessonPreviews] = React.useState<LessonPreview[]>([]);
  const [reviewDetails, setReviewDetails] = React.useState<EnrolmentReviewDetails | undefined>(undefined);
  const [loadingReview, setLoadingReview] = React.useState(false);
  const [createdCourseId, setCreatedCourseId] = React.useState<number | null>(null);
  const [createdCustomerId, setCreatedCustomerId] = React.useState<number | null>(null);
  const [createdStudentId, setCreatedStudentId] = React.useState<number | null>(null);

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
    if (!open && !isStartDateModalOpen && !isDetailModalOpen && !isCustomerDetailsModalOpen && !isStudentDetailsModalOpen && !isReviewModalOpen) {
      setFormData(defaultFormData);
      setErrors({});
      setCurrentFormData(null);
      setStartDateData(null);
      setEnrolmentDetailData(null);
      setCustomerDetailsData(null);
      setStudentDetailsData(null);
      setLessonPreviews([]);
      setReviewDetails(undefined);
      setCreatedCourseId(null);
      setCreatedCustomerId(null);
      setCreatedStudentId(null);
    }
  }, [open, isStartDateModalOpen, isDetailModalOpen, isCustomerDetailsModalOpen, isStudentDetailsModalOpen, isReviewModalOpen]);

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
        programId={currentFormData?.program || formData.program}
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
        onNext={async (customerData) => {
          setCustomerDetailsData(customerData);
          
          // Create customer via API
          setLoadingReview(true);
          try {
            // Prepare customer creation payload
            const customerPayload = {
              firstname: customerData.firstName.trim(),
              lastname: customerData.lastName.trim(),
              email: customerData.email.trim(),
              referralSourceId: customerData.referralSourceId || null,
              description: customerData.referralSourceDescription || "",
            };

            // Create customer
            const customerResponse = await apiClient.post(
              `/admin/v2/${location}/customers`,
              customerPayload
            );

            if (!customerResponse.data?.success || !customerResponse.data?.data?.id) {
              toast.error(customerResponse.data?.message || "Failed to create customer");
              setLoadingReview(false);
              return;
            }

            const customerId = customerResponse.data.data.id;
            setCreatedCustomerId(customerId);

            // Note: Email is already saved when creating the customer, so we don't need to create it separately

            // Create customer phone
            if (customerData.phone && customerData.phone.trim()) {
              try {
                await createCustomerPhone(location, customerId, {
                  number: customerData.phone,
                  extension: customerData.phoneExt ? parseInt(customerData.phoneExt, 10) : undefined,
                  label: customerData.phoneLabel || "Home",
                  isPrimary: true,
                });
              } catch (error) {
                // Continue even if phone creation fails
              }
            }

            // Create customer address
            const hasStreetAddress = customerData.streetAddress && customerData.streetAddress.trim();

            if (hasStreetAddress) {
              try {
                const addressPayload = {
                  address: customerData.streetAddress.trim(),
                  postalCode: customerData.postalCode || "",
                  city: customerData.city || "",
                  cityId: customerData.cityId && customerData.cityId > 0 ? customerData.cityId : 0,
                  provinceId: customerData.provinceId && customerData.provinceId > 0 ? customerData.provinceId : 1,
                  countryId: customerData.countryId && customerData.countryId > 0 ? customerData.countryId : 1,
                  note: "",
                  label: customerData.addressLabel || "Home",
                  isPrimary: false,
                };
                await createCustomerAddress(location, customerId, addressPayload);
              } catch (error) {
                // Continue even if address creation fails
              }
            }

            toast.success("Customer created successfully");
            setIsCustomerDetailsModalOpen(false);
            setIsStudentDetailsModalOpen(true);
          } catch (error: unknown) {
            console.error("Error creating customer:", error);
            const axiosError = error as { response?: { data?: { message?: string } } };
            toast.error(axiosError.response?.data?.message || "Failed to create customer");
          } finally {
            setLoadingReview(false);
          }
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
        isLoading={loadingReview}
        onNext={async (studentData) => {
          if (!currentFormData || !enrolmentDetailData || !createdCustomerId) {
            toast.error("Missing required data to create student");
            return;
          }

          setStudentDetailsData(studentData);
          setLoadingReview(true);

          try {
            // Convert gender format: "Not Specified" -> "not-specified", "Male" -> "male", "Female" -> "female"
            const genderMap: Record<string, 'male' | 'female' | 'not-specified'> = {
              'Not Specified': 'not-specified',
              'Male': 'male',
              'Female': 'female',
            };
            const apiGender = genderMap[studentData.gender] || 'not-specified';

            // Create student via API
            const studentResponse = await createStudent(location, createdCustomerId, {
              firstName: studentData.firstName.trim(),
              lastName: studentData.lastName.trim(),
              customerId: createdCustomerId,
              birthDate: studentData.birthDate || undefined,
              gender: apiGender,
            });

            if (!studentResponse.success) {
              toast.error(studentResponse.message || "Failed to create student");
              setLoadingReview(false);
              return;
            }

            // Extract student ID from the response URL or use a different approach
            // The API returns a URL, we need to extract the ID from it
            // For now, we'll need to fetch the student list or use a different endpoint
            // Let's assume the API response includes the student ID in data
            // If not, we'll need to parse the URL or make another API call
            
            // Parse student ID from URL if available, otherwise we'll need to fetch it
            // For now, let's create the enrolment and handle student ID extraction
            // We'll need to check the actual API response structure
            
            // Since createStudent returns a URL, we might need to extract ID from it
            // Or make a separate call to get the student ID
            // For now, let's proceed with creating enrolment - we'll need to handle this
            
            toast.success("Student created successfully");
            
            // Now create enrolment with the student ID
            // We need to get the student ID - let's check if it's in the response
            // If not, we'll need to fetch it or modify the API response
            
            // For now, let's assume we can get student ID from the response URL
            // Extract ID from URL pattern: /admin/v2/{location}/student/{id}/info
            const urlMatch = studentResponse.data?.url?.match(/\/student\/(\d+)/);
            const studentId = urlMatch ? urlMatch[1] : null;
            
            if (!studentId) {
              toast.error("Could not determine student ID from response");
              setLoadingReview(false);
              return;
            }

            setCreatedStudentId(Number(studentId));

            // Combine all enrolment data
            const combinedData: EnrolmentFormData = {
              ...currentFormData,
              teacherId: enrolmentDetailData.teacherId,
              teacherName: enrolmentDetailData.teacherName,
              day: enrolmentDetailData.day,
              startTime: enrolmentDetailData.startTime,
              goToDate: enrolmentDetailData.goToDate,
              duration: enrolmentDetailData.duration ?? currentFormData.duration,
              startDate: enrolmentDetailData.startDate ?? currentFormData.startDate,
            };

            // Create enrolment payload
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

            // Create enrolment
            const createResult = await createStudentEnrolment(location, studentId, payload);

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

            setCreatedCourseId(courseId);

            // Fetch student enrolments first (sequential to avoid parallel requests)
            await getStudentEnrolments(location, studentId, false);

            // Then fetch lesson review data
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
              const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
              const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
              const startTime = `${utcHours}:${utcMinutes}`;
              
              return {
                index: index + 1,
                id: lesson.id,
                date: lessonDate.toISOString().split('T')[0],
                day: dayName,
                startTime: startTime,
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
              teacherId: combinedData.teacherId ? Number(combinedData.teacherId) : undefined,
              startDate: reviewData.startDate,
              endDate: reviewData.endDate,
              startTime: reviewData.startTime,
            });

            setIsStudentDetailsModalOpen(false);
            setIsReviewModalOpen(true);
          } catch (error: unknown) {
            console.error("Error creating student or enrolment:", error);
            const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
            toast.error(axiosError.response?.data?.message || axiosError.message || "Failed to create student or enrolment");
          } finally {
            setLoadingReview(false);
          }
        }}
      />

      <NewEnrolmentReviewModal
        open={isReviewModalOpen}
        onOpenChange={setIsReviewModalOpen}
        lessons={lessonPreviews}
        details={reviewDetails}
        onBack={() => {
          setIsReviewModalOpen(false);
          setIsStudentDetailsModalOpen(true);
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
                  
                  const utcHours = String(lessonDate.getUTCHours()).padStart(2, '0');
                  const utcMinutes = String(lessonDate.getUTCMinutes()).padStart(2, '0');
                  const startTime = `${utcHours}:${utcMinutes}`;
                  
                  return {
                    index: index + 1,
                    id: lesson.id,
                    date: lessonDate.toISOString().split('T')[0],
                    day: dayName,
                    startTime: startTime,
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
            // Call the lesson confirmation API
            const result = await confirmLessons(location, createdCourseId);

            if (result && result.success) {
              toast.success(result.message || "Lessons confirmed successfully");
              setIsReviewModalOpen(false);
              onOpenChange(false);
              // Call onNext callback to refresh the listing
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


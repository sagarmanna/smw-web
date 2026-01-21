"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { EmailModal, type EmailFormData } from "@/components/EmailModal";
import { sendEmail } from "@/lib/api/legacyApiAdapter";
import { getCustomerEmailAddresses } from "@/lib/api/customer.api";
import { useEnrolmentDetails } from "../hooks/useEnrolmentDetails";
import { EnrolmentDetailsCard } from "../components/EnrolmentDetailsCard";
import { EnrolmentDiscountsCard } from "../components/EnrolmentDiscountsCard";
import { EnrolmentPaymentFrequencyCard } from "../components/EnrolmentPaymentFrequencyCard";
import { EnrolmentScheduleCard } from "../components/EnrolmentScheduleCard";
import { EnrolmentScheduleHistoryCard } from "../components/EnrolmentScheduleHistoryCard";
import { EnrolmentLessonsCard } from "../components/EnrolmentLessonsCard";
import { EnrolmentHistoryCard } from "../components/EnrolmentHistoryCard";
import { DeleteEnrolmentModal } from "../components/modals/DeleteEnrolmentModal";
import { FullDeleteEnrolmentModal } from "../components/modals/FullDeleteEnrolmentModal";
import { ReceivePaymentModal, type ReceivePaymentData } from "@/components/modal/ReceivePaymentModal";
import { toast } from "sonner";
import { Lock, Users } from "lucide-react";
import {
  formatLessonsForPrint,
  formatRateDisplay,
  generateEnrolmentPrintHtml,
} from "../utils/printUtils";
import { useIconPositioning } from "../utils/iconPositioning";
import { ENROLMENT_CONSTANTS, ENROLMENT_MESSAGES } from "../utils/constants";

interface EnrolmentDetailClientProps {
  location: string;
  id: string;
}

export function EnrolmentDetailClient({ location, id }: EnrolmentDetailClientProps) {
  const router = useRouter();

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.enrolment?.isLoading || false);
  const error = useAppSelector((state) => state.enrolment?.error);
  const enrolmentInfo = useAppSelector((state) => state.enrolment?.enrolmentInfo);

  const {
    details,
    discounts,
    paymentFrequency,
    schedule,
    scheduleHistory,
    lessons,
    lessonsPagination,
    lessonsLoading,
    lessonsError,
    history,
    historyPagination,
    historyLoading,
    historyError,
    fetchHistory,
    fetchLessons,
    saveDetails,
    savingDetails,
    adjustScheduleEndDate,
    changeSchedulePermanently,
    saveDiscounts,
    savePaymentFrequency,
  } = useEnrolmentDetails(location, id);

  // Email modal state - only used for group enrolments (statements)
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [customerEmails, setCustomerEmails] = React.useState<string[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = React.useState(false);

  // Determine enrolment type from API response (single source of truth)
  // Backend provides programType which is normalized to details.type in transformApiResponse
  // Default to "private" if undefined (defensive programming)
  const enrolmentType = React.useMemo<"private" | "group">(() => {
    return (
      (details?.type as "private" | "group" | undefined) ||
      ENROLMENT_CONSTANTS.ENROLMENT_TYPE_PRIVATE
    );
  }, [details?.type]);
  
  const isPrivateEnrolment = React.useMemo(() => {
    return enrolmentType === ENROLMENT_CONSTANTS.ENROLMENT_TYPE_PRIVATE;
  }, [enrolmentType]);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [isFullDeleteModalOpen, setIsFullDeleteModalOpen] = React.useState(false);

  // Receive payment modal state
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = React.useState(false);

  // Handle receiving payment
  const handleReceivePayment = React.useCallback(async (paymentData: ReceivePaymentData) => {
    if (!details?.customerId) {
      toast.error("Customer ID is required to receive payment");
      return;
    }

    try {
      // Import the legacy API function
      const { receivePayment } = await import("@/lib/api/legacyApiAdapter");
      const paymentMethodId = Number(paymentData.paymentMethod) || 1; // Default to 1 if invalid

      // Helper function to format numbers to 2 decimal places
      const formatToTwoDecimals = (value: number): number => {
        return Math.round(value * 100) / 100;
      };

      // Calculate amount needed (sum of all selected items)
      const lessonPaymentsTotal = Object.values(
        paymentData.lessonPayments || {}
      ).reduce((sum, val) => sum + val, 0);
      const groupLessonPaymentsTotal = Object.values(
        paymentData.groupLessonPayments || {}
      ).reduce((sum, val) => sum + val, 0);
      const invoicePaymentsTotal = Object.values(
        paymentData.invoicePayments || {}
      ).reduce((sum, val) => sum + val, 0);
      const amountNeeded = formatToTwoDecimals(
        lessonPaymentsTotal + groupLessonPaymentsTotal + invoicePaymentsTotal
      );
      const amountToDistribute = formatToTwoDecimals(amountNeeded);

      // Prepare lesson payments array (IDs are already numeric from API)
      const lessonPaymentsArray = paymentData.lessonPayments
        ? Object.entries(paymentData.lessonPayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare group lesson payments array (IDs are already numeric from API)
      const groupLessonPaymentsArray = paymentData.groupLessonPayments
        ? Object.entries(paymentData.groupLessonPayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice payments array (IDs are already numeric from API, no "I-" prefix needed)
      const invoicePaymentsArray = paymentData.invoicePayments
        ? Object.entries(paymentData.invoicePayments)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare payment credits array (IDs are already numeric from API)
      const paymentCreditsArray = paymentData.paymentCredits
        ? Object.entries(paymentData.paymentCredits)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice credits array (IDs are already numeric from API)
      const invoiceCreditsArray = paymentData.invoiceCredits
        ? Object.entries(paymentData.invoiceCredits)
            .filter(([_, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Calculate selected credit value (sum of all selected credits)
      const selectedCreditValue = formatToTwoDecimals(
        paymentCreditsArray.reduce((sum, c) => sum + c.value, 0) +
          invoiceCreditsArray.reduce((sum, c) => sum + c.value, 0)
      );

      // Calculate amount received following legacy logic
      const amountAfterCredits = amountNeeded - selectedCreditValue;
      let calculatedAmount: number;
      if (amountAfterCredits < 0) {
        // Credits exceed amount needed
        calculatedAmount = amountNeeded > 0 ? 0.0 : amountAfterCredits;
      } else {
        // Credits don't fully cover amount needed (or exactly match)
        calculatedAmount = amountAfterCredits;
      }

      // Use the calculated amount when credits are present (matching legacy auto-calculation behavior)
      // When no credits are used, use the user-entered amount
      const finalAmount =
        selectedCreditValue > 0
          ? formatToTwoDecimals(calculatedAmount)
          : formatToTwoDecimals(paymentData.amountReceived);

      // Prepare payment data for legacy API
      const legacyPaymentData = {
        userId: details.customerId,
        date: paymentData.date, // Already in "MMM dd, yyyy" format
        paymentMethodId: paymentMethodId,
        reference: paymentData.reference || "",
        amount: finalAmount,
        amountNeeded: amountNeeded,
        selectedCreditValue: selectedCreditValue,
        amountToDistribute: amountToDistribute,
        notes: paymentData.notes || "",
        lessonPayments:
          lessonPaymentsArray.length > 0 ? lessonPaymentsArray : undefined,
        groupLessonPayments:
          groupLessonPaymentsArray.length > 0
            ? groupLessonPaymentsArray
            : undefined,
        invoicePayments:
          invoicePaymentsArray.length > 0 ? invoicePaymentsArray : undefined,
        paymentCredits:
          paymentCreditsArray.length > 0 ? paymentCreditsArray : undefined,
        invoiceCredits:
          invoiceCreditsArray.length > 0 ? invoiceCreditsArray : undefined,
        canUsePaymentCredits: paymentCreditsArray.length > 0 ? 1 : 0,
        canUseInvoiceCredits: invoiceCreditsArray.length > 0 ? 1 : 0,
        prId: "",
      };

      // Call legacy API
      const response = await receivePayment(location, legacyPaymentData);

      if (response.status) {
        // Success - close receive payment modal
        setIsReceivePaymentModalOpen(false);
        toast.success(`Payment of $${finalAmount.toFixed(2)} received successfully`);
        
        // Optionally refresh enrolment data here if needed
        // You might want to refetch enrolment details to reflect the payment
      } else {
        const errorMessage = response.message || "Failed to receive payment";
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error receiving payment:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to receive payment";
      toast.error(errorMessage);
    }
  }, [details?.customerId, location]);

  // Fetch customer email addresses when email modal opens
  React.useEffect(() => {
    const fetchCustomerEmails = async () => {
      if (isEmailModalOpen && details?.customerId) {
        setIsLoadingEmails(true);
        try {
          const emails = await getCustomerEmailAddresses(location, details.customerId);
          setCustomerEmails(emails);
        } catch (error) {
          console.error("Error fetching customer emails:", error);
          setCustomerEmails([]);
        } finally {
          setIsLoadingEmails(false);
        }
      } else if (!isEmailModalOpen) {
        setCustomerEmails([]);
      }
    };

    fetchCustomerEmails();
  }, [isEmailModalOpen, details?.customerId, location]);

  // Memoize formatted lessons for print to avoid recalculation
  const formattedLessonsForPrint = React.useMemo(() => {
    return formatLessonsForPrint(lessons);
  }, [lessons]);

  // Print handler with XSS protection
  const handlePrint = React.useCallback(() => {
    if (!details) {
      toast.error(ENROLMENT_MESSAGES.ERROR_FALLBACK);
      return;
    }

    try {
      // Create print window with error handling
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast.error(ENROLMENT_MESSAGES.PRINT_POPUP_BLOCKED);
        return;
      }

      // Format rate display with XSS protection
      const rateDisplay = formatRateDisplay(details.rates, details.rate);

      // Generate print HTML using utility function (XSS protected)
      const htmlContent = generateEnrolmentPrintHtml({
        program: details.program || "",
        teacher: details.teacher || "",
        rate: rateDisplay,
        autoRenewal: details.autoRenewal || "",
        duration: details.duration || "",
        student: details.student || "",
        customer: details.customer || "",
        online: details.online || false,
        schedule: schedule
          ? {
              day: schedule.day || "",
              time: schedule.time || "",
              startDate: schedule.startDate || "",
              endDate: schedule.endDate || "",
            }
          : null,
        lessons: formattedLessonsForPrint,
      });

      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } catch (error) {
      console.error("Error generating print content:", error);
      toast.error(ENROLMENT_MESSAGES.PRINT_ERROR);
    }
  }, [details, schedule, formattedLessonsForPrint]);

  // Fetch history on initial load - optimized dependencies
  React.useEffect(() => {
    // Only fetch if we have valid IDs and haven't loaded history yet
    if (id && location && !historyPagination && !historyLoading) {
      fetchHistory(1);
    }
    // fetchHistory is stable from useCallback, so we can safely omit it from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location]);

  // Fetch lessons with pagination on initial load - ONLY for group enrolments
  React.useEffect(() => {
    // Only fetch paginated lessons for group enrolments
    if (id && location && !isPrivateEnrolment && !lessonsPagination && !lessonsLoading) {
      fetchLessons(1, 10);
    }
    // fetchLessons is stable from useCallback, so we can safely omit it from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location, isPrivateEnrolment]);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Enrolment #${id}`;
    return details.program || `Enrolment #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Enrolments",
        onClick: () => router.push(`/${location}/enrolments`),
      },
    ],
    [location, router]
  );

  // Icon positioning using optimized utility hook
  const iconContainerRef = React.useRef<HTMLDivElement>(null);
  const iconLeft = useIconPositioning(pageTitle, isLoading, iconContainerRef);

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(() => {
    const commonItems: ActionMenuGroup["items"] = [
      {
        label: ENROLMENT_MESSAGES.ACTION_RECEIVE_PAYMENT,
        onClick: () => {
          setIsReceivePaymentModalOpen(true);
        },
      },
      {
        label: ENROLMENT_MESSAGES.ACTION_DELETE,
        onClick: () => {
          setIsDeleteModalOpen(true);
        },
        variant: "destructive" as const,
      },
    ];

    const groupSpecificItems: ActionMenuGroup["items"] =
      enrolmentType === ENROLMENT_CONSTANTS.ENROLMENT_TYPE_GROUP
        ? [
            ...commonItems,
            {
              label: ENROLMENT_MESSAGES.ACTION_PRINT,
              onClick: handlePrint,
            },
            {
              label: ENROLMENT_MESSAGES.ACTION_MAIL,
              onClick: () => {
                // Open email modal for group enrolment statements
                setIsEmailModalOpen(true);
              },
            },
          ]
        : [
            ...commonItems,
            {
              label: ENROLMENT_MESSAGES.ACTION_FULL_DELETE,
              onClick: () => {
                setIsFullDeleteModalOpen(true);
              },
              variant: "destructive" as const,
            },
          ];

    return [
      {
        label: ENROLMENT_MESSAGES.ACTION_LABEL,
        items: groupSpecificItems,
      },
    ];
  }, [enrolmentType, handlePrint]);

  // Error state - show error but still render cards with skeleton
  const showError = error && !enrolmentInfo;

  if (isLoading && !enrolmentInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation
          size="xl"
          text={ENROLMENT_MESSAGES.LOADING}
          className="text-center"
        />
      </div>
    );
  }

  if (!enrolmentInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || ENROLMENT_MESSAGES.NOT_FOUND}
          title={ENROLMENT_MESSAGES.ERROR_TITLE}
          fallbackMessage={ENROLMENT_MESSAGES.ERROR_FALLBACK}
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {showError && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title={ENROLMENT_MESSAGES.ERROR_TITLE}
              fallbackMessage={ENROLMENT_MESSAGES.ERROR_FALLBACK}
            />
          </div>
        )}
        
        <div className="relative" ref={iconContainerRef}>
          <DetailHeaderWithProfile
            breadcrumbItems={breadcrumbItems}
            currentPageTitle={pageTitle}
            loading={isLoading}
            actionMenuGroups={actionMenuGroups}
            actionButtonAriaLabel="Enrolment actions"
            showProfileIcon={false}
            profileIconSize="md"
          />
          {iconLeft !== null && (
            <div
              className="absolute pointer-events-none"
              style={{
                left: `${iconLeft}px`,
                top: "50%",
                transform: "translateY(-50%)",
              }}
              role="img"
              aria-label={
                enrolmentType === ENROLMENT_CONSTANTS.ENROLMENT_TYPE_PRIVATE
                  ? "Private enrolment"
                  : "Group enrolment"
              }
            >
              {enrolmentType === ENROLMENT_CONSTANTS.ENROLMENT_TYPE_PRIVATE ? (
                <Lock
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
                  aria-hidden="true"
                />
              ) : (
                <Users
                  className="h-5 w-5 text-gray-600 dark:text-gray-400"
                  aria-hidden="true"
                />
              )}
            </div>
          )}
        </div>

        {/* Main Content - All cards share the same cached data from Redux */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          {/* Two Column Layout: 
              - Private: Left Column (Details, Discounts, Payment Frequency) | Right Column (Schedule, Schedule History)
              - Group: Left Column (Details, Discounts) | Right Column (Schedule) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              <EnrolmentDetailsCard
                details={details}
                onSaveDetails={saveDetails}
                savingDetails={savingDetails}
                isLoading={isLoading}
                location={location}
                studentId={details?.studentId}
                customerId={details?.customerId}
                enrolmentType={enrolmentType}
              />

              <EnrolmentDiscountsCard
                discounts={discounts}
                schedule={schedule}
                details={details}
                onSaveDiscounts={saveDiscounts}
                savingDiscounts={savingDetails}
                isLoading={isLoading}
                enrolmentType={enrolmentType}
                location={location}
                enrolmentId={id}
              />

              {/* Payment Frequency - Only show for private enrolments */}
              {isPrivateEnrolment && (
                <EnrolmentPaymentFrequencyCard
                  paymentFrequency={paymentFrequency}
                  isLoading={isLoading}
                  onSavePaymentFrequency={savePaymentFrequency}
                  savingPaymentFrequency={savingDetails}
                  location={location}
                  enrolmentId={id}
                />
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <EnrolmentScheduleCard
                schedule={schedule}
                onAdjustEndDate={(endDate) => adjustScheduleEndDate(endDate, enrolmentType)}
                onChangeSchedulePermanently={changeSchedulePermanently}
                saving={savingDetails}
                isLoading={isLoading}
                enrolmentType={enrolmentType}
                location={location}
                enrolmentId={id}
              />

              {/* Schedule History - Only show for private enrolments */}
              {isPrivateEnrolment && (
                <EnrolmentScheduleHistoryCard
                  scheduleHistory={scheduleHistory}
                  isLoading={isLoading}
                />
              )}
            </div>
          </div>

          {/* Full Width Sections */}
          <EnrolmentLessonsCard
            lessons={lessons}
            isLoading={isLoading}
            isGroupEnrolment={!isPrivateEnrolment}
            pagination={lessonsPagination}
            lessonsLoading={lessonsLoading}
            lessonsError={lessonsError}
            onPageChange={fetchLessons}
            studentId={details?.studentId}
            studentName={details?.student}
            programId={details?.programId}
            location={location}
            autoRenewal={details?.autoRenewal}
          />

          <EnrolmentHistoryCard
            history={history}
            isLoading={isLoading}
            pagination={historyPagination}
            historyLoading={historyLoading}
            historyError={historyError}
            onPageChange={fetchHistory}
          />
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteEnrolmentModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        location={location}
        enrolmentId={id}
        enrolmentType={enrolmentType}
      />

      {/* Full Delete Modal */}
      {isPrivateEnrolment && (
        <FullDeleteEnrolmentModal
          open={isFullDeleteModalOpen}
          onOpenChange={setIsFullDeleteModalOpen}
          location={location}
          enrolmentId={id}
          studentId={details?.studentId}
        />
      )}

      {/* Email Modal - group enrolment customer statement */}
      {!isPrivateEnrolment && (
        <EmailModal
          open={isEmailModalOpen}
          onOpenChange={setIsEmailModalOpen}
          onSend={async (emailData: EmailFormData) => {
            if (!details?.studentId) {
              toast.error("Student ID is required to send email");
              return;
            }

            try {
              // EmailObject::OBJECT_CUSTOMER_STATEMENT = 8
              const response = await sendEmail(location, {
                objectId: 8,
                userId: details.studentId,
                to: emailData.recipients,
                subject: emailData.subject,
                content: emailData.content,
              });

              if (response.status) {
                toast.success("Email sent successfully");
                setIsEmailModalOpen(false);
              } else {
                const errorMessage = response.message || "Failed to send email";
                toast.error(errorMessage);
              }
            } catch (error) {
              console.error("Error sending email:", error);
              const errorMessage =
                error instanceof Error ? error.message : "Failed to send email";
              toast.error(errorMessage);
            }
          }}
          recipientEmails={customerEmails}
          locationName={location}
          initialSubject="Enrolment Statement from Arcadia Academy of Music"
          localStorageKey={`enrolment-email-${id}-${details?.studentId || "default"}`}
        />
      )}

      {/* Receive Payment Modal */}
      {details?.customerId && (
        <ReceivePaymentModal
          open={isReceivePaymentModalOpen}
          onOpenChange={setIsReceivePaymentModalOpen}
          onSave={handleReceivePayment}
          location={location}
          customerId={details.customerId.toString()}
          customerName={details.customer || ""}
        />
      )}
    </>
  );
}


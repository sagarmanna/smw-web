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
import { usePrivateLessonDetails } from "../hooks/usePrivateLessonDetails";
import { PrivateLessonDetailsCard } from "../components/PrivateLessonDetailsCard";
import { PrivateLessonStudentCard } from "../components/PrivateLessonStudentCard";
import { PrivateLessonAttendanceCard } from "../components/PrivateLessonAttendanceCard";
import { PrivateLessonCostCard } from "../components/PrivateLessonCostCard";
import { PrivateLessonScheduleCard } from "../components/PrivateLessonScheduleCard";
import { PrivateLessonDueDateCard } from "../components/PrivateLessonDueDateCard";
import { PrivateLessonTotalsCard } from "../components/PrivateLessonTotalsCard";
import { PrivateLessonPaymentsCard } from "../components/PrivateLessonPaymentsCard";
import { PrivateLessonCommentsCard } from "../components/PrivateLessonCommentsCard";
import { PrivateLessonHistoryCard } from "../components/PrivateLessonHistoryCard";
import { DeletePrivateLessonModal } from "../components/modals/DeletePrivateLessonModal";
import { ReceivePaymentModal, type ReceivePaymentData } from "@/components/modal/ReceivePaymentModal";
import { toast } from "sonner";

interface PrivateLessonDetailClientProps {
  location: string;
  id: string;
}

export function PrivateLessonDetailClient({ location, id }: PrivateLessonDetailClientProps) {
  const router = useRouter();
  const privateLessonId = id;

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.privateLesson?.isLoading || false);
  const error = useAppSelector((state) => state.privateLesson?.error);
  const privateLessonInfo = useAppSelector((state) => state.privateLesson?.privateLessonInfo);

  const {
    details,
    payments,
    comments,
    history,
    historyPagination,
    historyLoading,
    historyError,
    fetchHistory,
    saveDetails,
    savingDetails,
    saveAttendance,
    saveCost,
    saveDueDate,
    saveDiscount,
    savePrice,
  } = usePrivateLessonDetails(location, privateLessonId);

  // Email modal state for sending private lesson statements
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [customerEmails, setCustomerEmails] = React.useState<string[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = React.useState(false);

  // Receive payment modal state
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = React.useState(false);

  // Fetch customer email addresses when email modal opens
  React.useEffect(() => {
    const fetchCustomerEmails = async () => {
      if (isEmailModalOpen && details?.customerId) {
        setIsLoadingEmails(true);
        try {
          const customerId = typeof details.customerId === 'number' 
            ? details.customerId 
            : Number(details.customerId);
          
          if (customerId && !isNaN(customerId)) {
            const emails = await getCustomerEmailAddresses(location, customerId);
            setCustomerEmails(emails);
          } else {
            console.warn("Invalid customerId:", details.customerId);
            setCustomerEmails([]);
          }
        } catch (error) {
          console.error("Error fetching customer emails:", error);
          setCustomerEmails([]);
        } finally {
          setIsLoadingEmails(false);
        }
      } else if (!isEmailModalOpen) {
        // Reset emails when modal closes
        setCustomerEmails([]);
      }
    };

    fetchCustomerEmails();
  }, [isEmailModalOpen, details?.customerId, location]);

  // Fetch history on initial load - optimized dependencies
  React.useEffect(() => {
    // Only fetch if we have valid IDs and haven't loaded history yet
    if (privateLessonId && location && !historyPagination && !historyLoading) {
      fetchHistory(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [privateLessonId, location]); // Only depend on IDs, fetchHistory is stable from useCallback

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Private Lesson #${id}`;
    return `${details.program || `Private Lesson #${id}`}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Private Lessons",
        onClick: () => router.push(`/${location}/private-lessons`),
      },
    ],
    [location, router]
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const handleMailClick = React.useCallback(() => {
    setIsEmailModalOpen(true);
  }, []);

  const handleReceivePaymentClick = React.useCallback(() => {
    setIsReceivePaymentModalOpen(true);
  }, []);

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
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare group lesson payments array (IDs are already numeric from API)
      const groupLessonPaymentsArray = paymentData.groupLessonPayments
        ? Object.entries(paymentData.groupLessonPayments)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice payments array (IDs are already numeric from API, no "I-" prefix needed)
      const invoicePaymentsArray = paymentData.invoicePayments
        ? Object.entries(paymentData.invoicePayments)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare payment credits array (IDs are already numeric from API)
      const paymentCreditsArray = paymentData.paymentCredits
        ? Object.entries(paymentData.paymentCredits)
            .filter(([, value]) => value > 0)
            .map(([id, value]) => ({
              id: Number(id),
              value: formatToTwoDecimals(value),
            }))
            .filter(({ id }) => !isNaN(id) && id > 0)
        : [];

      // Prepare invoice credits array (IDs are already numeric from API)
      const invoiceCreditsArray = paymentData.invoiceCredits
        ? Object.entries(paymentData.invoiceCredits)
            .filter(([, value]) => value > 0)
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
        
        // Optionally refresh private lesson data here if needed
        // You might want to refetch private lesson details to reflect the payment
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

  const handleDeleteClick = React.useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteSuccess = React.useCallback(() => {
    router.push(`/${location}/private-lessons`);
  }, [location, router]);

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
      {
        label: "Action",
        items: [
          {
            label: "Mail",
            onClick: handleMailClick,
          },
          {
            label: "Receive Payment",
            onClick: handleReceivePaymentClick,
          },
          {
            label: "Delete",
            onClick: handleDeleteClick,
            variant: "destructive",
          },
        ],
      },
    ],
    [handleMailClick, handleReceivePaymentClick, handleDeleteClick]
  );

  // Error state - show error but still render cards with skeleton
  const showError = error && !privateLessonInfo;

  if (isLoading && !privateLessonInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading private lesson..." className="text-center" />
      </div>
    );
  }

  if (!privateLessonInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Private lesson not found"}
          title="Unable to Load Private Lesson Details"
          fallbackMessage="An unexpected error occurred while loading the private lesson details. Please try again later."
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
              title="Unable to Load Private Lesson Details"
              fallbackMessage="An unexpected error occurred while loading the private lesson details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Private lesson actions"
          showProfileIcon={false}
          profileIconSize="md"
        />

        {/* Main Content - All cards share the same cached data from Redux */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          {/* Two Column Layout: Left Column (Details, Student, Attendance, Cost) | Right Column (Schedule, Due Date, Totals) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Left Column */}
            <div className="space-y-3 sm:space-y-4">
              <PrivateLessonDetailsCard
                details={details}
                onSaveDetails={saveDetails}
                savingDetails={savingDetails}
                isLoading={isLoading}
                location={location}
              />

              <PrivateLessonStudentCard
                details={details}
                isLoading={isLoading}
                location={location}
              />

              <PrivateLessonAttendanceCard
                details={details}
                onSaveAttendance={saveAttendance}
                savingDetails={savingDetails}
                isLoading={isLoading}
              />

              <PrivateLessonCostCard
                details={details}
                onSaveCost={saveCost}
                savingDetails={savingDetails}
                isLoading={isLoading}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <PrivateLessonScheduleCard
                details={details}
                isLoading={isLoading}
                location={location}
              />

              <PrivateLessonDueDateCard
                details={details}
                onSaveDueDate={saveDueDate}
                savingDetails={savingDetails}
                isLoading={isLoading}
              />

              <PrivateLessonTotalsCard
                details={details}
                onSaveDiscount={saveDiscount}
                onSavePrice={savePrice}
                savingDetails={savingDetails}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Full Width Sections */}
          <PrivateLessonPaymentsCard
            payments={payments}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <PrivateLessonCommentsCard
              comments={comments}
              isLoading={isLoading}
            />

            <PrivateLessonHistoryCard
              history={history}
              isLoading={isLoading}
              pagination={historyPagination}
              historyLoading={historyLoading}
              historyError={historyError}
              onPageChange={fetchHistory}
            />
          </div>
        </div>
      </div>
      <DeletePrivateLessonModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        location={location}
        privateLessonId={privateLessonId}
        onDeleteSuccess={handleDeleteSuccess}
      />

      {/* Email Modal - private lesson statement */}
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
        initialSubject="Private Lesson Statement from Arcadia Academy of Music"
        localStorageKey={`private-lesson-email-${id}-${details?.studentId || "default"}`}
      />

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


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
import { GroupCostCard } from "../components/GroupCostCard";
import { GroupLessonTabsSection } from "../components/GroupLessonTabsSection";
import { PrivateLessonPayment } from "../types";
import { ReceivePaymentModal, type ReceivePaymentData } from "@/components/modal/ReceivePaymentModal";
import { PaymentReceiptModalContainer, getPaymentReceiptData } from "@/components/modal/PaymentReceiptModal";
import { getCustomerPayments } from "@/app/[location]/customers/customers.api";
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

  // Receipt payment modal state (same flow as enrollment page)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<number | string | null>(null);
  const [directPaymentReceiptData, setDirectPaymentReceiptData] = React.useState<{
    date: string;
    paymentMethod: string;
    reference: string;
    amount: number;
    lessons?: Array<{ date: string; student: string; program: string; teacher: string; amount: string; payment: string; balance: string }>;
    groupLessons?: Array<{ date: string; student: string; program: string; amount: string; balance: string }>;
    invoices?: Array<{ date: string; number: string; amount: string; payment: string; balance: string }>;
    credits?: Array<{ type: string; reference: string; paymentMethod?: string; amount: string; amountUsed: string }>;
  } | null>(null);

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

  // History is fetched once in page.tsx during initial load
  // No need to fetch here - component only displays data from Redux state

  // All hooks must be called before any early returns
  
  // Determine if this is a group lesson (must be defined before pageTitle and breadcrumbItems)
  const isGroupLesson = React.useMemo(() => {
    const result = details?.isGroup === true;
    console.log('[PrivateLessonDetailClient] Checking isGroup:', {
      'details?.isGroup': details?.isGroup,
      'isGroupLesson': result,
      'details': details
    });
    return result;
  }, [details]);

  const pageTitle = React.useMemo(() => {
    if (!details) return isGroupLesson ? `Group Lesson #${id}` : `Private Lesson #${id}`;
    return `${details.program || (isGroupLesson ? `Group Lesson #${id}` : `Private Lesson #${id}`)}`;
  }, [details, id, isGroupLesson]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: isGroupLesson ? "Group Lessons" : "Private Lessons",
        onClick: () => router.push(`/${location}/private-lessons`),
      },
    ],
    [location, router, isGroupLesson]
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const handleMailClick = React.useCallback(() => {
    setIsEmailModalOpen(true);
  }, []);

  const handleReceivePaymentClick = React.useCallback(() => {
    setIsReceivePaymentModalOpen(true);
  }, []);

  // Handle receiving payment — same flow as enrollment: call API, then open receipt from getPaymentReceiptData.
  const handleReceivePayment = React.useCallback(async (paymentData: ReceivePaymentData) => {
    if (!details?.customerId) {
      toast.error("Customer ID is required to receive payment");
      return;
    }

    try {
      const { receivePayment } = await import("@/lib/api/legacyApiAdapter");
      const paymentMethodId = Number(paymentData.paymentMethod) || 1;

      const formatToTwoDecimals = (value: number): number => Math.round(value * 100) / 100;

      const lessonPaymentsTotal = Object.values(paymentData.lessonPayments || {}).reduce((s, v) => s + v, 0);
      const groupLessonPaymentsTotal = Object.values(paymentData.groupLessonPayments || {}).reduce((s, v) => s + v, 0);
      const invoicePaymentsTotal = Object.values(paymentData.invoicePayments || {}).reduce((s, v) => s + v, 0);
      const amountNeeded = formatToTwoDecimals(lessonPaymentsTotal + groupLessonPaymentsTotal + invoicePaymentsTotal);
      const amountToDistribute = formatToTwoDecimals(amountNeeded);

      const lessonPaymentsArray =
        paymentData.lessonPayments &&
        Object.entries(paymentData.lessonPayments)
          .filter(([, v]) => v > 0)
          .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
          .filter(({ id }) => !isNaN(id) && id > 0);
      const groupLessonPaymentsArray =
        paymentData.groupLessonPayments &&
        Object.entries(paymentData.groupLessonPayments)
          .filter(([, v]) => v > 0)
          .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
          .filter(({ id }) => !isNaN(id) && id > 0);
      const invoicePaymentsArray =
        paymentData.invoicePayments &&
        Object.entries(paymentData.invoicePayments)
          .filter(([, v]) => v > 0)
          .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
          .filter(({ id }) => !isNaN(id) && id > 0);
      const paymentCreditsArray =
        paymentData.paymentCredits &&
        Object.entries(paymentData.paymentCredits)
          .filter(([, v]) => v > 0)
          .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
          .filter(({ id }) => !isNaN(id) && id > 0);
      const invoiceCreditsArray =
        paymentData.invoiceCredits &&
        Object.entries(paymentData.invoiceCredits)
          .filter(([, v]) => v > 0)
          .map(([id, value]) => ({ id: Number(id), value: formatToTwoDecimals(value) }))
          .filter(({ id }) => !isNaN(id) && id > 0);

      const selectedCreditValue = formatToTwoDecimals(
        (paymentCreditsArray?.reduce((s, c) => s + c.value, 0) ?? 0) +
          (invoiceCreditsArray?.reduce((s, c) => s + c.value, 0) ?? 0)
      );
      const amountAfterCredits = amountNeeded - selectedCreditValue;
      const calculatedAmount =
        amountAfterCredits < 0 ? (amountNeeded > 0 ? 0 : amountAfterCredits) : amountAfterCredits;
      const finalAmount =
        selectedCreditValue > 0 ? formatToTwoDecimals(calculatedAmount) : formatToTwoDecimals(paymentData.amountReceived);

      const legacyPaymentData = {
        userId: details.customerId,
        date: paymentData.date,
        paymentMethodId,
        reference: paymentData.reference || "",
        amount: finalAmount,
        amountNeeded,
        selectedCreditValue,
        amountToDistribute,
        notes: paymentData.notes || "",
        lessonPayments: lessonPaymentsArray && lessonPaymentsArray.length > 0 ? lessonPaymentsArray : undefined,
        groupLessonPayments: groupLessonPaymentsArray && groupLessonPaymentsArray.length > 0 ? groupLessonPaymentsArray : undefined,
        invoicePayments: invoicePaymentsArray && invoicePaymentsArray.length > 0 ? invoicePaymentsArray : undefined,
        paymentCredits: paymentCreditsArray && paymentCreditsArray.length > 0 ? paymentCreditsArray : undefined,
        invoiceCredits: invoiceCreditsArray && invoiceCreditsArray.length > 0 ? invoiceCreditsArray : undefined,
        canUsePaymentCredits: paymentCreditsArray && paymentCreditsArray.length > 0 ? 1 : 0,
        canUseInvoiceCredits: invoiceCreditsArray && invoiceCreditsArray.length > 0 ? 1 : 0,
        prId: "",
      };

      const response = await receivePayment(location, legacyPaymentData);

      if (response.status) {
        setIsReceivePaymentModalOpen(false);
        toast.success(`Payment of $${finalAmount.toFixed(2)} received successfully`);

        try {
          const paymentsResponse = await getCustomerPayments(location, details.customerId, 1, 1);
          if (paymentsResponse.data && paymentsResponse.data.length > 0) {
            const latestPayment = paymentsResponse.data[0] as { id?: number | string };
            const paymentId = latestPayment.id;
            if (paymentId != null) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            const receiptData = await getPaymentReceiptData(location, paymentId);

            const directData = {
              date: receiptData.info?.date ?? paymentData.date,
              paymentMethod: receiptData.info?.paymentMethod ?? "",
              reference: receiptData.info?.reference ?? paymentData.reference ?? "",
              amount: receiptData.info?.amount ?? finalAmount,
              lessons: receiptData.lessons.data.map((lesson) => ({
                date: lesson.date,
                student: lesson.student,
                program: lesson.program,
                teacher: lesson.teacher,
                amount: lesson.amount,
                payment: lesson.payment,
                balance: lesson.balance ?? "$0.00",
              })),
              groupLessons: receiptData.groupLessons.data.map((gl) => ({
                date: gl.date,
                student: gl.student,
                program: gl.program,
                amount: gl.amount,
                balance: gl.balance ?? "$0.00",
              })),
              invoices: receiptData.invoices.data.map((inv) => ({
                date: inv.date,
                number: inv.number,
                amount: inv.amount,
                payment: inv.payment,
                balance: inv.balance ?? "$0.00",
              })),
            };
            setDirectPaymentReceiptData(directData);
            setSelectedPaymentId(null);
            setIsReceiptModalOpen(true);
            }
          }
        } catch (err) {
          console.error("Error fetching payment receipt data:", err);
        }
      } else {
        toast.error(response.message ?? "Failed to receive payment");
      }
    } catch (error) {
      console.error("Error receiving payment:", error);
      toast.error(error instanceof Error ? error.message : "Failed to receive payment");
    }
  }, [details?.customerId, location]);

  const handleDeleteClick = React.useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteSuccess = React.useCallback(() => {
    router.push(`/${location}/private-lessons`);
  }, [location, router]);

  // Click payment row -> open receipt modal (view mode), same as enrollment page.
  const handlePaymentClick = React.useCallback((payment: PrivateLessonPayment) => {
    if (!payment.id || !details?.customerId) return;
    setSelectedPaymentId(payment.id);
    setDirectPaymentReceiptData(null);
    setIsReceiptModalOpen(true);
  }, [details?.customerId]);

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

        {/* Main Content - Conditional rendering based on isGroup flag */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          {isGroupLesson ? (
            // Group Lesson Layout
            <>
              {/* Two Column Layout: Left (Details, Cost) | Right (Schedule, Comments) */}
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

                  <GroupCostCard
                    costData={privateLessonInfo?.groupCost || null}
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

                  <PrivateLessonCommentsCard
                    comments={comments}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Tabs Section (Students & History) */}
              <GroupLessonTabsSection
                location={location}
                lessonId={privateLessonId}
                students={privateLessonInfo?.students || []}
                history={history}
                historyPagination={historyPagination}
                historyLoading={historyLoading}
                historyError={historyError}
                onHistoryPageChange={fetchHistory}
                isLoading={isLoading}
              />
            </>
          ) : (
            // Private Lesson Layout (Original)
            <>
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
                onPaymentClick={handlePaymentClick}
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
            </>
          )}
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

      {/* Payment Receipt Modal — view existing payment (from table row click) */}
      {details?.customerId && selectedPaymentId && !directPaymentReceiptData && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={(open) => {
            setIsReceiptModalOpen(open);
            if (!open) setSelectedPaymentId(null);
          }}
          location={location}
          customerId={details.customerId}
          paymentId={selectedPaymentId}
          customerName={details.customer ?? ""}
          mode="view"
        />
      )}

      {/* Payment Receipt Modal — new payment (after Receive Payment, bypass POST) */}
      {details?.customerId && directPaymentReceiptData && (
        <PaymentReceiptModalContainer
          open={isReceiptModalOpen}
          onOpenChange={(open) => {
            setIsReceiptModalOpen(open);
            if (!open) setDirectPaymentReceiptData(null);
          }}
          location={location}
          customerId={details.customerId}
          customerName={details.customer ?? ""}
          mode="new"
          directPaymentData={directPaymentReceiptData}
        />
      )}
    </>
  );
}


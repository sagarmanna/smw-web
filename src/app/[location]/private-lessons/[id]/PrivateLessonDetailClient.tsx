"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { EmailModal, type EmailFormData } from "@/components/EmailModal";
import { sendEmail } from "@/lib/api/legacyApiAdapter";
import { getCustomerEmailAddresses } from "@/lib/api/customer.api";
import { usePrivateLessonDetails } from "../hooks/usePrivateLessonDetails";
import { fetchEmailStatement } from "./private-lesson-details.slice";
import { generateEmailContent } from "./utils/emailStatementHtmlGenerator";
import {
  explodePrivateLesson,
  getPrivateLessonExplodeStatus,
} from "./private-lesson-details.api";
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
  const dispatch = useAppDispatch();
  const privateLessonId = id;

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.privateLesson?.isLoading || false);
  const error = useAppSelector((state) => state.privateLesson?.error);
  const privateLessonInfo = useAppSelector((state) => state.privateLesson?.privateLessonInfo);

  const {
    details,
    payments,
    paymentsLoading,
    paymentsSorting,
    setPaymentsSortingHandler,
    comments,
    commentsPagination,
    commentsLoading,
    commentsError,
    commentsSubmitting,
    fetchComments,
    addComment,
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
    saveTax,
    savePrice,
    saveGroupStudentDiscount,
    saveUnschedule,
  } = usePrivateLessonDetails(location, privateLessonId);

  // selectors for email statement data loaded from slice
  const emailStatement = useAppSelector((state) => state.privateLesson.emailStatement);
  const emailStatementLoading = useAppSelector((state) => state.privateLesson.emailStatementLoading);
  const emailStatementError = useAppSelector((state) => state.privateLesson.emailStatementError);

  // Email modal state for sending private lesson statements
  const [isEmailModalOpen, setIsEmailModalOpen] = React.useState(false);
  const [customerEmails, setCustomerEmails] = React.useState<string[]>([]);

  // memoized subject/content similar to group course detail page
  const emailSubject = React.useMemo(() => {
    return emailStatement?.emailTemplate?.subject || "";
  }, [emailStatement]);

  // extract header and footer separately so the modal can render them readonly
  const emailHeaderHtml = React.useMemo(() => {
    const header = emailStatement?.emailTemplate?.header?.trim() || "";
    return header;
  }, [emailStatement]);

  const emailContent = React.useMemo(() => {
    if (!emailStatement) return "";
    // generate complete html including header/footer; we still render them outside editor
    const content = generateEmailContent(emailStatement);
    return content;
  }, [emailStatement, isEmailModalOpen]);

  const recipientEmails = React.useMemo(() => {
    // if template defines a "to" list use that first (comma-separated string),
    // otherwise fall back to the explicit emails array or the customer addresses.
    const toField = emailStatement?.emailTemplate?.to;
    if (toField && toField.trim() !== "") {
      return toField
        .split(",")
        .map((e) => e.trim())
        .filter((e) => e);
    }

    return emailStatement?.emails || customerEmails;
  }, [emailStatement, customerEmails]);

  // Receive payment modal state
  const [isReceivePaymentModalOpen, setIsReceivePaymentModalOpen] = React.useState(false);

  // Receipt payment modal state (same flow as enrollment page)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = React.useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = React.useState<number | string | null>(null);
  const [explodeStatus, setExplodeStatus] = React.useState<{
    canExplode: boolean;
    isExploded: boolean;
  }>({
    canExplode: false,
    isExploded: false,
  });
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

  // Redirect to group-lessons route if this lesson is actually a group lesson
  React.useEffect(() => {
    if (details?.isGroup === true) {
      router.replace(`/${location}/group-lessons/${id}`);
    }
  }, [details?.isGroup, location, id, router]);

  const refreshExplodeStatus = React.useCallback(async () => {
    const response = await getPrivateLessonExplodeStatus(location, privateLessonId);
    const firstStatus = response?.data?.status?.[0];
    const checks = firstStatus?.checks;

    setExplodeStatus({
      canExplode:
        firstStatus?.canExplode === true &&
        checks?.isUnscheduled === true &&
        checks?.notExploded !== false,
      isExploded: checks?.notExploded === false,
    });
  }, [location, privateLessonId]);

  React.useEffect(() => {
    refreshExplodeStatus();
  }, [refreshExplodeStatus, details?.status]);

  // Fetch customer email addresses when email modal opens
  React.useEffect(() => {
    const fetchCustomerEmails = async () => {
      if (isEmailModalOpen && details?.customerId) {
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

  const pageTitle = React.useMemo(() => {
    if (!details) return `Private Lesson #${id}`;
    return details.program || `Private Lesson #${id}`;
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
    // fetch data if not already loaded
    if (!emailStatement && !emailStatementLoading) {
      dispatch(fetchEmailStatement({ location, privateLessonId }));
    }
    setIsEmailModalOpen(true);
  }, [dispatch, emailStatement, emailStatementLoading, location, privateLessonId]);

  const handleRetryEmailStatement = React.useCallback(() => {
    dispatch(fetchEmailStatement({ location, privateLessonId }));
  }, [dispatch, location, privateLessonId]);

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

  const handleExplodeClick = React.useCallback(async () => {
    const result = await explodePrivateLesson(location, privateLessonId);
    if (!result || !result.success) {
      toast.error(result?.message || "Failed to explode lesson");
      return;
    }

    const message = result.message || "Lesson exploded successfully";
    toast.success(message);

      const finalStudentId =
        typeof result.data?.studentId === "number" && !Number.isNaN(result.data.studentId)
          ? result.data.studentId
          : undefined;

      if (finalStudentId) {
        setTimeout(() => {
          router.push(`/${location}/students/${finalStudentId}`);
        }, 100);
        return;
      }

      // Fallback matches other modules: go back to list if student id is unavailable.
      setTimeout(() => {
        router.push(`/${location}/private-lessons`);
      }, 100);
    }, [location, privateLessonId, router]);

  const handleUnscheduleWithStatusRefresh = React.useCallback(async (reason: string) => {
    const success = await saveUnschedule(reason);
    if (success) {
      await refreshExplodeStatus();
    }
    return success;
  }, [saveUnschedule, refreshExplodeStatus]);

  // Click payment row -> open receipt modal (view mode), same as enrollment page.
  const handlePaymentClick = React.useCallback((payment: PrivateLessonPayment) => {
    if (!payment.id || !details?.customerId) return;
    setSelectedPaymentId(payment.id);
    setDirectPaymentReceiptData(null);
    setIsReceiptModalOpen(true);
  }, [details?.customerId]);

  const explodedFromStatusText = React.useMemo(
    () => details?.status?.toLowerCase().includes("exploded") ?? false,
    [details?.status]
  );
  const isAbsentOrCompletedStatus = React.useMemo(() => {
    const status = details?.status?.toLowerCase() || "";
    return status.includes("absent") || status.includes("completed");
  }, [details?.status]);
  const isUnscheduledStatus = React.useMemo(() => {
    const normalizedStatus = (details?.status || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
    return (
      normalizedStatus === "unscheduled" ||
      normalizedStatus === "unscheduled (exploded)"
    );
  }, [details?.status]);
  const isExploded = explodeStatus.isExploded || explodedFromStatusText;
  const shouldShowExplode = explodeStatus.canExplode && !isExploded;

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(() => {
    const items = [
      {
        label: "Mail",
        onClick: handleMailClick,
      },
      {
        label: "Receive Payment",
        onClick: handleReceivePaymentClick,
      },
      ...(shouldShowExplode
        ? [
            {
              label: "Explode",
              onClick: handleExplodeClick,
            },
          ]
        : []),
      ...(!isAbsentOrCompletedStatus
        ? [
            {
              label: "Delete",
              onClick: handleDeleteClick,
              variant: "destructive" as const,
            },
          ]
        : []),
    ];

    return [
      {
        label: "Action",
        items,
      },
    ];
  }, [
    handleMailClick,
    handleReceivePaymentClick,
    shouldShowExplode,
    handleExplodeClick,
    isAbsentOrCompletedStatus,
    handleDeleteClick,
  ]);

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

        {/* Private Lesson Layout */}
        <div className="space-y-3 sm:space-y-4 mt-4">
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

              {!isUnscheduledStatus ? (
                <PrivateLessonAttendanceCard
                  details={details}
                  onSaveAttendance={saveAttendance}
                  savingDetails={savingDetails}
                  isLoading={isLoading}
                />
              ) : null}

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
                isExploded={isExploded}
                onUnschedule={handleUnscheduleWithStatusRefresh}
              />

              <PrivateLessonDueDateCard
                details={details}
                onSaveDueDate={saveDueDate}
                savingDetails={savingDetails}
                isLoading={isLoading}
              />

              <PrivateLessonTotalsCard
                location={location}
                details={details}
                onSaveDiscount={saveDiscount}
                onSavePrice={savePrice}
                onSaveTax={saveTax}
                savingDetails={savingDetails}
                isLoading={isLoading}
              />
            </div>
          </div>

          <PrivateLessonPaymentsCard
            payments={payments}
            isLoading={paymentsLoading}
            sorting={paymentsSorting}
            onSortingChange={setPaymentsSortingHandler}
            onPaymentClick={handlePaymentClick}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <PrivateLessonCommentsCard
              comments={comments}
              isLoading={commentsLoading || isLoading}
              commentsError={commentsError}
              pagination={commentsPagination}
              onPageChange={fetchComments}
              onAddComment={addComment}
              isSubmitting={commentsSubmitting}
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
      {/* overlay while loading or error state similar to enrolment page */}
      {isEmailModalOpen && emailStatementLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <LoadingAnimation size="md" text="Loading email statement..." />
          </div>
        </div>
      )}

      {isEmailModalOpen && emailStatementError && !emailStatementLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg max-w-md">
            <ErrorDisplay
              error={emailStatementError}
              title="Failed to Load Email Statement"
              fallbackMessage="Unable to load email statement data. Please try again."
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleRetryEmailStatement}
                className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={() => setIsEmailModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <EmailModal
        open={
          isEmailModalOpen &&
          !emailStatementLoading &&
          !!emailStatement &&
          !emailStatementError
        }
        onOpenChange={setIsEmailModalOpen}
        onSend={async (emailData: EmailFormData) => {
          if (!details?.studentId) {
            toast.error("Student ID is required to send email");
            return;
          }

          try {
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
        recipientEmails={recipientEmails}
        locationName={location}
        initialSubject={emailSubject || undefined}
        initialContent={emailContent || undefined}
        headerHtml={emailHeaderHtml || undefined}
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


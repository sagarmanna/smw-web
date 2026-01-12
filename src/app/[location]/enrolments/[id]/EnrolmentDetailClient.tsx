"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useEnrolmentDetails } from "../hooks/useEnrolmentDetails";
import { EnrolmentDetailsCard } from "../components/EnrolmentDetailsCard";
import { EnrolmentDiscountsCard } from "../components/EnrolmentDiscountsCard";
import { EnrolmentPaymentFrequencyCard } from "../components/EnrolmentPaymentFrequencyCard";
import { EnrolmentScheduleCard } from "../components/EnrolmentScheduleCard";
import { EnrolmentScheduleHistoryCard } from "../components/EnrolmentScheduleHistoryCard";
import { EnrolmentLessonsCard } from "../components/EnrolmentLessonsCard";
import { EnrolmentHistoryCard } from "../components/EnrolmentHistoryCard";
import { DeleteEnrolmentModal } from "../components/modals/DeleteEnrolmentModal";
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
    history,
    historyPagination,
    historyLoading,
    historyError,
    fetchHistory,
    saveDetails,
    savingDetails,
    adjustScheduleEndDate,
    changeSchedulePermanently,
    saveDiscounts,
    savePaymentFrequency,
  } = useEnrolmentDetails(location, id);

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
          // Placeholder for receive payment - will be implemented in future
          toast.info("This feature is in development.");
        },
      },
      {
        label: ENROLMENT_MESSAGES.ACTION_DELETE,
        onClick: () => {
          toast.info("This feature is in development.");
          // setIsDeleteModalOpen(true);
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
                // Placeholder for mail - will be implemented in future
                  toast.info("Mail functionality coming soon");
                },
            },
          ]
        : [
            ...commonItems,
            {
              label: ENROLMENT_MESSAGES.ACTION_FULL_DELETE,
              onClick: () => {
                // Placeholder for full delete - will be implemented in future
                toast.info("This feature is in development.");
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
                onAdjustEndDate={adjustScheduleEndDate}
                onChangeSchedulePermanently={changeSchedulePermanently}
                saving={savingDetails}
                isLoading={isLoading}
                enrolmentType={enrolmentType}
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
      />
    </>
  );
}


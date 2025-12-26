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

interface EnrolmentDetailClientProps {
  location: string;
  id: string;
}

export function EnrolmentDetailClient({ location, id }: EnrolmentDetailClientProps) {
  const router = useRouter();
  const enrolmentId = id;

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
    saveDetails,
    savingDetails,
    adjustScheduleEndDate,
    changeSchedulePermanently,
    saveDiscounts,
    savePaymentFrequency,
  } = useEnrolmentDetails(location, enrolmentId);

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

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
      {
        label: "Action",
        items: [
          {
            label: "Delete",
            onClick: () => {
              // TODO: Implement delete enrolment functionality
              console.log("Delete enrolment");
            },
            variant: "destructive",
          },
        ],
      },
    ],
    []
  );

  // Error state - show error but still render cards with skeleton
  const showError = error && !enrolmentInfo;

  if (isLoading && !enrolmentInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading enrolment..." className="text-center" />
      </div>
    );
  }

  if (!enrolmentInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Enrolment not found"}
          title="Unable to Load Enrolment Details"
          fallbackMessage="An unexpected error occurred while loading the enrolment details. Please try again later."
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
              title="Unable to Load Enrolment Details"
              fallbackMessage="An unexpected error occurred while loading the enrolment details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Enrolment actions"
          showProfileIcon={false}
          profileIconSize="md"
        />

        {/* Main Content - All cards share the same cached data from Redux */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          {/* Two Column Layout: Left Column (Details, Discounts, Payment Frequency) | Right Column (Schedule, Schedule History) */}
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
              />

              <EnrolmentDiscountsCard
                discounts={discounts}
                schedule={schedule}
                details={details}
                onSaveDiscounts={saveDiscounts}
                savingDiscounts={savingDetails}
                isLoading={isLoading}
              />

              <EnrolmentPaymentFrequencyCard
                paymentFrequency={paymentFrequency}
                isLoading={isLoading}
                onSavePaymentFrequency={savePaymentFrequency}
                savingPaymentFrequency={savingDetails}
                location={location}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-3 sm:space-y-4">
              <EnrolmentScheduleCard
                schedule={schedule}
                onAdjustEndDate={adjustScheduleEndDate}
                onChangeSchedulePermanently={changeSchedulePermanently}
                saving={savingDetails}
                isLoading={isLoading}
              />

              <EnrolmentScheduleHistoryCard
                scheduleHistory={scheduleHistory}
                isLoading={isLoading}
              />
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
          />
        </div>
      </div>
    </>
  );
}


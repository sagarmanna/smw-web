"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
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
  } = usePrivateLessonDetails(location, privateLessonId);

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

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
      {
        label: "Action",
        items: [
          {
            label: "Delete",
            onClick: () => {
              // TODO: Implement delete private lesson functionality
              console.log("Delete private lesson");
            },
            variant: "destructive",
          },
        ],
      },
    ],
    []
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
    </>
  );
}


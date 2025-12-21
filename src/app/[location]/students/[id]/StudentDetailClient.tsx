"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useStudentDetails } from "../hooks/useStudentDetails";
import { StudentDetailsCard } from "../components/StudentDetailsCard";
import { StudentCustomerCard } from "../components/StudentCustomerCard";
import { StudentEnrolmentsCard } from "../components/StudentEnrolmentsCard";
import { StudentEvaluationsCard } from "../components/StudentEvaluationsCard";
import { StudentTabsSection } from "../components/StudentTabsSection";
import { isDev } from "@/utils/env";

interface StudentDetailClientProps {
  location: string;
  id: string;
}


export function StudentDetailClient({ location, id }: StudentDetailClientProps) {
  const router = useRouter();
  const studentId = id;

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.student.isLoading);
  const error = useAppSelector((state) => state.student.error);
  const studentInfo = useAppSelector((state) => state.student.studentInfo);

  const {
    details,
    customer,
    enrolments,
    evaluations,
    evaluationsPagination,
    saveDetails,
    savingDetails,
    refresh,
  } = useStudentDetails(location, studentId);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Student #${id}`;
    return `${details.firstName} ${details.lastName}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Students",
        onClick: () => router.push(`/${location}/students`),
      },
    ],
    [location, router]
  );

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [],
    []
  );


  // Error state - show error but still render cards with skeleton
  const showError = error && !studentInfo;

  if (isLoading && !studentInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading student..." className="text-center" />
      </div>
    );
  }

  if (!studentInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Student not found"}
          title="Unable to Load Student Details"
          fallbackMessage="An unexpected error occurred while loading the student details. Please try again later."
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
              title="Unable to Load Student Details"
              fallbackMessage="An unexpected error occurred while loading the student details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Student actions"
          showProfileIcon={true}
          profileIconSize="md"
        />

        {/* Main Content - All cards share the same cached data from Redux */}
        <div className="space-y-3 sm:space-y-4 mt-4">
          {/* Top Row - Details and Customer Cards Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            <StudentDetailsCard
              details={details}
              onSaveDetails={saveDetails}
              savingDetails={savingDetails}
              isLoading={isLoading}
              location={location}
              studentId={studentId}
              customerId={customer?.customerId ?? 0}
            />

            <StudentCustomerCard
              customer={customer?.customer || ""}
              phone={customer?.phone || ""}
              customerId={customer?.customerId}
              location={location}
              isLoading={isLoading}
            />
          </div>

          {/* Full Width Sections */}
          <StudentEnrolmentsCard
            enrolments={enrolments}
            isLoading={isLoading}
            location={location}
            studentId={studentId}
            customerId={customer?.customerId ?? 0}
            onRefresh={refresh}
          />

          <StudentEvaluationsCard
            evaluations={evaluations}
            evaluationsPagination={evaluationsPagination}
            isLoading={isLoading}
            studentName={details ? `${details.firstName} ${details.lastName}` : undefined}
            location={location}
            studentId={studentId}
            details={details}
          />
        </div>

        {/* Tabs Section */}
        {isDev() && <StudentTabsSection location={location} studentId={studentId} />}
      </div>
    </>
  );
}

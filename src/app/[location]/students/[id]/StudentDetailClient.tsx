"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";
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
import { StudentEvaluation } from "../types";
import { toast } from "sonner";
import { addEvaluation } from "./students-details.slice";

interface StudentDetailClientProps {
  location: string;
  id: string;
}


export function StudentDetailClient({ location, id }: StudentDetailClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
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

  const [savingEvaluation, setSavingEvaluation] = React.useState(false);

  const handleSaveEvaluation = React.useCallback(
    async (evaluation: StudentEvaluation): Promise<boolean> => {
      try {
        setSavingEvaluation(true);
        
        // Check if this is an update (evaluation exists in the list) or a new one
        const existingIndex = evaluations.findIndex(
          (e) => e.examDate === evaluation.examDate && 
                 e.level === evaluation.level &&
                 e.program === evaluation.program
        );
        
        // Optimistically update evaluation in the store immediately
        if (existingIndex >= 0) {
          // Update existing - TODO: Implement updateEvaluation action
          // For now, just refresh
        } else {
          // Add new - optimistically add evaluation to the store immediately
          dispatch(addEvaluation(evaluation));
        }
        
        // TODO: Implement save evaluation API call
        // Example: await saveStudentEvaluation(location, studentId, evaluation);
        console.log("Saving evaluation:", evaluation);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Refresh evaluations to get the latest data from the server
        // This ensures we have the correct data if the server modifies it
        await refresh();
        
        return true;
      } catch (error) {
        console.error("Failed to save evaluation:", error);
        toast.error("Failed to save evaluation. Please try again.");
        // Refresh to revert optimistic update if API call failed
        await refresh();
        return false;
      } finally {
        setSavingEvaluation(false);
      }
    },
    [dispatch, refresh, evaluations]
  );

  const handleDeleteEvaluation = React.useCallback(
    async (evaluation: StudentEvaluation): Promise<boolean> => {
      try {
        setSavingEvaluation(true);
        
        // TODO: Implement delete evaluation API call
        // Example: await deleteStudentEvaluation(location, studentId, evaluation);
        console.log("Deleting evaluation:", evaluation);
        
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Refresh evaluations to get the latest data from the server
        await refresh();
        
        return true;
      } catch (error) {
        console.error("Failed to delete evaluation:", error);
        toast.error("Failed to delete evaluation. Please try again.");
        return false;
      } finally {
        setSavingEvaluation(false);
      }
    },
    [refresh]
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
          />

          <StudentEvaluationsCard
            evaluations={evaluations}
            onSave={handleSaveEvaluation}
            onDelete={handleDeleteEvaluation}
            isLoading={isLoading}
            studentName={details ? `${details.firstName} ${details.lastName}` : undefined}
            saving={savingEvaluation}
            location={location}
            details={details}
          />
        </div>

        {/* Tabs Section */}
        <StudentTabsSection location={location} studentId={studentId} />
      </div>
    </>
  );
}

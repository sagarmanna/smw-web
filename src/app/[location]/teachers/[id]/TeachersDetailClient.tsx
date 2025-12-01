"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useTeacherDetails } from "../hooks/useTeacherDetails";
import { TeachersDetailCard } from "../components/TeachersDetailCard";
import { TeacherEmailCard } from "../components/TeacherEmailCard";
import { TeacherPhoneCard } from "../components/TeacherPhoneCard";
import { TeacherAddressCard } from "../components/TeacherAddressCard";
import { formatFullName } from "../utils/nameUtils";

interface TeachersDetailClientProps {
  location: string;
  id: string;
}


export function TeachersDetailClient({ location, id }: TeachersDetailClientProps) {
  const router = useRouter();
  const teacherId = Number(id);

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.teacher.isLoading);
  const error = useAppSelector((state) => state.teacher.error);
  const teacherInfo = useAppSelector((state) => state.teacher.teacherInfo);

  const {
    details,
    emails,
    phones,
    addresses,
    saveDetails,
    updatePassword,
    savingDetails,
    updateEmails,
    updatePhones,
    updateAddresses,
  } = useTeacherDetails(location, teacherId);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    const fullName = formatFullName(details?.firstName, details?.lastName);
    return fullName || `Teacher #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Teachers",
        onClick: () => router.push(`/${location}/teachers`),
      },
    ],
    [location, router]
  );

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
    {
      label: "Actions",
      items: [
        {
          label: "Delete",
          onClick: () => {
              // TODO: implement delete behaviour
          },
          variant: "destructive",
        },
      ],
    },
    ],
    []
  );

  // Error state - show error but still render cards with skeleton
  const showError = error && !teacherInfo;

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        {showError && (
          <div className="mb-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Teacher Details"
              fallbackMessage="An unexpected error occurred while loading the teacher details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Teacher actions"
          showProfileIcon={true}
          profileIconSize="md"
        />

        {/* Main Content Grid - All cards share the same cached data from Redux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4 lg:items-start">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Details Card */}
            <TeachersDetailCard
              details={details}
              onSaveDetails={saveDetails}
              onUpdatePassword={updatePassword}
              savingDetails={savingDetails}
              isLoading={isLoading}
            />

            {/* Mobile Email and Phone Cards - Only on Mobile */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              <TeacherEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
              />

              <TeacherPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
              />
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-3 sm:space-y-4">
            {/* Desktop Email and Phone Cards */}
            <div className="hidden lg:block">
              <TeacherEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
              />
            </div>

            <div className="hidden lg:block">
              <TeacherPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
              />
            </div>

            <TeacherAddressCard
              addresses={addresses}
              onUpdate={updateAddresses}
              loading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
}





"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/redux/hooks";
import { toast } from "sonner";
import { DetailHeaderWithProfile } from "@/app/[location]/customers/components/DetailHeaderWithProfile";
import { ActionMenuGroup } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { useTeacherDetails } from "../hooks/useTeacherDetails";
import { TeachersDetailCard } from "../components/TeachersDetailCard";
import UserProfileEmailCard from "@/app/user/profile/components/cards/UserProfileEmailCard";
import { TeacherPhoneCard } from "../components/TeacherPhoneCard";
import { TeacherAddressCard } from "../components/TeacherAddressCard";
import { TeacherPrivateQualificationCard } from "../components/TeacherPrivateQualificationCard";
import { TeacherGroupQualificationCard } from "../components/TeacherGroupQualificationCard";
import { TeacherTabsSection } from "../components/TeacherTabsSection";
import { formatFullName } from "../utils/nameUtils";
import { deleteUserByRole } from "@/lib/api/user.api";

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
    privateQualifications,
    groupQualifications,
    saveDetails,
    updatePassword,
    savingDetails,
    updateEmails,
    updatePhones,
    updateAddresses,
    updatePrivateQualifications,
    updateGroupQualifications,
    refresh,
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

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(async () => {
    setIsDeleting(true);
    try {
      const response = await deleteUserByRole(location, teacherId, 'teacher');
      
      if (response.success) {
        toast.success(response.message || "Teacher deleted successfully");
        // Redirect to teachers list
        router.push(`/${location}/teachers`);
      } else {
        toast.error(response.message || "Failed to delete teacher");
      }
    } catch (error: unknown) {
      const errorResponse = error as { errorCode?: string; message?: string };
      const errorMessage = errorResponse.message || "Failed to delete teacher";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [location, teacherId, router]);

  const actionMenuGroups = React.useMemo<ActionMenuGroup[]>(
    () => [
    {
      label: "Action",
      items: [
        {
          label: "Delete",
          onClick: handleDeleteClick,
          variant: "destructive",
        },
      ],
    },
    ],
    [handleDeleteClick]
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <TeachersDetailCard
              details={details}
              onSaveDetails={saveDetails}
              onUpdatePassword={updatePassword}
              savingDetails={savingDetails}
              isLoading={isLoading}
            />

            <TeacherPrivateQualificationCard
              qualifications={privateQualifications}
              onUpdate={updatePrivateQualifications}
              loading={isLoading}
              location={location}
              teacherId={teacherId}
            />

            <TeacherGroupQualificationCard
              qualifications={groupQualifications}
              onUpdate={updateGroupQualifications}
              loading={isLoading}
              location={location}
              teacherId={teacherId}
            />
            {/* Mobile Email and Phone Cards - Only on Mobile */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              <UserProfileEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                entityId={teacherId}
            />

              <TeacherPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                teacherId={teacherId}
                onRefresh={refresh}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Desktop Email and Phone Cards */}
            <div className="hidden lg:block">
              <UserProfileEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                entityId={teacherId}
            />
            </div>

            <div className="hidden lg:block">
              <TeacherPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                teacherId={teacherId}
                onRefresh={refresh}
              />
            </div>

            <TeacherAddressCard
              addresses={addresses}
              onUpdate={updateAddresses}
              loading={isLoading}
              location={location}
              teacherId={teacherId}
              onRefresh={refresh}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <TeacherTabsSection location={location} teacherId={teacherId} />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this teacher?"
        description="This action cannot be undone. The teacher and all associated data will be permanently deleted."
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}





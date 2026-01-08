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
import { useAdministratorDetails } from "../hooks/useAdministratorDetails";
import { AdministratorTabsSection } from "../components/AdministratorTabsSection";
import { createAdministratorDetailPageConfig } from "./config/detailPageConfig";
import { store } from "@/redux/store";
import { formatFullName } from "../utils/nameUtils";
import { UserDetailsCard } from "@/components/user-details/cards/UserDetailsCard";
import { UserEmailCard } from "@/components/user-details/cards/UserEmailCard";
import { UserPhoneCard } from "@/components/user-details/cards/UserPhoneCard";
import { UserAddressCard } from "@/components/user-details/cards/UserAddressCard";
import { EditUserDetailsModal } from "@/components/user-details/modals/EditUserDetailsModal";
import { CreateEmailModal } from "@/components/user-details/modals/CreateEmailModal";
import { CreatePhoneModal } from "@/components/user-details/modals/CreatePhoneModal";
import { CreateAddressModal } from "@/components/user-details/modals/CreateAddressModal";
import { EmailList, PhoneList, AddressList } from "../components/sections";
import { useEmailHandlers, usePhoneHandlers, useAddressHandlers } from "../hooks/useAdministratorItemHandlers";

interface AdministratorDetailClientProps {
  location: string;
  id: string;
}

export function AdministratorDetailClient({ location, id }: AdministratorDetailClientProps) {
  const router = useRouter();
  const administratorId = Number(id);

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.administrator.isLoading);
  const error = useAppSelector((state) => state.administrator.error);
  const administratorInfo = useAppSelector((state) => state.administrator.administratorInfo);

  // Create config with Redux-aware adapter (uses Redux state instead of making GET requests)
  // Memoized with empty deps - config is stable and only depends on store.getState which is stable
  const administratorDetailPageConfig = React.useMemo(
    () => createAdministratorDetailPageConfig(() => store.getState()),
    []
  );

  const {
    details,
    emails,
    phones,
    addresses,
    saveDetails,
    savingDetails,
    updateEmails,
    updatePhones,
    updateAddresses,
  } = useAdministratorDetails(location, administratorId);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Administrator #${id}`;
    return formatFullName(details.firstName, details.lastName) || `Administrator #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Administrators",
        onClick: () => router.push(`/${location}/administrators`),
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
      const deleteEndpoint = administratorDetailPageConfig.deleteEndpoint;
      const response = await deleteEndpoint(location, administratorId);
      
      if (response?.success) {
        toast.success(response.message || "Administrator deleted successfully");
        // Redirect to administrators list
        router.push(`/${location}/administrators`);
      } else {
        toast.error(response?.message || "Failed to delete administrator");
      }
    } catch (error: unknown) {
      const errorResponse = error as { errorCode?: string; message?: string };
      const errorMessage = errorResponse.message || "Failed to delete administrator";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, administratorId, router]);

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
  const showError = error && !administratorInfo;

  if (isLoading && !administratorInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading administrator..." className="text-center" />
      </div>
    );
  }

  if (!administratorInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Administrator not found"}
          title="Unable to Load Administrator Details"
          fallbackMessage="An unexpected error occurred while loading the administrator details. Please try again later."
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
              title="Unable to Load Administrator Details"
              fallbackMessage="An unexpected error occurred while loading the administrator details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Administrator actions"
          showProfileIcon={true}
          profileIconSize="md"
        />

        {/* Main Content Grid - All cards share the same cached data from Redux */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mt-4">
          {/* Left Column */}
          <div className="space-y-3 sm:space-y-4">
            <UserDetailsCard
              details={details}
              config={{
                defaultRole: administratorDetailPageConfig.defaultRole,
                roleLabel: administratorDetailPageConfig.roleLabel,
              }}
              onSaveDetails={saveDetails}
              savingDetails={savingDetails}
              isLoading={isLoading}
              EditModal={(props) => (
                <EditUserDetailsModal
                  {...props}
                  title="Edit Administrator Details"
                  defaultRole={administratorDetailPageConfig.defaultRole}
                />
              )}
              formatName={(d) => formatFullName(d?.firstName, d?.lastName) || ""}
            />

            {/* Mobile Email and Phone Cards - Only on Mobile */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              <UserEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                entityId={administratorId}
                CreateModal={(props) => (
                  <CreateEmailModal
                    {...props}
                    apiAdapter={administratorDetailPageConfig.apiAdapter}
                    validateEmail={administratorDetailPageConfig.validateEmail}
                  />
                )}
                EmailList={EmailList}
                useEmailHandlers={useEmailHandlers}
              />

              <UserPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                entityId={administratorId}
                CreateModal={(props) => (
                  <CreatePhoneModal
                    {...props}
                    apiAdapter={administratorDetailPageConfig.apiAdapter}
                  />
                )}
                PhoneList={PhoneList}
                usePhoneHandlers={usePhoneHandlers}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-3 sm:space-y-4">
            {/* Desktop Email and Phone Cards */}
            <div className="hidden lg:block">
              <UserEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                entityId={administratorId}
                CreateModal={(props) => (
                  <CreateEmailModal
                    {...props}
                    apiAdapter={administratorDetailPageConfig.apiAdapter}
                    validateEmail={administratorDetailPageConfig.validateEmail}
                  />
                )}
                EmailList={EmailList}
                useEmailHandlers={useEmailHandlers}
              />
            </div>

            <div className="hidden lg:block">
              <UserPhoneCard
                phones={phones}
                onUpdate={updatePhones}
                loading={isLoading}
                location={location}
                entityId={administratorId}
                CreateModal={(props) => (
                  <CreatePhoneModal
                    {...props}
                    apiAdapter={administratorDetailPageConfig.apiAdapter}
                  />
                )}
                PhoneList={PhoneList}
                usePhoneHandlers={usePhoneHandlers}
              />
            </div>

            <UserAddressCard
              addresses={addresses}
              onUpdate={updateAddresses}
              loading={isLoading}
              location={location}
              entityId={administratorId}
              CreateModal={(props) => (
                <CreateAddressModal
                  {...props}
                  apiAdapter={administratorDetailPageConfig.apiAdapter}
                />
              )}
              AddressList={AddressList}
              useAddressHandlers={useAddressHandlers}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <AdministratorTabsSection location={location} administratorId={administratorId} />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this administrator?"
        description="This action cannot be undone. The administrator and all associated data will be permanently deleted."
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}


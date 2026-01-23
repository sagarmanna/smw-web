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
import { useStaffMemberDetails } from "../hooks/useStaffMemberDetails";
import { StaffMemberTabsSection } from "../components/StaffMemberTabsSection";
import { createStaffMemberDetailPageConfig } from "./config/detailPageConfig";
import { formatFullName } from "../utils/nameUtils";
import { store } from "@/redux/store";
import { UserDetailsCard } from "@/components/user-details/cards/UserDetailsCard";
import { UserEmailCard } from "@/components/user-details/cards/UserEmailCard";
import { UserPhoneCard } from "@/components/user-details/cards/UserPhoneCard";
import { UserAddressCard } from "@/components/user-details/cards/UserAddressCard";
import { EditUserDetailsModal } from "@/components/user-details/modals/EditUserDetailsModal";
import { CreateEmailModal } from "@/components/user-details/modals/CreateEmailModal";
import { CreatePhoneModal } from "@/components/user-details/modals/CreatePhoneModal";
import { CreateAddressModal } from "@/components/user-details/modals/CreateAddressModal";
import { EmailList, PhoneList, AddressList } from "../components/sections";
import { useEmailHandlers, usePhoneHandlers, useAddressHandlers } from "../hooks/useStaffMemberItemHandlers";
import { EditStaffMemberLoginModal } from "../components/modals/EditStaffMemberLoginModal";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { setUserPassword, type SetPasswordErrorResponse } from "@/lib/api/user.api";

interface StaffMemberDetailClientProps {
  location: string;
  id: string;
}

export function StaffMemberDetailClient({ location, id }: StaffMemberDetailClientProps) {
  const router = useRouter();
  const staffMemberId = Number(id);

  // Get loading and error from Redux - single source of truth
  const isLoading = useAppSelector((state) => state.staffMemberDetails.isLoading);
  const error = useAppSelector((state) => state.staffMemberDetails.error);
  const staffMemberInfo = useAppSelector((state) => state.staffMemberDetails.staffMemberInfo);

  // Create config with Redux-aware adapter (uses Redux state instead of making GET requests)
  // Memoized with empty deps - config is stable and only depends on store.getState which is stable
  const staffMemberDetailPageConfig = React.useMemo(
    () => createStaffMemberDetailPageConfig(() => store.getState()),
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
    refresh,
  } = useStaffMemberDetails(location, staffMemberId);

  // All hooks must be called before any early returns
  const pageTitle = React.useMemo(() => {
    if (!details) return `Staff Member #${id}`;
    return formatFullName(details.firstName, details.lastName) || `Staff Member #${id}`;
  }, [details, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Staff Members",
        onClick: () => router.push(`/${location}/staff-members`),
      },
    ],
    [location, router]
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isEditLoginModalOpen, setIsEditLoginModalOpen] = React.useState(false);

  const handleDeleteClick = React.useCallback(() => {
    setShowDeleteConfirm(true);
  }, []);

  const handleDeleteConfirm = React.useCallback(async () => {
    setIsDeleting(true);
    try {
      const deleteEndpoint = staffMemberDetailPageConfig.deleteEndpoint;
      const response = await deleteEndpoint(location, staffMemberId);
      
      if (response?.success) {
        toast.success(response.message || "Staff member deleted successfully");
        // Redirect to staff members list
        router.push(`/${location}/staff-members`);
      } else {
        toast.error(response?.message || "Failed to delete staff member");
      }
    } catch (error: unknown) {
      const errorResponse = error as { errorCode?: string; message?: string };
      const errorMessage = errorResponse.message || "Failed to delete staff member";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, staffMemberId, router]); // staffMemberDetailPageConfig is stable (memoized with empty deps)

  const handleUpdateLoginCredentials = React.useCallback(async (data: {
    pin?: string;
    canLogin: boolean;
    password?: string;
    confirmPassword?: string;
  }) => {
    try {
      const requestData: {
        password?: string;
        confirmPassword?: string;
        pin?: number;
      } = {};

      // Only include PIN if provided
      if (data.pin && data.pin.trim()) {
        const pinNumber = parseInt(data.pin.trim(), 10);
        if (!isNaN(pinNumber) && pinNumber > 0) {
          requestData.pin = pinNumber;
        }
      }

      // Only include password if canLogin is true and password is provided
      if (data.canLogin && data.password && data.password.trim()) {
        requestData.password = data.password.trim();
        requestData.confirmPassword = data.confirmPassword?.trim();
      }

      // If no data to update, return early
      if (!requestData.pin && !requestData.password) {
        return { success: false, message: "No data to update" };
      }

      const response = await setUserPassword(location, staffMemberId, requestData);

      if (response.success && response.data?.status) {
        return { success: true, message: response.message };
      } else {
        // Handle error response (shouldn't happen if API is correct, but handle it)
        const errorMessage = Array.isArray(response.message) 
          ? response.message.join(", ") 
          : response.message || "Failed to update login credentials";
        console.error("Failed to update login credentials:", errorMessage);
        return { success: false, message: errorMessage };
      }
    } catch (err: unknown) {
      // Extract error message from API error response
      let errorMessage: string = "Failed to update login credentials";
      
      console.error("Error caught in handleUpdateLoginCredentials:", err);
      console.error("Error type:", typeof err);
      console.error("Error is object:", err && typeof err === 'object');
      
      // Check if it's a SetPasswordErrorResponse (thrown by setUserPassword)
      // The API throws axiosError.response.data which is the SetPasswordErrorResponse
      if (err && typeof err === 'object') {
        // Try to access message property directly
        const errorObj = err as Record<string, unknown>;
        
        if (errorObj.message !== undefined && errorObj.message !== null) {
          const message = errorObj.message;
          
          if (Array.isArray(message)) {
            errorMessage = message.join(", ");
          } else if (typeof message === 'string' && message.trim()) {
            errorMessage = message;
          }
        }
      } else if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      
      console.error("Extracted error message:", errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [location, staffMemberId]);

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
  const showError = error && !staffMemberInfo;

  if (isLoading && !staffMemberInfo) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading staff member..." className="text-center" />
      </div>
    );
  }

  if (!staffMemberInfo && !isLoading) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Staff member not found"}
          title="Unable to Load Staff Member Details"
          fallbackMessage="An unexpected error occurred while loading the staff member details. Please try again later."
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
              title="Unable to Load Staff Member Details"
              fallbackMessage="An unexpected error occurred while loading the staff member details. Please try again later."
            />
          </div>
        )}
        
        <DetailHeaderWithProfile
          breadcrumbItems={breadcrumbItems}
          currentPageTitle={pageTitle}
          loading={isLoading}
          actionMenuGroups={actionMenuGroups}
          actionButtonAriaLabel="Staff member actions"
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
                defaultRole: staffMemberDetailPageConfig.defaultRole,
                roleLabel: staffMemberDetailPageConfig.roleLabel,
              }}
              onSaveDetails={saveDetails}
              savingDetails={savingDetails}
              isLoading={isLoading}
              EditModal={(props) => (
                <EditUserDetailsModal
                  {...props}
                  title="Edit Staff Member Details"
                  defaultRole={staffMemberDetailPageConfig.defaultRole}
                />
              )}
              customActions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditLoginModalOpen(true)}>
                      Set Password
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              formatName={(d) => formatFullName(d?.firstName, d?.lastName) || ""}
            />

            {/* Mobile Email and Phone Cards - Only on Mobile */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              <UserEmailCard
                emails={emails}
                onUpdate={updateEmails}
                loading={isLoading}
                location={location}
                entityId={staffMemberId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreateEmailModal
                    {...props}
                    apiAdapter={staffMemberDetailPageConfig.apiAdapter}
                    validateEmail={staffMemberDetailPageConfig.validateEmail}
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
                entityId={staffMemberId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreatePhoneModal
                    {...props}
                    apiAdapter={staffMemberDetailPageConfig.apiAdapter}
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
                entityId={staffMemberId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreateEmailModal
                    {...props}
                    apiAdapter={staffMemberDetailPageConfig.apiAdapter}
                    validateEmail={staffMemberDetailPageConfig.validateEmail}
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
                entityId={staffMemberId}
                onRefresh={refresh}
                CreateModal={(props) => (
                  <CreatePhoneModal
                    {...props}
                    apiAdapter={staffMemberDetailPageConfig.apiAdapter}
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
              entityId={staffMemberId}
              onRefresh={refresh}
              CreateModal={(props) => (
                <CreateAddressModal
                  {...props}
                  apiAdapter={staffMemberDetailPageConfig.apiAdapter}
                />
              )}
              AddressList={AddressList}
              useAddressHandlers={useAddressHandlers}
            />
          </div>
        </div>

        {/* Tabs Section */}
        <StaffMemberTabsSection location={location} staffMemberId={staffMemberId} />
      </div>

      {/* Edit Login Credentials Modal */}
      <EditStaffMemberLoginModal
        open={isEditLoginModalOpen}
        onClose={() => setIsEditLoginModalOpen(false)}
        onSubmit={handleUpdateLoginCredentials}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Are you sure you want to delete this staff member?"
        description="This action cannot be undone. The staff member and all associated data will be permanently deleted."
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </>
  );
}

"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  updateStaffMemberDetailsThunk, 
  updateEmails, 
  updatePhones, 
  updateAddresses,
  fetchStaffMember,
  clearCache,
  updateDetails,
} from "../[id]/staff-members-details.slice";
import { toast } from "sonner";
import {
  StaffMemberAddress,
  StaffMemberBasicDetails,
  StaffMemberEmail,
  StaffMemberPhone,
} from "../types";

type StaffMemberDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: StaffMemberBasicDetails | null;
  emails: StaffMemberEmail[];
  phones: StaffMemberPhone[];
  addresses: StaffMemberAddress[];
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  saveDetails: (next: StaffMemberBasicDetails) => Promise<boolean>;
  updateEmails: React.Dispatch<React.SetStateAction<StaffMemberEmail[]>>;
  updatePhones: React.Dispatch<React.SetStateAction<StaffMemberPhone[]>>;
  updateAddresses: React.Dispatch<React.SetStateAction<StaffMemberAddress[]>>;
  savingDetails: boolean;
};

export function useStaffMemberDetails(
  location: string,
  staffMemberId: number
): StaffMemberDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get staff member data from Redux store
  const staffMemberInfo = useAppSelector((state) => state.staffMemberDetails.staffMemberInfo);
  const loading = useAppSelector((state) => state.staffMemberDetails.isLoading);
  const error = useAppSelector((state) => state.staffMemberDetails.error);
  const savingDetails = useAppSelector((state) => state.staffMemberDetails.isSaving);

  // Transform Redux state to hook return format
  const details: StaffMemberBasicDetails | null = React.useMemo(() => {
    if (!staffMemberInfo?.profile) return null;
    const [firstName, ...lastNameParts] = staffMemberInfo.profile.name.split(' ');
    return {
      firstName,
      lastName: lastNameParts.join(' ') || '',
      role: staffMemberInfo.profile.role,
      picture: staffMemberInfo.profile.picture,
    };
  }, [staffMemberInfo]);

  // Memoize arrays to prevent unnecessary re-renders
  const emails = React.useMemo(() => staffMemberInfo?.email || [], [staffMemberInfo?.email]);
  const phones = React.useMemo(() => staffMemberInfo?.phone || [], [staffMemberInfo?.phone]);
  const addresses = React.useMemo(() => staffMemberInfo?.addresses || [], [staffMemberInfo?.addresses]);

  const refresh = React.useCallback(async () => {
    dispatch(fetchStaffMember({ location, staffMemberId }));
  }, [dispatch, location, staffMemberId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    dispatch(fetchStaffMember({ location, staffMemberId }));
  }, [dispatch, location, staffMemberId]);

  const saveDetails = React.useCallback(
    async (next: StaffMemberBasicDetails) => {
      try {
        // Optimistic update
        dispatch(updateDetails(next));
        
        await dispatch(
          updateStaffMemberDetailsThunk({
            location,
            staffMemberId,
            data: {
              firstName: next.firstName,
              lastName: next.lastName,
            },
          })
        ).unwrap();
        
        toast.success("Staff member details updated successfully");
        
        // Refresh data from server to ensure consistency
        await refresh();
        
        return true;
      } catch (error) {
        console.error("Failed to save staff member details:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update staff member details. Please try again.");
        return false;
      }
    },
    [dispatch, location, staffMemberId, refresh]
  );

  const handleUpdateEmails = React.useCallback(
    (emails: StaffMemberEmail[] | ((prev: StaffMemberEmail[]) => StaffMemberEmail[])) => {
      const newEmails = typeof emails === 'function' 
        ? emails(staffMemberInfo?.email || [])
        : emails;
      dispatch(updateEmails(newEmails));
    },
    [dispatch, staffMemberInfo]
  );

  const handleUpdatePhones = React.useCallback(
    (phones: StaffMemberPhone[] | ((prev: StaffMemberPhone[]) => StaffMemberPhone[])) => {
      const newPhones = typeof phones === 'function'
        ? phones(staffMemberInfo?.phone || [])
        : phones;
      dispatch(updatePhones(newPhones));
    },
    [dispatch, staffMemberInfo]
  );

  const handleUpdateAddresses = React.useCallback(
    (addresses: StaffMemberAddress[] | ((prev: StaffMemberAddress[]) => StaffMemberAddress[])) => {
      const newAddresses = typeof addresses === 'function'
        ? addresses(staffMemberInfo?.addresses || [])
        : addresses;
      dispatch(updateAddresses(newAddresses));
    },
    [dispatch, staffMemberInfo]
  );

  return {
    loading,
    error,
    details,
    emails,
    phones,
    addresses,
    refresh,
    forceRefresh,
    saveDetails,
    updateEmails: handleUpdateEmails,
    updatePhones: handleUpdatePhones,
    updateAddresses: handleUpdateAddresses,
    savingDetails,
  };
}


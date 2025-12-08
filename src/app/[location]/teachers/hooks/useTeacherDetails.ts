"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUserPassword } from "@/lib/api/legacyApiAdapter";
import { 
  updateTeacher, 
  updateEmails, 
  updatePhones, 
  updateAddresses, 
  updateProfile,
  updatePrivateQualifications,
  updateGroupQualifications,
  fetchTeacher,
  fetchQualifications,
  clearCache
} from "../[id]/teachers.slice";
import {
  TeacherAddress,
  TeacherBasicDetails,
  TeacherEmail,
  TeacherPhone,
  TeacherQualification,
} from "../types";

type TeacherDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: TeacherBasicDetails | null;
  emails: TeacherEmail[];
  phones: TeacherPhone[];
  addresses: TeacherAddress[];
  privateQualifications: TeacherQualification[];
  groupQualifications: TeacherQualification[];
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  refreshQualifications: () => Promise<void>;
  saveDetails: (next: TeacherBasicDetails) => Promise<boolean>;
  updateEmails: React.Dispatch<React.SetStateAction<TeacherEmail[]>>;
  updatePhones: React.Dispatch<React.SetStateAction<TeacherPhone[]>>;
  updateAddresses: React.Dispatch<React.SetStateAction<TeacherAddress[]>>;
  updatePrivateQualifications: React.Dispatch<React.SetStateAction<TeacherQualification[]>>;
  updateGroupQualifications: React.Dispatch<React.SetStateAction<TeacherQualification[]>>;
  updatePassword: (password: string, confirmPassword: string) => Promise<boolean>;
  savingDetails: boolean;
};

const simulateRequest = async <T,>(payload: T, delay = 150): Promise<T> =>
  new Promise((resolve) => {
    setTimeout(() => resolve(payload), delay);
  });

export function useTeacherDetails(
  location: string,
  teacherId: number
): TeacherDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get teacher data from Redux store
  const teacherInfo = useAppSelector((state) => state.teacher.teacherInfo);
  const loading = useAppSelector((state) => state.teacher.isLoading);
  const error = useAppSelector((state) => state.teacher.error);
  const savingDetails = useAppSelector((state) => state.teacher.isSaving);

  // Transform Redux state to hook return format
  const details: TeacherBasicDetails | null = React.useMemo(() => {
    if (!teacherInfo?.profile) return null;
    const [firstName, ...lastNameParts] = teacherInfo.profile.name.split(' ');
    return {
      firstName,
      lastName: lastNameParts.join(' ') || '',
      role: teacherInfo.profile.role,
      birthDate: teacherInfo.profile.birthDate,
      picture: teacherInfo.profile.picture,
    };
  }, [teacherInfo]);

  // Memoize arrays to prevent unnecessary re-renders
  const emails = React.useMemo(() => teacherInfo?.email || [], [teacherInfo?.email]);
  const phones = React.useMemo(() => teacherInfo?.phone || [], [teacherInfo?.phone]);
  const addresses = React.useMemo(() => teacherInfo?.addresses || [], [teacherInfo?.addresses]);
  const privateQualifications = React.useMemo(() => teacherInfo?.privateQualifications || [], [teacherInfo?.privateQualifications]);
  const groupQualifications = React.useMemo(() => teacherInfo?.groupQualifications || [], [teacherInfo?.groupQualifications]);

  const refresh = React.useCallback(async () => {
    dispatch(fetchTeacher({ location, teacherId }));
  }, [dispatch, location, teacherId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    dispatch(fetchTeacher({ location, teacherId }));
  }, [dispatch, location, teacherId]);

  // Refresh only qualifications (not all teacher data)
  const refreshQualifications = React.useCallback(async () => {
    await dispatch(fetchQualifications({ location, teacherId }));
  }, [dispatch, location, teacherId]);

  const saveDetails = React.useCallback(
    async (next: TeacherBasicDetails) => {
      try {
        await dispatch(
          updateTeacher({
            location,
            teacherId,
            data: {
              firstName: next.firstName,
              lastName: next.lastName,
              birthDate: next.birthDate,
            },
          })
        ).unwrap();

        // Update local Redux state with the new profile data
        dispatch(updateProfile(next));
        
        // Refresh data from server to ensure consistency
        await refresh();
        
        return true;
      } catch (err) {
        console.error("Failed to save teacher details:", err);
        return false;
      }
    },
    [dispatch, location, teacherId, refresh]
  );

  const handleUpdateEmails = React.useCallback(
    (emails: TeacherEmail[] | ((prev: TeacherEmail[]) => TeacherEmail[])) => {
      const newEmails = typeof emails === 'function' 
        ? emails(teacherInfo?.email || [])
        : emails;
      dispatch(updateEmails(newEmails));
    },
    [dispatch, teacherInfo]
  );

  const handleUpdatePhones = React.useCallback(
    (phones: TeacherPhone[] | ((prev: TeacherPhone[]) => TeacherPhone[])) => {
      const newPhones = typeof phones === 'function'
        ? phones(teacherInfo?.phone || [])
        : phones;
      dispatch(updatePhones(newPhones));
    },
    [dispatch, teacherInfo]
  );

  const handleUpdateAddresses = React.useCallback(
    (addresses: TeacherAddress[] | ((prev: TeacherAddress[]) => TeacherAddress[])) => {
      const newAddresses = typeof addresses === 'function'
        ? addresses(teacherInfo?.addresses || [])
        : addresses;
      dispatch(updateAddresses(newAddresses));
    },
    [dispatch, teacherInfo]
  );

  const handleUpdatePrivateQualifications = React.useCallback(
    (qualifications: TeacherQualification[] | ((prev: TeacherQualification[]) => TeacherQualification[])) => {
      const newQualifications = typeof qualifications === 'function'
        ? qualifications(teacherInfo?.privateQualifications || [])
        : qualifications;
      dispatch(updatePrivateQualifications(newQualifications));
    },
    [dispatch, teacherInfo]
  );

  const handleUpdateGroupQualifications = React.useCallback(
    (qualifications: TeacherQualification[] | ((prev: TeacherQualification[]) => TeacherQualification[])) => {
      const newQualifications = typeof qualifications === 'function'
        ? qualifications(teacherInfo?.groupQualifications || [])
        : qualifications;
      dispatch(updateGroupQualifications(newQualifications));
    },
    [dispatch, teacherInfo]
  );

  const updatePassword = React.useCallback(async (password: string, confirmPassword: string) => {
    try {
      // Call legacy API to set password
      const response = await setUserPassword(
        location,
        teacherId,
        password,
        confirmPassword
      );

      if (response.status) {
        return true;
      } else {
        console.error("Failed to update password:", response.message || response.errors);
        return false;
      }
    } catch (err) {
      console.error("Failed to update password:", err);
      return false;
    }
  }, [location, teacherId]);

  return {
    loading,
    error,
    details,
    emails,
    phones,
    addresses,
    privateQualifications,
    groupQualifications,
    refresh,
    forceRefresh,
    refreshQualifications,
    saveDetails,
    updateEmails: handleUpdateEmails,
    updatePhones: handleUpdatePhones,
    updateAddresses: handleUpdateAddresses,
    updatePrivateQualifications: handleUpdatePrivateQualifications,
    updateGroupQualifications: handleUpdateGroupQualifications,
    updatePassword,
    savingDetails,
  };
}


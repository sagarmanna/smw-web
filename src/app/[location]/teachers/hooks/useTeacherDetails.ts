"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  updateTeacher, 
  updateEmails, 
  updatePhones, 
  updateAddresses, 
  updateProfile,
  fetchTeacher 
} from "../[id]/teachers.slice";
import {
  TeacherAddress,
  TeacherBasicDetails,
  TeacherEmail,
  TeacherPhone,
} from "../types";

type TeacherDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: TeacherBasicDetails | null;
  emails: TeacherEmail[];
  phones: TeacherPhone[];
  addresses: TeacherAddress[];
  refresh: () => Promise<void>;
  saveDetails: (next: TeacherBasicDetails) => Promise<boolean>;
  updateEmails: React.Dispatch<React.SetStateAction<TeacherEmail[]>>;
  updatePhones: React.Dispatch<React.SetStateAction<TeacherPhone[]>>;
  updateAddresses: React.Dispatch<React.SetStateAction<TeacherAddress[]>>;
  updatePassword: (password: string) => Promise<boolean>;
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

  const emails = teacherInfo?.email || [];
  const phones = teacherInfo?.phone || [];
  const addresses = teacherInfo?.addresses || [];

  const refresh = React.useCallback(async () => {
    dispatch(fetchTeacher(teacherId.toString()));
  }, [dispatch, teacherId]);

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
        return true;
      } catch (err) {
        console.error("Failed to save teacher details:", err);
        return false;
      }
    },
    [dispatch, location, teacherId]
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

  const updatePassword = React.useCallback(async (_password: string) => {
    try {
      await simulateRequest(true);
      return true;
    } catch (err) {
      console.error("Failed to update password:", err);
      return false;
    }
  }, []);

  return {
    loading,
    error,
    details,
    emails,
    phones,
    addresses,
    refresh,
    saveDetails,
    updateEmails: handleUpdateEmails,
    updatePhones: handleUpdatePhones,
    updateAddresses: handleUpdateAddresses,
    updatePassword,
    savingDetails,
  };
}


"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  updateStudent, 
  updateProfile,
  fetchStudent,
  clearCache
} from "../[id]/students-details.slice";
import {
  StudentBasicDetails,
  StudentCustomer,
  StudentEnrolment,
  StudentEvaluation,
} from "../types";

type StudentDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: StudentBasicDetails | null;
  customer: { customer: string; phone: string; customerId?: number } | null;
  enrolments: StudentEnrolment[];
  evaluations: StudentEvaluation[];
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
  saveDetails: (next: StudentBasicDetails) => Promise<boolean>;
  savingDetails: boolean;
};

export function useStudentDetails(
  location: string,
  studentId: string
): StudentDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get student data from Redux store
  const studentInfo = useAppSelector((state) => state.student.studentInfo);
  const loading = useAppSelector((state) => state.student.isLoading);
  const error = useAppSelector((state) => state.student.error);
  const savingDetails = useAppSelector((state) => state.student.isSaving);

  // Transform Redux state to hook return format
  const details: StudentBasicDetails | null = React.useMemo(() => {
    if (!studentInfo?.profile) return null;
    return {
      id: studentInfo.profile.id,
      firstName: studentInfo.profile.firstName,
      lastName: studentInfo.profile.lastName,
      birthday: studentInfo.profile.birthday,
      age: studentInfo.profile.age,
      gender: studentInfo.profile.gender,
      status: studentInfo.profile.status,
      notes: studentInfo.profile.notes,
    };
  }, [studentInfo]);

  // Memoize arrays to prevent unnecessary re-renders
  const customer: StudentCustomer | null = React.useMemo(() => studentInfo?.customer || null, [studentInfo?.customer]);
  const enrolments: StudentEnrolment[] = React.useMemo(() => studentInfo?.enrolments || [], [studentInfo?.enrolments]);
  const evaluations: StudentEvaluation[] = React.useMemo(() => studentInfo?.evaluations || [], [studentInfo?.evaluations]);

  const refresh = React.useCallback(async () => {
    dispatch(fetchStudent({ location, studentId }));
  }, [dispatch, location, studentId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    dispatch(fetchStudent({ location, studentId }));
  }, [dispatch, location, studentId]);

  const saveDetails = React.useCallback(
    async (next: StudentBasicDetails) => {
      try {
        await dispatch(
          updateStudent({
            location,
            studentId,
            data: {
              firstName: next.firstName,
              lastName: next.lastName,
              birthday: next.birthday,
              gender: next.gender,
              notes: next.notes,
            },
          })
        ).unwrap();
        
        // Update local state optimistically
        dispatch(updateProfile(next));
        
        return true;
      } catch (error) {
        console.error("Failed to save student details:", error);
        return false;
      }
    },
    [dispatch, location, studentId]
  );

  return {
    loading,
    error,
    details,
    customer,
    enrolments,
    evaluations,
    refresh,
    forceRefresh,
    saveDetails,
    savingDetails,
  };
}


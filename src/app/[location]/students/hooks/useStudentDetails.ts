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
  StudentEvaluationsPagination,
} from "../types";
import { genderDisplayToApi } from "../[id]/students-details.api";
import { toast } from "sonner";

type StudentDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: StudentBasicDetails | null;
  customer: { customer: string; phone: string; customerId?: number } | null;
  enrolments: StudentEnrolment[];
  evaluations: StudentEvaluation[];
  evaluationsPagination?: StudentEvaluationsPagination;
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
  const evaluationsPagination: StudentEvaluationsPagination | undefined = React.useMemo(() => studentInfo?.evaluationsPagination, [studentInfo?.evaluationsPagination]);

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
        // Convert gender from display format to API format
        const apiGender = genderDisplayToApi(next.gender);
        
        // Call API first
        await dispatch(
          updateStudent({
            location,
            studentId,
            data: {
              firstName: next.firstName,
              lastName: next.lastName,
              birthday: next.birthday,
              gender: apiGender, // Convert to API format
              notes: next.notes,
            },
          })
        ).unwrap();
        
        // State is already updated from API response in the reducer (updateStudent.fulfilled)
        // No need to refetch enrolments and evaluations - they haven't changed
        
        toast.success("Student details updated successfully");
        return true;
      } catch (error) {
        console.error("Failed to save student details:", error);
        toast.error(error instanceof Error ? error.message : "Failed to update student details. Please try again.");
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
    evaluationsPagination,
    refresh,
    forceRefresh,
    saveDetails,
    savingDetails,
  };
}


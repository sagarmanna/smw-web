"use client";

import * as React from "react";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { 
  fetchEnrolment,
  clearCache
} from "../[id]/enrolment-details.slice";
import {
  EnrolmentDetails,
  EnrolmentDiscounts,
  EnrolmentPaymentFrequency,
  EnrolmentSchedule,
  EnrolmentScheduleHistory,
  EnrolmentLesson,
  EnrolmentHistory,
} from "../types";

type EnrolmentDetailsHookReturn = {
  loading: boolean;
  error: string | null;
  details: EnrolmentDetails | null;
  discounts: EnrolmentDiscounts | null;
  paymentFrequency: EnrolmentPaymentFrequency | null;
  schedule: EnrolmentSchedule | null;
  scheduleHistory: EnrolmentScheduleHistory[];
  lessons: EnrolmentLesson[];
  history: EnrolmentHistory[];
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
};

export function useEnrolmentDetails(
  location: string,
  enrolmentId: string
): EnrolmentDetailsHookReturn {
  const dispatch = useAppDispatch();
  
  // Get enrolment data from Redux store
  const enrolmentInfo = useAppSelector((state) => state.enrolment?.enrolmentInfo);
  const loading = useAppSelector((state) => state.enrolment?.isLoading || false);
  const error = useAppSelector((state) => state.enrolment?.error);

  // Transform Redux state to hook return format
  const details: EnrolmentDetails | null = React.useMemo(() => {
    if (!enrolmentInfo?.details) return null;
    return enrolmentInfo.details;
  }, [enrolmentInfo]);

  const discounts: EnrolmentDiscounts | null = React.useMemo(() => {
    if (!enrolmentInfo?.discounts) return null;
    return enrolmentInfo.discounts;
  }, [enrolmentInfo]);

  const paymentFrequency: EnrolmentPaymentFrequency | null = React.useMemo(() => {
    if (!enrolmentInfo?.paymentFrequency) return null;
    return enrolmentInfo.paymentFrequency;
  }, [enrolmentInfo]);

  const schedule: EnrolmentSchedule | null = React.useMemo(() => {
    if (!enrolmentInfo?.schedule) return null;
    return enrolmentInfo.schedule;
  }, [enrolmentInfo]);

  const scheduleHistory: EnrolmentScheduleHistory[] = React.useMemo(() => {
    return enrolmentInfo?.scheduleHistory || [];
  }, [enrolmentInfo]);

  const lessons: EnrolmentLesson[] = React.useMemo(() => {
    return enrolmentInfo?.lessons || [];
  }, [enrolmentInfo]);

  const history: EnrolmentHistory[] = React.useMemo(() => {
    return enrolmentInfo?.history || [];
  }, [enrolmentInfo]);

  const refresh = React.useCallback(async () => {
    dispatch(fetchEnrolment({ location, enrolmentId }));
  }, [dispatch, location, enrolmentId]);

  // Force refresh by clearing cache first
  const forceRefresh = React.useCallback(async () => {
    dispatch(clearCache());
    dispatch(fetchEnrolment({ location, enrolmentId }));
  }, [dispatch, location, enrolmentId]);

  return {
    loading,
    error,
    details,
    discounts,
    paymentFrequency,
    schedule,
    scheduleHistory,
    lessons,
    history,
    refresh,
    forceRefresh,
  };
}


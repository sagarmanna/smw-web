/**
 * Transformation functions for teacher tab data
 */

import type { UnavailabilityData, TimeVoucherData, UnscheduledLessonData } from '../teacherTabConfigs';
import type { UnavailableHour } from '../[id]/teachers-details-tabs.api';
import type { TimeVoucherApiResponse, TimeVoucherQueryParams } from '../[id]/teachers-details-tabs.api';
import { parseApiDateTimeToISO } from '@/utils/dateUtils';

/**
 * Transforms unavailability API response to UnavailabilityData format
 */
export function transformUnavailabilityData(
  apiResult: UnavailableHour[]
): UnavailabilityData[] {
  if (!apiResult || apiResult.length === 0) {
    return [];
  }

  const baseTimestamp = Date.now();
  return apiResult.map((item, index) => ({
    id: `unavailability-${baseTimestamp}-${index}`,
    fromDateTime: parseApiDateTimeToISO(item.start),
    toDateTime: parseApiDateTimeToISO(item.end),
    reason: item.reason || "",
  }));
}

/**
 * Transforms time voucher API response to TimeVoucherData format
 */
export function transformTimeVoucherData(
  apiResult: TimeVoucherApiResponse | null,
  params: TimeVoucherQueryParams
): TimeVoucherData[] {
  if (!apiResult || !apiResult.success || !apiResult.data?.body) {
    return [];
  }

  const transformedData: TimeVoucherData[] = [];
  const baseTimestamp = Date.now();

  if (params.summaryOnly) {
    // Summary mode: body contains { date, duration }[]
    const summaryItems = apiResult.data.body as Array<{ date: string; duration: number }>;
    summaryItems.forEach((item, index) => {
      transformedData.push({
        id: `time-voucher-summary-${baseTimestamp}-${index}`,
        time: item.date,
        program: '',
        student: '',
        duration: item.duration.toString(),
      });
    });
  } else {
    // Detail mode: body contains { date, lessons: [{ id, time, program, student, duration }] }[]
    const detailItems = apiResult.data.body as Array<{
      date: string;
      lessons: Array<{
        id: number;
        time: string;
        program: string;
        student: string;
        duration: number;
      }>;
    }>;
    
    detailItems.forEach((item) => {
      item.lessons.forEach((lesson, lessonIndex) => {
        // Combine date and time for the time field
        const fullTime = `${item.date} ${lesson.time}`;
        transformedData.push({
          id: `time-voucher-${lesson.id}-${baseTimestamp}-${lessonIndex}`,
          time: fullTime,
          program: lesson.program,
          student: lesson.student,
          duration: lesson.duration.toString(),
        });
      });
    });
  }

  return transformedData;
}

/**
 * Transforms unscheduled lessons API response to UnscheduledLessonData format
 */
export function transformUnscheduledLessonData(
  apiItems: Array<{ id: number; student: string; phone: string; program: string; duration: string; originalDate: string; expiryDate: string }>
): UnscheduledLessonData[] {
  if (!apiItems || apiItems.length === 0) {
    return [];
  }

  const baseTimestamp = Date.now();
  return apiItems.map((item, index) => ({
    id: `unscheduled-lesson-${item.id}-${baseTimestamp}-${index}`,
    student: item.student || "",
    phone: item.phone || "",
    program: item.program || "",
    duration: item.duration || "",
    originalDate: item.originalDate || "",
    expiryDate: item.expiryDate || "",
  }));
}



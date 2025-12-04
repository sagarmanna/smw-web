/**
 * Transformation functions for teacher tab data
 */

import type { UnavailabilityData, TimeVoucherData, InvoicedLessonData } from '../teacherTabConfigs';
import type { UnavailableHour } from '../[id]/teachers-details-tabs.api';
import type { TimeVoucherApiResponse, TimeVoucherQueryParams } from '../[id]/teachers-details-tabs.api';
import type { InvoicedLessonApiResponse, InvoicedLessonQueryParams } from '../[id]/teachers-details-tabs.api';
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
 * Transforms invoiced lessons API response to InvoicedLessonData format
 */
export function transformInvoicedLessonData(
  apiResult: InvoicedLessonApiResponse | null,
  params: InvoicedLessonQueryParams
): InvoicedLessonData[] {
  if (!apiResult || !apiResult.success || !apiResult.data?.body) {
    return [];
  }

  const transformedData: InvoicedLessonData[] = [];
  const baseTimestamp = Date.now();

  if (params.summaryOnly) {
    // Summary mode: body contains { date, duration, cost }[]
    // Filter out rows with empty date (these are footer rows that we'll handle separately)
    const summaryItems = apiResult.data.body as Array<{ date: string; duration: number; cost: string }>;
    summaryItems
      .filter((item) => item.date && item.date.trim() !== '') // Exclude empty date rows (footer rows from API)
      .forEach((item, index) => {
        transformedData.push({
          id: `invoiced-lesson-summary-${baseTimestamp}-${index}`,
          time: item.date,
          program: '',
          student: '',
          duration: item.duration.toString(),
          ratePerHour: 0, // Not available in summary
          cost: parseFloat(item.cost.replace(/[^0-9.-]+/g, '')) || 0, // Extract numeric value from "$36.00"
        });
      });
  } else {
    // Detail mode: body contains { invoiceDate, lessons: [{ invoiceDate, time, program, student, duration, rate, cost }] }[]
    const detailItems = apiResult.data.body as Array<{
      invoiceDate: string;
      lessons: Array<{
        invoiceDate: string;
        time: string;
        program: string;
        student: string;
        duration: number;
        rate: string;
        cost: string;
      }>;
    }>;
    
    detailItems.forEach((item) => {
      item.lessons.forEach((lesson, lessonIndex) => {
        // Combine invoice date and time for the time field
        const fullTime = `${item.invoiceDate} ${lesson.time}`;
        transformedData.push({
          id: `invoiced-lesson-${baseTimestamp}-${lessonIndex}`,
          time: fullTime,
          program: lesson.program,
          student: lesson.student,
          duration: lesson.duration.toString(),
          ratePerHour: parseFloat(lesson.rate.replace(/[^0-9.-]+/g, '')) || 0, // Extract numeric value from "$36.00"
          cost: parseFloat(lesson.cost.replace(/[^0-9.-]+/g, '')) || 0, // Extract numeric value from "$18.00"
        });
      });
    });
  }

  return transformedData;
}



/**
 * Utility functions for printing enrolment details
 * Includes XSS protection through HTML escaping
 */

import { ENROLMENT_CONSTANTS } from "./constants";

/**
 * Escapes HTML special characters to prevent XSS attacks
 * Converts potentially dangerous characters to their HTML entity equivalents
 * 
 * @param text - The text to escape (can be string, number, null, or undefined)
 * @returns Escaped HTML-safe string, or "N/A" if input is null/undefined
 * 
 * @example
 * escapeHtml("<script>alert('xss')</script>") // Returns "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
 */
export const escapeHtml = (text: string | number | null | undefined): string => {
  if (text === null || text === undefined) {
    return ENROLMENT_CONSTANTS.DEFAULT_NOT_AVAILABLE;
  }
  
  const str = String(text);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

/**
 * Safely formats a boolean value for display
 * Converts boolean to "Yes"/"No" string representation
 * 
 * @param value - The boolean value to format (can be null or undefined)
 * @returns "Yes" for true, "No" for false, or "N/A" if null/undefined
 */
export const formatBoolean = (value: boolean | null | undefined): string => {
  if (value === null || value === undefined) {
    return ENROLMENT_CONSTANTS.DEFAULT_NOT_AVAILABLE;
  }
  return value ? ENROLMENT_CONSTANTS.DEFAULT_YES : ENROLMENT_CONSTANTS.DEFAULT_NO;
};

/**
 * Formats lesson data for printing with XSS protection
 * Processes an array of lesson objects and escapes all string values
 * 
 * @param lessons - Array of lesson objects with optional string/boolean fields
 * @returns Array of formatted lesson objects with all values HTML-escaped
 */
export interface FormattedLesson {
  dueDate: string;
  date: string;
  duration: string;
  status: string;
  price: string;
  owing: string;
  online: string;
}

export const formatLessonsForPrint = (
  lessons: Array<{
    dueDate?: string | null;
    date?: string | null;
    duration?: string | null;
    status?: string | null;
    price?: string | null;
    owing?: string | null;
    online?: boolean | null;
  }>
): FormattedLesson[] => {
  return lessons.map((lesson) => ({
    dueDate: escapeHtml(lesson.dueDate),
    date: escapeHtml(lesson.date),
    duration: escapeHtml(lesson.duration),
    status: escapeHtml(lesson.status),
    price: escapeHtml(lesson.price),
    owing: escapeHtml(lesson.owing),
    online: formatBoolean(lesson.online),
  }));
};

/**
 * Generates table rows HTML with XSS protection
 * Creates HTML table row elements for lesson data
 * 
 * @param formattedLessons - Array of pre-formatted lesson objects (already escaped)
 * @returns HTML string containing table rows
 */
export const generateLessonTableRows = (formattedLessons: FormattedLesson[]): string => {
  return formattedLessons
    .map(
      (lesson) => `
    <tr>
      <td>${lesson.dueDate}</td>
      <td>${lesson.date}</td>
      <td>${lesson.duration}</td>
      <td>${lesson.status}</td>
      <td>${lesson.price}</td>
      <td>${lesson.owing}</td>
      <td>${lesson.online}</td>
    </tr>
  `
    )
    .join("");
};

/**
 * Formats rate display with XSS protection
 * Creates a formatted string showing rate information with date ranges
 * 
 * @param rates - Array of rate objects with amount, fromDate, toDate (optional)
 * @param fallbackRate - Fallback rate string if rates array is empty
 * @returns HTML-escaped formatted rate string, or escaped fallback rate
 */
export const formatRateDisplay = (
  rates?: Array<{ amount?: string; fromDate?: string; toDate?: string }> | null,
  fallbackRate?: string | null
): string => {
  if (rates && rates.length > 0) {
    return rates
      .map(
        (rate) =>
          `${escapeHtml(rate.amount)} From ${escapeHtml(rate.fromDate)} To ${escapeHtml(rate.toDate)}`
      )
      .join("<br>");
  }
  return escapeHtml(fallbackRate);
};

/**
 * Generates complete print HTML for enrolment
 * Creates a full HTML document ready for printing with all enrolment details
 * Includes proper styling, XSS protection, and auto-print functionality
 * 
 * @param data - Enrolment print data object containing all enrolment information
 * @returns Complete HTML document string ready for printing
 */
export interface EnrolmentPrintData {
  program: string;
  teacher: string;
  rate: string;
  autoRenewal: string;
  duration: string;
  student: string;
  customer: string;
  online: boolean;
  schedule?: {
    day: string;
    time: string;
    startDate: string;
    endDate: string;
  } | null;
  lessons: FormattedLesson[];
}

export const generateEnrolmentPrintHtml = (data: EnrolmentPrintData): string => {
  const scheduleHtml = data.schedule
    ? `
      <div class="enrolment-details"><strong>Schedule:</strong> ${escapeHtml(data.schedule.day)} at ${escapeHtml(data.schedule.time)}</div>
      <div class="enrolment-details"><strong>Start Date:</strong> ${escapeHtml(data.schedule.startDate)}</div>
      <div class="enrolment-details"><strong>End Date:</strong> ${escapeHtml(data.schedule.endDate)}</div>
    `
    : "";

  const lessonsTableHtml =
    data.lessons.length > 0
      ? `
    <div class="details-section">
      <h2 style="font-size: 16px; margin-bottom: 10px;">Lessons</h2>
      <table>
        <thead>
          <tr>
            <th>Due Date</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th>Price</th>
            <th>Owing</th>
            <th>Online</th>
          </tr>
        </thead>
        <tbody>
          ${generateLessonTableRows(data.lessons)}
        </tbody>
      </table>
    </div>
  `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enrolment - ${escapeHtml(data.program)}</title>
        <style>
          @page { size: A4; margin: 0.5in; }
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            font-size: 12px; 
            color: #000; 
          }
          .enrolment-header {
            margin-bottom: 20px;
          }
          .enrolment-header h1 {
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 8px 0;
          }
          .enrolment-details {
            font-size: 13px;
            margin: 4px 0;
          }
          .details-section {
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px 12px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            table { page-break-inside: auto; }
            tr { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="enrolment-header">
          <h1>${escapeHtml(data.program)}</h1>
          <div class="enrolment-details"><strong>Teacher:</strong> ${escapeHtml(data.teacher)}</div>
          <div class="enrolment-details"><strong>Rate:</strong> ${data.rate}</div>
          <div class="enrolment-details"><strong>Auto Renewal:</strong> ${escapeHtml(data.autoRenewal)}</div>
          <div class="enrolment-details"><strong>Duration:</strong> ${escapeHtml(data.duration)}</div>
          <div class="enrolment-details"><strong>Student:</strong> ${escapeHtml(data.student)}</div>
          <div class="enrolment-details"><strong>Customer:</strong> ${escapeHtml(data.customer)}</div>
          <div class="enrolment-details"><strong>Online:</strong> ${formatBoolean(data.online)}</div>
          ${scheduleHtml}
        </div>
        ${lessonsTableHtml}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, ${ENROLMENT_CONSTANTS.PRINT_WINDOW_LOAD_DELAY_MS});
          };
        </script>
      </body>
    </html>
  `;
};


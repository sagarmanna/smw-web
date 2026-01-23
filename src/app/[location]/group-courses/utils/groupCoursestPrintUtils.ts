/**
 * Utility functions for printing group enrolment details
 * Includes XSS protection through HTML escaping
 */

import type { GroupEnrolmentPrintDetailsBody } from "@/app/[location]/enrolments/[id]/enrolment-details.api";

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
    return "N/A";
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
 * Interface for schedule item in group enrolment print
 */
export interface GroupEnrolmentScheduleItem {
  date?: string;
  day?: string;
  dayName?: string;
  fromTime?: string;
  time?: string;
  duration?: string;
}

/**
 * Generates schedule list HTML with XSS protection
 * Creates HTML div elements for schedule items
 * 
 * @param schedule - Array of schedule items from API response
 * @returns HTML string containing schedule items, or empty string if no schedule
 */
const generateScheduleListHtml = (schedule: GroupEnrolmentScheduleItem[]): string => {
  if (!schedule || !Array.isArray(schedule) || schedule.length === 0) {
    return '';
  }

  return schedule
    .map((item) => {
      const dateString = item.date;
      if (!dateString) {
        return '';
      }
      // Use API response as-is, but escape for XSS protection
      return `<div class="schedule-item">${escapeHtml(dateString)}</div>`;
    })
    .filter((item) => item !== '')
    .join('');
};

/**
 * Generates complete print HTML for group enrolment details
 * Creates a full HTML document ready for printing with all enrolment information
 * Includes proper styling, XSS protection, and auto-print functionality
 * 
 * @param details - Group enrolment print details from API response
 * @returns Complete HTML document string ready for printing
 */
export const generateGroupEnrolmentPrintHtml = (
  details: GroupEnrolmentPrintDetailsBody
): string => {
  // Escape all user-provided data to prevent XSS attacks
  const studentName = escapeHtml(details.studentName);
  const programName = escapeHtml(details.programName);
  const teacherName = escapeHtml(details.teacherName);
  const time = escapeHtml(details.time);
  const duration = escapeHtml(details.duration);
  const startDate = escapeHtml(details.startDate);
  const endDate = escapeHtml(details.endDate);

  // Generate schedule list HTML
  const scheduleListHtml = generateScheduleListHtml(details.schedule || []);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Enrolment Print - ${studentName}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @page { 
            margin: 14mm; 
            size: A4;
          }
          body { 
            margin: 0; 
            padding: 20px; 
            color: #000; 
            background-color: #ffffff;
            font-size: 14px; 
            line-height: 1.4; 
            font-family: Arial, sans-serif;
          }
          .enrolment-container {
            max-width: 800px;
            margin: 0 auto;
          }
          .enrolment-header {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
            color: #333;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 14px;
          }
          .detail-row:last-of-type {
            border-bottom: none;
            margin-bottom: 20px;
          }
          .detail-label {
            font-weight: 600;
            color: #333;
          }
          .detail-value {
            color: #666;
            text-align: right;
          }
          .schedule-section {
            margin-top: 30px;
          }
          .schedule-header {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
          }
          .schedule-item {
            padding: 8px 0;
            font-size: 14px;
            color: #666;
            border-bottom: 1px solid #f0f0f0;
          }
          .schedule-item:last-child {
            border-bottom: none;
          }
          @media print {
            body { 
              margin: 0; 
              padding: 20px; 
            }
            .detail-row { 
              page-break-inside: avoid; 
            }
            .schedule-item { 
              page-break-inside: avoid; 
            }
          }
        </style>
      </head>
      <body>
        <div class="enrolment-container">
          <div class="enrolment-header">Enrolment Details</div>
          
          <div class="detail-row">
            <span class="detail-label">Student :</span>
            <span class="detail-value">${studentName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Program :</span>
            <span class="detail-value">${programName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Teacher :</span>
            <span class="detail-value">${teacherName}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Time :</span>
            <span class="detail-value">${time}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Duration :</span>
            <span class="detail-value">${duration}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Start Date :</span>
            <span class="detail-value">${startDate}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">End Date :</span>
            <span class="detail-value">${endDate}</span>
          </div>
          
          ${scheduleListHtml ? `
          <div class="schedule-section">
            <div class="schedule-header">Schedule</div>
            ${scheduleListHtml}
          </div>
          ` : ''}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 250);
          };
        </script>
      </body>
    </html>
  `;
};

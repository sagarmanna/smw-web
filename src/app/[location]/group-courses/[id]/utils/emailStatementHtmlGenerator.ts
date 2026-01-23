/**
 * Utility functions for generating HTML content for group course email statements
 * All functions use API response data as-is without transformation
 */

import type { GroupCourseEmailStatementBody } from '../groupCourseDetails.api';

/**
 * Generate course title HTML from API response
 */
export function generateCourseTitleHTML(enrolment: GroupCourseEmailStatementBody['enrolment']): string {
  if (!enrolment?.programName) {
    return "";
  }

  const titleStyle = `font-size:18px;font-weight:700;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:16px 0 8px 0;`;
  const dateStyle = `font-size:14px;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:0 0 16px 0;`;
  
  const programName = enrolment.programName || "";
  const startDate = enrolment.startDate || "";
  const endDate = enrolment.endDate || "";
  const dateRange = startDate && endDate ? `${startDate}-${endDate}` : startDate || endDate || "";

  return `
    <div style="margin:16px 0;">
      <h2 style="${titleStyle}">${escapeHtml(programName)}</h2>
      ${dateRange ? `<p style="${dateStyle}">${escapeHtml(dateRange)}</p>` : ""}
    </div>`;
}

/**
 * Generate schedule details HTML from API response
 */
export function generateScheduleDetailsHTML(schedules: GroupCourseEmailStatementBody['schedules']): string {
  if (!schedules || schedules.length === 0) {
    return "";
  }

  const schedule = schedules[0];
  const duration = schedule?.duration || "";
  const fromTime = schedule?.fromTime || "";

  if (!duration && !fromTime) {
    return "";
  }

  const detailStyle = `font-size:14px;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:4px 0;`;
  
  const durationText = duration ? `Duration: ${escapeHtml(duration)}` : "";
  const timeText = fromTime ? `Time: ${escapeHtml(fromTime)}` : "";
  const details = [durationText, timeText].filter(Boolean).join("<br />");

  return `
    <div style="margin:0 0 16px 0;">
      <p style="${detailStyle}">${details}</p>
    </div>`;
}

/**
 * Generate lessons table HTML from API response
 */
export function generateLessonsTableHTML(lessons: GroupCourseEmailStatementBody['lessons']): string {
  if (!lessons || lessons.length === 0) {
    return "";
  }

  const tableStyle = `width:100%;border-collapse:collapse;font-size:12px;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:16px 0;`;
  const thStyle = `text-align:left;border:1px solid #ddd;padding:6px;background-color:#f3f4f6;font-weight:600;`;
  const tdStyle = `border:1px solid #ddd;padding:6px;text-align:left;`;

  const headerRow = `
      <tr>
        <th style="${thStyle}">Teacher Name</th>
        <th style="${thStyle}">Date</th>
        <th style="${thStyle}">Status</th>
      </tr>`;

  const bodyRows = lessons
    .map((lesson) => {
      return `
      <tr>
        <td style="${tdStyle}">${escapeHtml(lesson.teacherName || "")}</td>
        <td style="${tdStyle}">${escapeHtml(lesson.date || "")}</td>
        <td style="${tdStyle}">${escapeHtml(lesson.status || "")}</td>
      </tr>`;
    })
    .join("");

  return `
    <table style="${tableStyle}">
      <thead>${headerRow}</thead>
      <tbody>${bodyRows}</tbody>
    </table>`;
}

/**
 * Generate complete email content from API response
 */
export function generateEmailContent(emailStatement: GroupCourseEmailStatementBody): string {
  const header = emailStatement.emailTemplate?.header || "";
  const footer = emailStatement.emailTemplate?.footer || "";
  const courseTitle = generateCourseTitleHTML(emailStatement.enrolment);
  const scheduleDetails = generateScheduleDetailsHTML(emailStatement.schedules);
  const lessonsTable = generateLessonsTableHTML(emailStatement.lessons);

  return header + courseTitle + scheduleDetails + lessonsTable + footer;
}

/**
 * Escape HTML to prevent XSS attacks
 * Works in both browser and SSR contexts
 */
function escapeHtml(text: string): string {
  if (typeof document === 'undefined') {
    // SSR fallback - basic HTML escaping
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

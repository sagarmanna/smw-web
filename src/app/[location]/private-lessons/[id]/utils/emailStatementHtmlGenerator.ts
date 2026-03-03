/**
 * Utility for building HTML content for private lesson email statements.
 *
 * The API response contains a lesson plus an optional email template.  We
 * render the template's subject/header/footer around a simple two-column
 * table of lesson fields; nothing else (no derived title/schedule) is added.
 */

import type { PrivateLessonEmailStatementBody } from "../private-lesson-details.api";

/**
 * Escape HTML to prevent XSS in both browser and SSR contexts.
 */
function escapeHtml(text: string): string {
  if (typeof document === 'undefined') {
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

/**
 * Create a table row with a label and value.
 */
function row(label: string, value: string): string {
  const th = `text-align:left;border:1px solid #ddd;padding:6px;background-color:#f3f4f6;font-weight:600;`;
  const td = `border:1px solid #ddd;padding:6px;text-align:left;`;
  return `
      <tr><th style="${th}">${escapeHtml(label)}</th><td style="${td}">${escapeHtml(value)}</td></tr>`;
}

/**
 * Generate table HTML for the lesson details object.
 */
function generateLessonTableHTML(
  lesson: PrivateLessonEmailStatementBody['lesson']
): string {
  if (!lesson) return "";
  const rows = [
    row('Student', lesson.student),
    row('Customer', lesson.customer),
    row('Teacher', lesson.teacher),
    row('Scheduled Date', lesson.scheduledDate),
    row('Time', lesson.time),
    row('Duration', lesson.duration),
    row('Status', lesson.status),
    row('Expiry Date', lesson.expiryDate),
  ].join('');

  return `
    <table style="width:100%;border-collapse:collapse;font-size:12px;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:16px 0;">
      <tbody>${rows}</tbody>
    </table>`;
}

/**
 * Return the complete email body given the API statement.
 */
export function generateEmailContent(
  emailStatement: PrivateLessonEmailStatementBody
): string {
  const header =
    emailStatement.emailTemplate?.header?.trim() ||
    `<p style="text-align:left;">Please find the lesson below</p>`;
  const footer =
    emailStatement.emailTemplate?.footer?.trim() ||
    `<p>Thank you,<br/>Arcadia Academy of Music</p>`;
  const subjectText = emailStatement.emailTemplate?.subject || "";
  const subjectHtml = subjectText
    ? `<h2 style="font-size:16px;font-weight:600;font-family:system-ui,-apple-system,sans-serif;color:#111;margin:0 0 12px 0;">${escapeHtml(subjectText)}</h2>`
    : "";

  const table = generateLessonTableHTML(emailStatement.lesson);
  return header + subjectHtml + table + footer;
}
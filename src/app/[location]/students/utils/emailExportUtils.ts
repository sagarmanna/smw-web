import { ColumnDef } from "@tanstack/react-table";

/**
 * Constants for email export functionality
 */
const EMAIL_COLUMN_PREFIX = "email";
const EMAIL_SEPARATOR = ",";

/**
 * Interface for rows that may contain email data
 */
interface RowWithEmail {
  email?: string;
  allEmails?: string;
}

/**
 * Interface for export rows with dynamic email columns
 */
export interface ExportRowWithEmails {
  [key: string]: unknown;
}

/**
 * Parses emails from a row, handling both 'email' and 'allEmails' fields.
 * Both fields can contain comma-separated email addresses.
 * 
 * @param row - Row object that may contain email or allEmails field
 * @returns Array of cleaned email addresses
 * 
 * @example
 * parseEmailsFromRow({ email: "user1@example.com, user2@example.com" })
 * // Returns: ["user1@example.com", "user2@example.com"]
 */
export function parseEmailsFromRow(row: RowWithEmail): string[] {
  // Check allEmails first (preferred field for multiple emails)
  if (row.allEmails && row.allEmails.trim()) {
    return row.allEmails
      .split(EMAIL_SEPARATOR)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  }

  // Fall back to email field (can also be comma-separated)
  if (row.email && row.email.trim()) {
    return row.email
      .split(EMAIL_SEPARATOR)
      .map((email) => email.trim())
      .filter((email) => email.length > 0);
  }

  return [];
}

/**
 * Calculates the maximum number of emails across all rows in the dataset.
 * 
 * @param rows - Array of rows that may contain email data
 * @returns Maximum number of emails found in any single row
 * 
 * @example
 * calculateMaxEmailCount([
 *   { email: "email1@example.com, email2@example.com" },
 *   { email: "email3@example.com" }
 * ])
 * // Returns: 2
 */
export function calculateMaxEmailCount<T extends RowWithEmail>(rows: T[]): number {
  if (!rows || rows.length === 0) {
    return 1; // Return at least 1 to ensure one email column is created
  }

  const emailCounts = rows.map((row) => parseEmailsFromRow(row).length);
  return Math.max(...emailCounts, 1); // Ensure at least 1 email column
}

/**
 * Creates a single email column definition for export/print.
 * 
 * @param index - Zero-based index of the email column (will be displayed as Email 1, Email 2, etc.)
 * @returns Column definition for the email column
 * 
 * @example
 * createEmailColumn(0) // Creates "Email 1" column
 * createEmailColumn(1) // Creates "Email 2" column
 */
export function createEmailColumn<T extends ExportRowWithEmails>(
  index: number
): ColumnDef<T> {
  const columnNumber = index + 1;
  const accessorKey = `${EMAIL_COLUMN_PREFIX}${columnNumber}`;
  const header = `Email ${columnNumber}`;

  return {
    accessorKey,
    header,
    meta: {
      printable: true,
      printableName: header,
      exportFormatter: (v: unknown) => String(v ?? ""),
    },
  };
}

/**
 * Generates email column definitions for export/print based on the maximum number of emails.
 * 
 * @param maxEmailCount - Maximum number of emails found across all rows
 * @returns Array of email column definitions
 * 
 * @example
 * createEmailColumns(3) // Returns columns for Email 1, Email 2, Email 3
 */
export function createEmailColumns<T extends ExportRowWithEmails>(
  maxEmailCount: number
): ColumnDef<T>[] {
  return Array.from({ length: maxEmailCount }, (_, index) =>
    createEmailColumn<T>(index)
  );
}

/**
 * Transforms a single row by extracting emails and adding them as separate columns.
 * 
 * @param row - Source row with email data
 * @param baseRow - Base row data without email columns
 * @returns Transformed row with email columns (email1, email2, etc.)
 * 
 * @example
 * transformRowWithEmails(
 *   { email: "user1@example.com, user2@example.com" },
 *   { id: 1, firstName: "John" }
 * )
 * // Returns: { id: 1, firstName: "John", email1: "user1@example.com", email2: "user2@example.com" }
 */
export function transformRowWithEmails<
  TSource extends RowWithEmail,
  TTarget extends ExportRowWithEmails
>(row: TSource, baseRow: Record<string, unknown>): TTarget {
  const emails = parseEmailsFromRow(row);
  const transformedRow: Record<string, unknown> = { ...baseRow };

  // Add separate email columns (email1, email2, etc.)
  emails.forEach((email, index) => {
    const emailKey = `${EMAIL_COLUMN_PREFIX}${index + 1}`;
    transformedRow[emailKey] = email;
  });

  return transformedRow as TTarget;
}


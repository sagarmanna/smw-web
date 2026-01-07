import { format } from "date-fns";
import type { SortField } from "./sortPrivateLessons";
import type {
  IsOnlineFlag,
  OwingStatusCode,
  PrivateLessonStatusCode,
  PrivateLessonsQuery,
} from "../privateLessonsListing.api";

const isNumericString = (value: string) => /^\d+$/.test(value);
const isValidDate = (d: Date) => !Number.isNaN(d.getTime());

export function mapOwingStatusFilterToApi(value: unknown): OwingStatusCode | undefined {
  // API expects: 3 (Owing), 1 (Paid)
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v) return undefined;

  const lower = v.toLowerCase();
  if (lower === "owing") return "3";
  if (lower === "paid") return "1";
  if (isNumericString(lower) && (lower === "1" || lower === "3")) return lower as OwingStatusCode;

  return undefined;
}

export function mapLessonStatusFilterToApi(value: unknown): PrivateLessonStatusCode | undefined {
  /**
   * API expects:
   * 2=SCHEDULED, 1=RESCHEDULED, 5=UNSCHEDULED, 4=CANCELED, 3=COMPLETED, No=Absent
   */
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v) return undefined;

  const lower = v.toLowerCase();

  // Pass-through numeric codes / "No"
  if (lower === "no") return "No";
  if (isNumericString(lower) && ["1", "2", "3", "4", "5"].includes(lower)) {
    return lower as PrivateLessonStatusCode;
  }

  switch (lower) {
    case "scheduled":
      return "2";
    case "rescheduled":
      return "1";
    case "unscheduled":
      return "5";
    case "canceled":
    case "cancelled":
      return "4";
    case "completed":
      return "3";
    case "absent":
      return "No";
    default:
      return undefined;
  }
}

export function mapIsOnlineFilterToApi(value: unknown): IsOnlineFlag | undefined {
  // Backend expects: 1 = online, 0 = in-class (omit = all)
  if (typeof value !== "string") return undefined;
  const v = value.trim();
  if (!v) return undefined;

  const lower = v.toLowerCase();
  if (lower === "yes" || lower === "online") return "1";
  if (lower === "no" || lower === "in-class" || lower === "inclass" || lower === "in class") return "0";
  if (lower === "1" || lower === "0") return lower as IsOnlineFlag;

  return undefined;
}

export function mapDateRangeFilterToApi(
  value: unknown
): { fromDate: string; toDate: string } | undefined {
  if (typeof value !== "object" || value === null) return undefined;

  const anyVal = value as { from?: unknown; to?: unknown };
  if (!anyVal.from || !anyVal.to) return undefined;

  const fromDate = anyVal.from instanceof Date ? anyVal.from : new Date(String(anyVal.from));
  const toDate = anyVal.to instanceof Date ? anyVal.to : new Date(String(anyVal.to));

  if (!isValidDate(fromDate) || !isValidDate(toDate)) return undefined;

  return {
    fromDate: format(fromDate, "yyyy-MM-dd"),
    toDate: format(toDate, "yyyy-MM-dd"),
  };
}

export function mapSortFieldToApiSort(
  field: SortField | undefined
): PrivateLessonsQuery["sort"] | undefined {
  if (!field) return undefined;
  return field === "date" ? "dueDate" : field;
}



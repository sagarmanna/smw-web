import { 
  getPrivateLessonDetails,
  getPrivateLessonPayments,
  getGroupLessonStudents,
  transformApiResponse,
  type PrivateLessonDetailsApiResponse,
  type PrivateLessonPaymentsApiResponse,
  type GroupLessonStudentsApiResponse,
} from "../../[id]/private-lesson-details.api";
import type { PrivateLessonInfo } from "../../types";

export interface GroupLessonDetailsResult {
  lessonInfo: PrivateLessonInfo;
}

/**
 * Group-lesson facade over shared private-lesson APIs.
 * Fetches group lesson details using existing mocked APIs (details, payments, students)
 * and keeps the group-specific entry point separate from private lesson code.
 */
export async function fetchGroupLessonDetails(
  location: string,
  lessonId: string
): Promise<GroupLessonDetailsResult> {
  const [details, payments, students] = await Promise.all([
    getPrivateLessonDetails(location, lessonId) as Promise<PrivateLessonDetailsApiResponse | null>,
    getPrivateLessonPayments(location, lessonId) as Promise<PrivateLessonPaymentsApiResponse | null>,
    getGroupLessonStudents(location, lessonId) as Promise<GroupLessonStudentsApiResponse | null>,
  ]);

  if (!details) {
    throw new Error("Failed to fetch group lesson details");
  }

  const transformed = transformApiResponse(details, payments, null, null, students);
  return { lessonInfo: transformed };
}


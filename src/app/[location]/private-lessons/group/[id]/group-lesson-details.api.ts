import { 
  getPrivateLessonDetails,
  getPrivateLessonPayments,
  getPrivateLessonComments,
  getGroupLessonStudents,
  transformApiResponse,
  type PrivateLessonDetailsApiResponse,
  type PrivateLessonPaymentsApiResponse,
  type PrivateLessonCommentsApiResponse,
  type GroupLessonStudentsApiResponse,
} from "../../[id]/private-lesson-details.api";
import type { PrivateLessonInfo } from "../../types";

export interface GroupLessonDetailsResult {
  lessonInfo: PrivateLessonInfo;
}

/**
 * Group-lesson facade over shared private-lesson APIs.
 * Fetches group lesson details using existing shared APIs (details, payments, comments, students)
 * and keeps the group-specific entry point separate from private lesson code.
 */
export async function fetchGroupLessonDetails(
  location: string,
  lessonId: string
): Promise<GroupLessonDetailsResult> {
  const [details, payments, comments, students] = await Promise.all([
    getPrivateLessonDetails(location, lessonId) as Promise<PrivateLessonDetailsApiResponse | null>,
    getPrivateLessonPayments(location, lessonId) as Promise<PrivateLessonPaymentsApiResponse | null>,
    getPrivateLessonComments(location, lessonId, 1) as Promise<PrivateLessonCommentsApiResponse | null>,
    getGroupLessonStudents(location, lessonId) as Promise<GroupLessonStudentsApiResponse | null>,
  ]);

  if (!details) {
    throw new Error("Failed to fetch group lesson details");
  }

  const transformed = transformApiResponse(details, payments, null, comments, students);
  return { lessonInfo: transformed };
}


import { EnrolmentLesson } from "../../types";

/**
 * Extended EnrolmentLesson with grouping metadata for visual rowspan-like behavior
 */
export interface GroupedEnrolmentLesson extends EnrolmentLesson {
  /** Whether this is the first row in a due date group */
  isFirstInGroup: boolean;
  /** Total number of rows in this due date group */
  groupRowSpan: number;
  /** Index within the group (0-based) */
  groupIndex: number;
}

/**
 * Groups lessons by due date and adds metadata for visual grouping.
 * This enables a rowspan-like UI where the due date appears once per group.
 * 
 *   Data transformation pattern
 * - Keeps rendering logic simple
 * - Maintains data integrity
 * - Works with existing table components
 * 
 * @param lessons - Array of lessons to group
 * @returns Array of lessons with grouping metadata
 */
export function groupLessonsByDueDate(
  lessons: EnrolmentLesson[]
): GroupedEnrolmentLesson[] {
  if (!lessons || lessons.length === 0) {
    return [];
  }

  // Group lessons by due date
  const groupedMap = new Map<string, EnrolmentLesson[]>();
  
  lessons.forEach((lesson) => {
    const dueDate = lesson.dueDate || "";
    if (!groupedMap.has(dueDate)) {
      groupedMap.set(dueDate, []);
    }
    groupedMap.get(dueDate)!.push(lesson);
  });

  // Flatten groups and add metadata
  const result: GroupedEnrolmentLesson[] = [];
  
  groupedMap.forEach((groupLessons) => {
    const groupSize = groupLessons.length;
    
    groupLessons.forEach((lesson, index) => {
      result.push({
        ...lesson,
        isFirstInGroup: index === 0,
        groupRowSpan: groupSize,
        groupIndex: index,
      });
    });
  });

  return result;
}

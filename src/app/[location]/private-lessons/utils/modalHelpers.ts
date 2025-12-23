import type { PrivateLessonRow } from "../privateLessonsListing.api";

/**
 * Checks if all selected lessons have the same value for a given field
 * @param lessons Array of lessons to check
 * @param getValue Function to extract the value to compare from a lesson
 * @returns Object with `allSame` boolean and `value` (the common value if all same, undefined otherwise)
 */
export function checkAllLessonsHaveSameValue<T>(
  lessons: PrivateLessonRow[],
  getValue: (lesson: PrivateLessonRow) => T
): { allSame: boolean; value: T | undefined } {
  if (lessons.length === 0) {
    return { allSame: false, value: undefined };
  }

  const firstValue = getValue(lessons[0]);
  const allSame = lessons.every((lesson) => getValue(lesson) === firstValue);

  return {
    allSame,
    value: allSame ? firstValue : undefined,
  };
}

/**
 * Helper function to handle common modal save completion tasks
 * @param clearSelection Function to clear selected rows
 * @param closeModal Function to close the modal
 */
export function handleModalSaveCompletion(
  clearSelection: () => void,
  closeModal: () => void
): void {
  clearSelection();
  closeModal();
  // Note: toast.success is called by the caller to allow for dynamic messages
}


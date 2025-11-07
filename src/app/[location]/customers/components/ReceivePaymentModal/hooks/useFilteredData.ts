// hooks/useFilteredData.ts
import { useMemo } from 'react';
import { LessonItem, GroupLessonItem, ColumnFilter } from '../types';

/**
 * Custom hook to filter lessons based on column filters
 */
export const useFilteredLessons = (
  lessons: LessonItem[],
  columnFilters: ColumnFilter
): LessonItem[] => {
  return useMemo(() => {
    let filtered = [...lessons];

    // Apply student filter
    if (columnFilters.student && columnFilters.student !== 'all') {
      filtered = filtered.filter(
        lesson => lesson.student === columnFilters.student
      );
    }

    return filtered;
  }, [lessons, columnFilters]);
};

/**
 * Custom hook to filter group lessons based on column filters
 */
export const useFilteredGroupLessons = (
  groupLessons: GroupLessonItem[],
  columnFilters: ColumnFilter
): GroupLessonItem[] => {
  return useMemo(() => {
    let filtered = [...groupLessons];

    // Apply student filter
    if (columnFilters.student && columnFilters.student !== 'all') {
      filtered = filtered.filter(
        groupLesson => groupLesson.student === columnFilters.student
      );
    }

    return filtered;
  }, [groupLessons, columnFilters]);
};
// hooks/useFilteredData.ts
import { useMemo } from 'react';
import { parse, isWithinInterval, isValid } from 'date-fns';
import { LessonItem, GroupLessonItem, ColumnFilter } from '../types';

/**
 * Helper function to parse date string
 */
const parseDateString = (dateStr: string): Date | null => {
  try {
    // Try parsing with "MMM dd, yyyy" format (e.g., "Oct 15, 2025")
    const parsed = parse(dateStr, 'MMM dd, yyyy', new Date());
    if (isValid(parsed)) {
      return parsed;
    }
    
    // Try parsing with "MMM d, yyyy" format (e.g., "Oct 5, 2025")
    const parsed2 = parse(dateStr, 'MMM d, yyyy', new Date());
    if (isValid(parsed2)) {
      return parsed2;
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
};

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

    // Apply date range filter on Due Date - ONLY if dueDate filter is set
    if (columnFilters.dueDate && typeof columnFilters.dueDate === 'object') {
      const dateRange = columnFilters.dueDate as { from?: Date; to?: Date };
      // Only filter if both from and to dates are present and valid
      if (dateRange.from && dateRange.to && isValid(dateRange.from) && isValid(dateRange.to)) {
        filtered = filtered.filter(lesson => {
          const lessonDueDate = parseDateString(lesson.dueDate);
          if (!lessonDueDate) {
            return false;
          }
          
          try {
            return isWithinInterval(lessonDueDate, { 
              start: dateRange.from!, 
              end: dateRange.to! 
            });
          } catch (error) {
            console.error('Error checking date interval for lesson:', lesson.dueDate, error);
            return false;
          }
        });
      }
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

    // Apply date range filter on Due Date - ONLY if dueDate filter is set
    if (columnFilters.dueDate && typeof columnFilters.dueDate === 'object') {
      const dateRange = columnFilters.dueDate as { from?: Date; to?: Date };
      // Only filter if both from and to dates are present and valid
      if (dateRange.from && dateRange.to && isValid(dateRange.from) && isValid(dateRange.to)) {
        filtered = filtered.filter(groupLesson => {
          const lessonDueDate = parseDateString(groupLesson.dueDate);
          if (!lessonDueDate) {
            return false;
          }
          
          try {
            return isWithinInterval(lessonDueDate, { 
              start: dateRange.from!, 
              end: dateRange.to! 
            });
          } catch (error) {
            console.error('Error checking date interval for group lesson:', groupLesson.dueDate, error);
            return false;
          }
        });
      }
    }

    return filtered;
  }, [groupLessons, columnFilters]);
};
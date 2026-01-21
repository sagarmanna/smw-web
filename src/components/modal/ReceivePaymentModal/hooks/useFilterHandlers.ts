// hooks/useFilterHandlers.ts
import { useCallback, useMemo } from 'react';
import { ColumnFilter, LessonItem, GroupLessonItem } from '../types';

/**
 * Custom hook for handling table column filters with dynamic options
 * Following Single Responsibility Principle - handles only filter management
 */
export const useFilterHandlers = (
  setLessonColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter>>,
  setGroupLessonColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter>>,
  lessons: LessonItem[],
  groupLessons: GroupLessonItem[]
) => {
  // Generate unique student options from lessons
  const lessonStudentOptions = useMemo(() => {
    const uniqueStudents = new Set(lessons.map(lesson => lesson.student));
    return Array.from(uniqueStudents)
      .filter(student => student) // Remove empty values
      .sort()
      .map(student => ({
        value: student,
        label: student
      }));
  }, [lessons]);

  // Generate unique student options from group lessons
  const groupLessonStudentOptions = useMemo(() => {
    const uniqueStudents = new Set(groupLessons.map(lesson => lesson.student));
    return Array.from(uniqueStudents)
      .filter(student => student)
      .sort()
      .map(student => ({
        value: student,
        label: student
      }));
  }, [groupLessons]);

  const handleLessonFilterChange = useCallback(
    (columnKey: string, filterValue: unknown) => {
      setLessonColumnFilters(prev => ({
        ...prev,
        [columnKey]: filterValue,
      }));
    },
    [setLessonColumnFilters]
  );

  const handleGroupLessonFilterChange = useCallback(
    (columnKey: string, filterValue: unknown) => {
      setGroupLessonColumnFilters(prev => ({
        ...prev,
        [columnKey]: filterValue,
      }));
    },
    [setGroupLessonColumnFilters]
  );

  return {
    handleLessonFilterChange,
    handleGroupLessonFilterChange,
    lessonStudentOptions,
    groupLessonStudentOptions,
  };
};

// hooks/useFilterHandlers.ts
import { useCallback } from 'react';
import { ColumnFilter } from '../types';

/**
 * Custom hook for handling table column filters
 * Following Single Responsibility Principle - handles only filter management
 */
export const useFilterHandlers = (
  setLessonColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter>>,
  setGroupLessonColumnFilters: React.Dispatch<React.SetStateAction<ColumnFilter>>
) => {
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
  };
};
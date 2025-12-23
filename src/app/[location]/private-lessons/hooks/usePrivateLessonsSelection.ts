import * as React from "react";
import { useAppSelector } from "@/redux/hooks";
import { PrivateLessonRow } from "../privateLessonsListing.api";
import { selectLessonDiscounts } from "../privateLessonsListing.slice";

interface UsePrivateLessonsSelectionProps {
  rows: PrivateLessonRow[];
}

export function usePrivateLessonsSelection({ rows }: UsePrivateLessonsSelectionProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set());

  const selectedLessons = React.useMemo(
    () => rows.filter((row) => selectedRows.has(row.id)),
    [rows, selectedRows]
  );

  const previousDiscountData = useAppSelector((state) => {
    const lessonIds = selectedLessons.map((lesson) => lesson.id);
    const discountData = selectLessonDiscounts(state, lessonIds);
    return discountData ?? undefined;
  });

  const hasSelectedLessons = React.useMemo(
    () => selectedLessons.length > 0,
    [selectedLessons.length]
  );

  const clearSelection = React.useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  return {
    selectedRows,
    setSelectedRows,
    selectedLessons,
    hasSelectedLessons,
    clearSelection,
    previousDiscountData,
  };
}


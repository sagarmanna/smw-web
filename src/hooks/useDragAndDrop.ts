"use client";

import * as React from "react";

export interface UseDragAndDropOptions<T> {
  items: T[];
  onReorder?: (reorderedItems: T[]) => void;
  getItemId: (item: T) => string;
}

export interface UseDragAndDropReturn<T> {
  draggedId: string | null;
  dragOverId: string | null;
  handleDragStart: (e: React.DragEvent, item: T) => void;
  handleDragOver: (e: React.DragEvent, item: T, index: number) => void;
  handleDrop: (e: React.DragEvent, targetItem: T, targetIndex: number) => void;
  isDragging: (item: T) => boolean;
  isDragOver: (item: T, index: number) => boolean;
}

/**
 * Common hook for drag and drop functionality
 * Only allows drops at index 0 (top position)
 * When dropped at top, makes that item primary and updates the existing primary to non-primary
 */
export function useDragAndDrop<T extends { id: string; isPrimary?: boolean }>({
  items,
  onReorder,
  getItemId,
}: UseDragAndDropOptions<T>): UseDragAndDropReturn<T> {
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOverId, setDragOverId] = React.useState<string | null>(null);

  const handleDragStart = React.useCallback(
    (e: React.DragEvent, item: T) => {
      setDraggedId(getItemId(item));
    },
    [getItemId]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent, item: T, index: number) => {
      // Only allow drop on the first item (index 0)
      if (index === 0) {
        e.preventDefault();
        setDragOverId(getItemId(item));
      }
    },
    [getItemId]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent, targetItem: T, targetIndex: number) => {
      e.preventDefault();
      setDragOverId(null);

      if (!draggedId || draggedId === getItemId(targetItem) || !onReorder) {
        setDraggedId(null);
        return;
      }

      const draggedIndex = items.findIndex((item) => getItemId(item) === draggedId);
      const targetId = getItemId(targetItem);

      if (draggedIndex === -1) {
        setDraggedId(null);
        return;
      }

      // Only allow drop at the top (index 0)
      if (targetIndex !== 0) {
        // Revert to original position - don't update
        setDraggedId(null);
        return;
      }

      // Create a new array with reordered items
      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(0, 0, draggedItem);

      // Set all to non-primary first
      const updatedItems = newItems.map((item) => ({
        ...item,
        isPrimary: false,
      }));
      // Make the first one primary
      updatedItems[0] = {
        ...updatedItems[0],
        isPrimary: true,
      };
      onReorder(updatedItems);

      setDraggedId(null);
    },
    [draggedId, items, onReorder, getItemId]
  );

  // Cleanup on drag end
  React.useEffect(() => {
    const handleGlobalDragEnd = () => {
      setDraggedId(null);
      setDragOverId(null);
    };

    if (draggedId) {
      document.addEventListener("dragend", handleGlobalDragEnd);
      return () => {
        document.removeEventListener("dragend", handleGlobalDragEnd);
      };
    }
  }, [draggedId]);

  const isDragging = React.useCallback(
    (item: T) => {
      return draggedId === getItemId(item);
    },
    [draggedId, getItemId]
  );

  const isDragOver = React.useCallback(
    (item: T, index: number) => {
      return index === 0 && dragOverId === getItemId(item) && draggedId !== getItemId(item);
    },
    [dragOverId, draggedId, getItemId]
  );

  return {
    draggedId,
    dragOverId,
    handleDragStart,
    handleDragOver,
    handleDrop,
    isDragging,
    isDragOver,
  };
}


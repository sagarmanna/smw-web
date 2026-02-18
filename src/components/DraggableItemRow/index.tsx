"use client";

import * as React from "react";
import { KeyValueDisplay } from "@/components/KeyValueDisplay";
import { Pencil, Trash2, GripVertical } from "lucide-react";

export interface DraggableItemRowProps<T> {
  item: T;
  label: string;
  value: React.ReactNode;
  onEdit: (e: React.MouseEvent, item: T) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
  getItemId: (item: T) => string;
  editAriaLabel: string;
  deleteAriaLabel: string;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, item: T) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, item: T) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export function DraggableItemRow<T>({
  item,
  label,
  value,
  onEdit,
  onDelete,
  getItemId,
  editAriaLabel,
  deleteAriaLabel,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  isDragging = false,
  isDragOver = false,
}: DraggableItemRowProps<T>) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [wasDragged, setWasDragged] = React.useState(false);

  const handleDragStart = React.useCallback(
    (e: React.DragEvent) => {
      if (draggable && onDragStart) {
        setWasDragged(false);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", getItemId(item));
        onDragStart(e, item);
      }
    },
    [draggable, onDragStart, item, getItemId]
  );

  const handleDragOver = React.useCallback(
    (e: React.DragEvent) => {
      if (draggable && onDragOver) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(e);
      }
    },
    [draggable, onDragOver]
  );

  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      if (draggable && onDrop) {
        e.preventDefault();
        setWasDragged(true);
        onDrop(e, item);
      }
    },
    [draggable, onDrop, item]
  );

  const handleDragEnd = React.useCallback(() => {
    setWasDragged(false);
  }, []);

  const handleClick = React.useCallback(
    (e: React.MouseEvent) => {
      // Don't trigger edit if we just finished dragging
      if (!wasDragged) {
        onEdit(e, item);
      }
      setWasDragged(false);
    },
    [wasDragged, onEdit, item]
  );

  return (
    <div
      className={`flex items-stretch sm:items-center justify-between gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded -mx-2 cursor-pointer transition-colors ${
        isDragging ? "opacity-50" : ""
      } ${isDragOver ? "bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600" : ""}`}
      onClick={handleClick}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
        {draggable && (
          <div
            className={`flex-shrink-0 cursor-grab active:cursor-grabbing ${
              isHovered ? "opacity-100" : "opacity-0"
            } transition-opacity`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
          </div>
        )}
        <KeyValueDisplay
          label={label}
          value={value}
          className="justify-start flex-1 min-w-0"
        />
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(e, item);
          }}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          aria-label={editAriaLabel}
        >
          <Pencil className="h-4 w-4 text-gray-600 dark:text-gray-300" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e, getItemId(item));
          }}
          className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
          aria-label={deleteAriaLabel}
        >
          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}


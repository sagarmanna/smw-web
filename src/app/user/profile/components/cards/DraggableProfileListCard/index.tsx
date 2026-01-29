"use client";

import * as React from "react";
import { InfoCard } from "@/components/InfoCard";
import { DeleteConfirmationModal } from "@/components/DeleteConfirmationModal";
import { DraggableItemRow } from "@/components/DraggableItemRow";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

export interface CrudHandlers<T> {
  editingItem: T | null;
  setEditingItem: (item: T | null) => void;
  handleCreate: (item: T) => void;
  handleEdit: (item: T) => void;
  requestDelete: (id: string) => void;
  itemToDelete: T | null;
  setItemToDelete: (item: T | null) => void;
  handleDeleteConfirm: () => Promise<void>;
  isDeleting: boolean;
}

interface DraggableProfileListCardProps<T extends { id: string; isPrimary?: boolean }> {
  title: string;
  items: T[];
  onUpdate: React.Dispatch<React.SetStateAction<T[]>>;
  loading?: boolean;

  emptyText: string;
  deleteTitle: string;
  getDeleteLabel: (item: T) => string | undefined;

  editAriaLabel: string;
  deleteAriaLabel: string;

  getLabel: (item: T) => string;
  renderValue: (item: T) => React.ReactNode;

  handlers: CrudHandlers<T>;
  renderCreateModal: (props: {
    open: boolean;
    onClose: () => void;
    onSubmit: (item: T) => void;
    editingItem: T | null;
  }) => React.ReactNode;
}

export default function DraggableProfileListCard<T extends { id: string; isPrimary?: boolean }>({
  title,
  items,
  onUpdate,
  loading = false,
  emptyText,
  deleteTitle,
  getDeleteLabel,
  editAriaLabel,
  deleteAriaLabel,
  getLabel,
  renderValue,
  handlers,
  renderCreateModal,
}: DraggableProfileListCardProps<T>) {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleReorder = React.useCallback(
    (reordered: T[]) => {
      onUpdate(reordered);
    },
    [onUpdate]
  );

  const { handleDragStart, handleDragOver, handleDrop, isDragging, isDragOver } = useDragAndDrop<T>({
    items,
    onReorder: handleReorder,
    getItemId: (i) => i.id,
  });

  const handleAddClick = React.useCallback(() => {
    handlers.setEditingItem(null);
    setIsModalOpen(true);
  }, [handlers]);

  const handleEditClick = React.useCallback(
    (e: React.MouseEvent, item: T) => {
      e.stopPropagation();
      handlers.handleEdit(item);
      setIsModalOpen(true);
    },
    [handlers]
  );

  const handleDeleteClick = React.useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      handlers.requestDelete(id);
    },
    [handlers]
  );

  const handleModalSubmit = React.useCallback(
    (item: T) => {
      handlers.handleCreate(item);
      setIsModalOpen(false);
      handlers.setEditingItem(null);
    },
    [handlers]
  );

  return (
    <>
      <InfoCard title={title} onAddClick={handleAddClick} loading={loading}>
        <div className="space-y-2">
          {loading ? (
            <div />
          ) : items.length > 0 ? (
            items.map((item, index) => (
              <DraggableItemRow
                key={item.id}
                item={item}
                label={getLabel(item)}
                value={renderValue(item)}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                getItemId={(i) => i.id}
                editAriaLabel={editAriaLabel}
                deleteAriaLabel={deleteAriaLabel}
                draggable={true}
                onDragStart={(ev) => handleDragStart(ev, item)}
                onDragOver={(ev) => handleDragOver(ev, item, index)}
                onDrop={(ev) => handleDrop(ev, item, index)}
                isDragging={isDragging(item)}
                isDragOver={isDragOver(item, index)}
              />
            ))
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">{emptyText}</span>
          )}
        </div>
      </InfoCard>

      {renderCreateModal({
        open: isModalOpen,
        onClose: () => setIsModalOpen(false),
        onSubmit: handleModalSubmit,
        editingItem: handlers.editingItem,
      })}

      <DeleteConfirmationModal
        open={!!handlers.itemToDelete}
        onOpenChange={(open) => {
          if (!open) handlers.setItemToDelete(null);
        }}
        title={deleteTitle}
        itemLabel={handlers.itemToDelete ? getDeleteLabel(handlers.itemToDelete) : undefined}
        onConfirm={handlers.handleDeleteConfirm}
        isDeleting={handlers.isDeleting}
      />
    </>
  );
}


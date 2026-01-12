"use client";

import * as React from "react";

import { ReportPageLayout } from "@/components/ReportPageLayout";
import { ReminderNotesTable } from "./components/ReminderNotesTable";
import { EditReminderNoteModal } from "./components/modals/EditReminderNoteModal";
import { DeleteReminderNoteModal } from "./components/modals/DeleteReminderNoteModal";
import { useReminderNotes } from "./hooks/useReminderNotes";

interface ReminderNotesClientProps {
  location: string;
}

export function ReminderNotesClient({ location }: ReminderNotesClientProps) {
  const {
    displayNotes,
    notesSortDirection,
    isLoading,
    error,
    isSaving,
    isDeleting,
    fetchNotes,
    toggleSort,

    isEditOpen,
    draftHtml,
    setDraftHtml,
    openEdit,
    closeEdit,
    saveEdit,

    deleteModalState,
    openDelete,
    closeDelete,
    confirmDelete,
  } = useReminderNotes({ location });

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 mt-2 md:mt-8 lg:mt-2">
        <ReportPageLayout
          title="Reminder Notes"
          subtitle=""
          isLoading={isLoading}
          error={error}
          onRetry={fetchNotes}
        >
          <div className="px-2 sm:px-0">
            <ReminderNotesTable
              notes={displayNotes}
              sortDirection={notesSortDirection}
              onToggleSort={toggleSort}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          </div>

          <EditReminderNoteModal
            open={isEditOpen}
            onClose={closeEdit}
            location={location}
            value={draftHtml}
            onChange={setDraftHtml}
            onUpdate={saveEdit}
            isSaving={isSaving}
          />

          <DeleteReminderNoteModal
            open={deleteModalState.isOpen}
            onOpenChange={(open) => {
              if (!open) closeDelete();
            }}
            onConfirm={confirmDelete}
            confirmDisabled={!deleteModalState.noteId}
            isDeleting={isDeleting}
          />
        </ReportPageLayout>
      </div>
    </div>
  );
}



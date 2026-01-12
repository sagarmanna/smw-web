"use client";

import * as React from "react";

import { ReportPageLayout } from "@/components/ReportPageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
    editingNoteId,
    draftHtml,
    setDraftHtml,
    openCreate,
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
          actions={
            <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          }
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
            title={editingNoteId ? "Update Reminder Notes" : "Add Reminder Note"}
            submitLabel={editingNoteId ? "Update" : "Create"}
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



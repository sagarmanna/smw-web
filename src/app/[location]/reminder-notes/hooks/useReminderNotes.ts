"use client";

import * as React from "react";
import {
  createReminderNote,
  deleteReminderNote,
  getReminderNotes,
  updateReminderNote,
} from "../reminderNotes.api";
import { toast } from "sonner";

export type ReminderNote = {
  id: string;
  html: string;
};

export type NotesSortDirection = "asc" | "desc";

interface UseReminderNotesOptions {
  location: string;
  defaultSortDirection?: NotesSortDirection;
}

export function useReminderNotes(options: UseReminderNotesOptions) {
  const {
    location,
    // Per backend request example: order=ASC
    defaultSortDirection = "asc",
  } = options;

  // API-driven data only (no mock fallback)
  const [notes, setNotes] = React.useState<ReminderNote[]>([]);

  // Backend-driven sorting: order=ASC|DESC
  const [notesSortDirection, setNotesSortDirection] =
    React.useState<NotesSortDirection>(defaultSortDirection);

  const toggleSort = React.useCallback(() => {
    setNotesSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
  }, []);

  // Notes are returned sorted by the API according to order.
  const displayNotes = notes;

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Guard against out-of-order responses when toggling quickly
  const requestIdRef = React.useRef(0);

  const fetchNotes = React.useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const order = notesSortDirection.toUpperCase() as "ASC" | "DESC";
      const rows = await getReminderNotes(location, { sort: "notes", order });

      if (requestId !== requestIdRef.current) return;

      if (rows) {
        const mapped: ReminderNote[] = rows.map((row, idx) => ({
          id: String(row.id ?? idx),
          html: row.notes ?? row.html ?? "",
        }));
        setNotes(mapped);
      } else {
        setError("Failed to load reminder notes");
        // Keep existing notes (do not inject mock data)
      }
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to load reminder notes");
      // Keep existing notes (do not inject mock data)
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, [location, notesSortDirection]);

  React.useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  // Edit modal state
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [draftHtml, setDraftHtml] = React.useState("");

  const openCreate = React.useCallback(() => {
    setEditingNoteId(null);
    setDraftHtml("");
    setIsEditOpen(true);
  }, []);

  const openEdit = React.useCallback((note: ReminderNote) => {
    setEditingNoteId(note.id);
    setDraftHtml(note.html);
    setIsEditOpen(true);
  }, []);

  const closeEdit = React.useCallback(() => {
    setIsEditOpen(false);
    setEditingNoteId(null);
    setDraftHtml("");
  }, []);

  const saveEdit = React.useCallback(() => {
    setIsSaving(true);
    setError(null);

    (async () => {
      try {
        const isCreate = !editingNoteId;
        const response = isCreate
          ? await createReminderNote(location, { notes: draftHtml })
          : await updateReminderNote(location, editingNoteId, { notes: draftHtml });

        if (!response.success) {
          const msg =
            response?.message ||
            (isCreate ? "Failed to create reminder note" : "Failed to update reminder note");
          setError(msg);
          toast.error(msg);
          return;
        }

        toast.success(
          response.message ||
            (isCreate
              ? "Reminder note created successfully"
              : "Reminder note updated successfully")
        );
        closeEdit();
        await fetchNotes();
      } catch (e) {
        const msg =
          e instanceof Error
            ? e.message
            : editingNoteId
              ? "Failed to update reminder note"
              : "Failed to create reminder note";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsSaving(false);
      }
    })();
  }, [closeEdit, draftHtml, editingNoteId, fetchNotes]);

  // Delete modal state
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [deletingNoteId, setDeletingNoteId] = React.useState<string | null>(null);

  const openDelete = React.useCallback((noteId: string) => {
    setDeletingNoteId(noteId);
    setIsDeleteOpen(true);
  }, []);

  const closeDelete = React.useCallback(() => {
    setIsDeleteOpen(false);
    setDeletingNoteId(null);
  }, []);

  const confirmDelete = React.useCallback(() => {
    if (!deletingNoteId) return;
    setIsDeleting(true);
    setError(null);

    (async () => {
      try {
        const response = await deleteReminderNote(location, deletingNoteId);
        if (!response.success) {
          const msg = response?.message || "Failed to delete reminder note";
          setError(msg);
          toast.error(msg);
          return;
        }
        toast.success(response.message || "Reminder note deleted successfully");
        closeDelete();
        await fetchNotes();
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to delete reminder note";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsDeleting(false);
      }
    })();
  }, [closeDelete, deletingNoteId, fetchNotes]);

  return {
    // data
    displayNotes,
    notesSortDirection,
    isLoading,
    error,
    isSaving,
    isDeleting,
    fetchNotes,

    // sorting
    toggleSort,

    // edit modal
    isEditOpen,
    editingNoteId,
    draftHtml,
    setDraftHtml,
    openCreate,
    openEdit,
    closeEdit,
    saveEdit,

    // delete modal
    deleteModalState: {
      isOpen: isDeleteOpen,
      noteId: deletingNoteId,
    },
    openDelete,
    closeDelete,
    confirmDelete,
  };
}



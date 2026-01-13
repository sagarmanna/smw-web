"use client";

import * as React from "react";
import DOMPurify from "dompurify";
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { NotesSortDirection, ReminderNote } from "../../hooks/useReminderNotes";

interface ReminderNotesTableProps {
  notes: ReminderNote[];
  sortDirection: NotesSortDirection;
  onToggleSort: () => void;
  onEdit: (note: ReminderNote) => void;
  onDelete: (noteId: string) => void;
}

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "span",
      "div",
      "b",
      "i",
      "ul",
      "ol",
      "li",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "img",
      "sub",
      "sup",
      "mark",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "style",
      "data-color",
      "src",
      "alt",
      "width",
      "height",
      "colspan",
      "rowspan",
    ],
    ALLOW_DATA_ATTR: true,
  });
};

export function ReminderNotesTable({
  notes,
  sortDirection,
  onToggleSort,
  onEdit,
  onDelete,
}: ReminderNotesTableProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-primary font-semibold px-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2"
                  onClick={onToggleSort}
                  aria-label={`Toggle sort ${sortDirection === "asc" ? "descending" : "ascending"}`}
                >
                  Notes
                  <ArrowUpDown
                    className={`h-3 w-3 transition-transform duration-150 ${
                      sortDirection === "asc"
                        ? "transform rotate-180 text-primary"
                        : "text-primary"
                    }`}
                  />
                </button>
              </TableHead>
              <TableHead className="w-[56px]" />
            </TableRow>
          </TableHeader>

          <TableBody>
            {notes.map((note) => {
              const sanitized = sanitizeHtml(note.html);
              return (
                <TableRow key={note.id}>
                  <TableCell className="align-top px-4 py-4">
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_mark]:rounded [&_mark]:px-0.5"
                      dangerouslySetInnerHTML={{ __html: sanitized }}
                    />
                  </TableCell>

                  <TableCell className="align-top px-2 py-3">
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Edit note"
                        onClick={() => onEdit(note)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        aria-label="Delete note"
                        onClick={() => onDelete(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}



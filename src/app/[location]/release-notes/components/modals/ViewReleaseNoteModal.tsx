"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { getReleaseNotesList } from "../../releaseNotesListing.api";
import type { ReleaseNoteRow } from "../../types";

interface ViewReleaseNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  releaseNoteId: number | string | null;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'span', 'div', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'sub', 'sup', 'mark'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'data-color'],
    ALLOW_DATA_ATTR: true,
  });
};

export function ViewReleaseNoteModal({ isOpen, onClose, location, releaseNoteId }: ViewReleaseNoteModalProps) {
  const [releaseNote, setReleaseNote] = useState<ReleaseNoteRow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !releaseNoteId) {
      setReleaseNote(null);
      setError(null);
      return;
    }

    const fetchNote = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const numericId = typeof releaseNoteId === 'string' ? parseInt(releaseNoteId, 10) : releaseNoteId;
        if (isNaN(numericId)) {
          setError("Invalid release note ID");
          setIsLoading(false);
          return;
        }

        // Search through pages to find the note
        let foundNote: ReleaseNoteRow | null = null;

        for (let page = 1; page <= 10; page++) {
          const response = await getReleaseNotesList(location, {
            page,
            limit: 50,
            sortBy: 'id',
            sortDir: 'desc',
          });

          if (response && response.success && response.data) {
            const note = response.data.body.find(
              (note: ReleaseNoteRow) => note.id != null && Number(note.id) === numericId
            );

            if (note) {
              foundNote = note;
              break;
            }

            if (page >= response.data.pagination.totalPages) {
              break;
            }
          }
        }

        if (foundNote) {
          setReleaseNote(foundNote);
        } else {
          setError("Release note not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch release note";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [isOpen, releaseNoteId, location]);

  const sanitizedSummary = releaseNote ? sanitizeHtml(releaseNote.summary || "") : "";
  const sanitizedNotes = releaseNote ? sanitizeHtml(releaseNote.notes || "") : "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>View Release Note</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingAnimation size="lg" text="Loading release note..." className="text-center" />
          </div>
        )}

        {error && !isLoading && (
          <div className="py-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Release Note"
              fallbackMessage="An unexpected error occurred while loading the release note. Please try again later."
            />
          </div>
        )}

        {releaseNote && !isLoading && !error && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
              <dl className="divide-y divide-gray-200 dark:divide-gray-800">
                {/* Subject */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 dark:bg-gray-800/50">
                  <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Subject
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {releaseNote.subject}
                  </dd>
                </div>

                {/* Summary */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-gray-900">
                  <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Summary
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">
                    <div
                      className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:leading-relaxed [&_strong]:font-semibold [&_mark]:rounded [&_mark]:px-0.5"
                      dangerouslySetInnerHTML={{ __html: sanitizedSummary }}
                    />
                  </dd>
                </div>

                {/* Notes */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 dark:bg-gray-800/50">
                  <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Notes
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300">
                    <div
                      className="prose prose-sm max-w-none [&_p]:mb-2 [&_p]:last-child]:mb-0 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1 [&_mark]:rounded [&_mark]:px-0.5"
                      dangerouslySetInnerHTML={{ __html: sanitizedNotes }}
                    />
                  </dd>
                </div>

                {/* Schedule Date */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-gray-900">
                  <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Schedule date
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {releaseNote.scheduleDate}
                  </dd>
                </div>

                {/* Created Date */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-gray-50 dark:bg-gray-800/50">
                  <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Created Date
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {releaseNote.createdDate}
                  </dd>
                </div>

                {/* User Public Identity */}
                <div className="px-4 sm:px-6 py-4 sm:py-5 bg-white dark:bg-gray-900">
                  <dt className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    User Public Identity
                  </dt>
                  <dd className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                    {releaseNote.userPublicIdentity}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


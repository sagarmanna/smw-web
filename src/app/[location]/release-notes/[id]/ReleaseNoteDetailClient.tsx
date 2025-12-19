"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getReleaseNoteById } from "../releaseNotesListing.api";
import type { ReleaseNoteRow } from "../types";
import { DetailHeader } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { Button } from "@/components/ui/button";
import DOMPurify from "dompurify";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ReleaseNoteDetailClientProps {
  location: string;
  id: string;
}

/**
 * Sanitizes HTML content to prevent XSS attacks
 */
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 's', 'a', 'span', 'div', 'b', 'i', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'sub', 'sup'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style'],
    ALLOW_DATA_ATTR: false,
  });
};

export function ReleaseNoteDetailClient({ location, id }: ReleaseNoteDetailClientProps) {
  const router = useRouter();
  const [releaseNote, setReleaseNote] = React.useState<ReleaseNoteRow | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch release note details
  React.useEffect(() => {
    const fetchReleaseNote = async () => {
      if (!id) {
        setError("Invalid release note identifier");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to parse as number first, otherwise use as string (for index-based lookup)
        const identifier = !isNaN(Number(id)) ? Number(id) : id;
        const data = await getReleaseNoteById(location, identifier);
        if (data) {
          setReleaseNote(data);
        } else {
          setError("Release note not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load release note");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReleaseNote();
  }, [location, id]);

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Release Notes",
        onClick: () => router.push(`/${location}/release-notes`),
      },
    ],
    [location, router]
  );

  const handleUpdate = () => {
    router.push(`/${location}/release-notes/${id}/edit`);
  };

  const handleDelete = () => {
    // TODO: Implement delete functionality
    toast.info("Delete functionality coming soon");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading release note..." className="text-center" />
      </div>
    );
  }

  if (error || !releaseNote) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error || "Release note not found"}
          title="Unable to Load Release Note"
          fallbackMessage="An unexpected error occurred while loading the release note. Please try again later."
        />
      </div>
    );
  }

  const sanitizedSummary = sanitizeHtml(releaseNote.summary || "");
  const sanitizedNotes = sanitizeHtml(releaseNote.notes || "");

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        <DetailHeader
          breadcrumbItems={breadcrumbItems}
          currentPageTitle="View Release Notes"
          loading={isLoading}
          showActions={false}
          rightContent={
            <div className="flex items-center gap-2">
              <Button
                onClick={handleUpdate}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Pencil className="h-4 w-4 mr-2" />
                Update
              </Button>
              <Button
                onClick={handleDelete}
                variant="destructive"
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          }
        />

        {/* Main Content */}
        <div className="mt-6 px-2 sm:px-3 pb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
            {/* Detail Rows */}
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
                    className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:leading-relaxed [&_strong]:font-semibold"
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
                    className="prose prose-sm max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_p]:leading-relaxed [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:ml-6 [&_ol]:list-decimal [&_ol]:ml-6 [&_li]:mb-1"
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
        </div>
      </div>
    </>
  );
}


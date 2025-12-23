"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { updateReleaseNote as updateReleaseNoteAction } from "../../releaseNotesListing.slice";
import type { UpdateReleaseNoteRequest, ReleaseNoteRow } from "../../types";
import { format, parse } from "date-fns";
import { DetailHeader } from "@/components/DetailHeader";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";

interface EditReleaseNoteClientProps {
  location: string;
  id: string;
}

/**
 * Parse date from "MMM dd, yyyy" format to Date object
 */
const parseDisplayDate = (dateString: string): Date | undefined => {
  try {
    // Try parsing "MMM dd, yyyy" format (e.g., "Dec 16, 2025")
    return parse(dateString, "MMM dd, yyyy", new Date());
  } catch {
    try {
      // Fallback to standard date parsing
      return new Date(dateString);
    } catch {
      return undefined;
    }
  }
};

export function EditReleaseNoteClient({ location, id }: EditReleaseNoteClientProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [releaseVersion, setReleaseVersion] = useState("");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get release notes from Redux store
  const allRows = useAppSelector((state) => state.releaseNotesListing.allRows);
  const isLoadingStore = useAppSelector((state) => state.releaseNotesListing.isLoading);

  // Find the release note by ID from Redux store
  const releaseNote = React.useMemo(() => {
    if (!id) return null;
    
    // Try to parse as number first (ID from API is a number)
    const numericId = typeof id === 'string' && !isNaN(Number(id)) && id.trim() !== '' 
      ? Number(id) 
      : (!isNaN(Number(id)) ? Number(id) : null);
    
    if (numericId !== null) {
      // Find by numeric ID - use loose equality to handle any type coercion
      const found = allRows.find(note => note.id != null && Number(note.id) === numericId);
      return found || null;
    } else if (typeof id === 'string' && id.startsWith('index-')) {
      // Handle index-based identifier (fallback when ID is not available)
      const index = parseInt(id.replace('index-', ''), 10);
      if (!isNaN(index) && allRows[index]) {
        return allRows[index];
      }
    }
    
    return null;
  }, [allRows, id]);

  // Populate form fields when release note is found
  useEffect(() => {
    if (releaseNote) {
      setReleaseVersion(releaseNote.releaseVersion || "");
      setSubject(releaseNote.subject);
      setSummary(releaseNote.summary);
      setNotes(releaseNote.notes);
      
      // Parse schedule date from "MMM dd, yyyy" format
      const parsedDate = parseDisplayDate(releaseNote.scheduleDate);
      setScheduleDate(parsedDate);
    }
  }, [releaseNote]);

  const isLoadingData = isLoadingStore;
  const error = releaseNote === null && !isLoadingData ? "Release note not found" : null;

  const breadcrumbItems = React.useMemo(
    () => [
      {
        label: "Release Notes",
        onClick: () => router.push(`/${location}/release-notes`),
      },
      {
        label: "View Release Notes",
        onClick: () => router.push(`/${location}/release-notes/${id}`),
      },
    ],
    [location, id, router]
  );

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!subject.trim()) {
      newErrors.subject = "Subject cannot be blank.";
    } else if (subject.trim().length < 3) {
      newErrors.subject = "Subject must be at least 3 characters";
    } else if (subject.trim().length > 255) {
      newErrors.subject = "Subject must not exceed 255 characters";
    }

    // Check if summary has actual content (not just empty HTML tags)
    const summaryText = summary.replace(/<[^>]*>/g, "").trim();
    if (!summaryText) {
      newErrors.summary = "Summary cannot be blank.";
    }

    // Check if notes has actual content (not just empty HTML tags)
    const notesText = notes.replace(/<[^>]*>/g, "").trim();
    if (!notesText) {
      newErrors.notes = "Notes cannot be blank.";
    }

    if (!scheduleDate) {
      newErrors.scheduleDate = "Schedule date is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!scheduleDate) {
        throw new Error("Schedule date is required");
      }

      const identifier = !isNaN(Number(id)) ? Number(id) : id;
      const payload: UpdateReleaseNoteRequest = {
        subject: subject.trim(),
        summary: summary,
        notes: notes,
        scheduleDate: format(scheduleDate, "yyyy-MM-dd"),
        releaseVersion: releaseVersion.trim() || undefined,
      };

      // Call Redux action which will call API and update state
      await dispatch(updateReleaseNoteAction({ location, id: identifier, data: payload })).unwrap();

      toast.success("Release note updated successfully!");
      router.push(`/${location}/release-notes/${id}`);
    } catch (error: unknown) {
      const apiError = error as { message?: string; errorCode?: string };
      const errorMessage = apiError.message || "Failed to update release note";

      toast.error(errorMessage);

      if (apiError.errorCode === "BAD_REQUEST") {
        console.error("Validation error:", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setSubject(value);
    // Clear error when user starts typing
    if (errors.subject) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.subject;
        return newErrors;
      });
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <LoadingAnimation size="xl" text="Loading release note..." className="text-center" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 bg-white px-2 sm:px-3">
        <ErrorDisplay
          error={error}
          title="Unable to Load Release Note"
          fallbackMessage="An unexpected error occurred while loading the release note. Please try again later."
        />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-black -mt-2">
        <DetailHeader
          breadcrumbItems={breadcrumbItems}
          currentPageTitle="Edit Release Notes"
          loading={false}
          showActions={false}
        />

        {/* Main Content */}
        <div className="mt-6 px-2 sm:px-3 pb-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="releaseVersion">
                    Release Version#
                  </Label>
                  <Input
                    id="releaseVersion"
                    value={releaseVersion}
                    onChange={(e) => setReleaseVersion(e.target.value)}
                    placeholder="Enter release version"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduleDate">
                    Schedule date <span className="text-red-500">*</span>
                  </Label>
                  <DatePicker
                    value={scheduleDate}
                    onSelect={setScheduleDate}
                    placeholder="Select schedule date"
                    error={!!errors.scheduleDate}
                    errorMessage={errors.scheduleDate}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  Subject <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="Enter subject"
                  required
                  className={errors.subject ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.subject && <p className="text-sm text-red-500">{errors.subject}</p>}
              </div>

              <div className="space-y-2">
                <Label>
                  Summary <span className="text-red-500">*</span>
                </Label>
                <RichTextEditor
                  value={summary}
                  onChange={setSummary}
                  mode="simple"
                  minHeight="200px"
                  error={!!errors.summary}
                  errorMessage={errors.summary}
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Notes <span className="text-red-500">*</span>
                </Label>
                <RichTextEditor
                  value={notes}
                  onChange={setNotes}
                  mode="full"
                  minHeight="400px"
                  error={!!errors.notes}
                  errorMessage={errors.notes}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/${location}/release-notes/${id}`)} 
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}


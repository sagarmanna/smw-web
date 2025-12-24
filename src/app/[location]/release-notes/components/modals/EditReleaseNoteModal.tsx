"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useAppDispatch } from "@/redux/hooks";
import { updateReleaseNote } from "../../releaseNotesListing.slice";
import type { UpdateReleaseNoteRequest, ReleaseNoteRow } from "../../types";
import { format, parse } from "date-fns";
import { LoadingAnimation } from "@/components/LoadingAnimation";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { getReleaseNotesList } from "../../releaseNotesListing.api";

interface EditReleaseNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  location: string;
  releaseNoteId: number | string | null;
}

/**
 * Parse date from "MMM dd, yyyy" format to Date object
 */
const parseDisplayDate = (dateString: string): Date | undefined => {
  try {
    return parse(dateString, "MMM dd, yyyy", new Date());
  } catch {
    try {
      return new Date(dateString);
    } catch {
      return undefined;
    }
  }
};

export function EditReleaseNoteModal({ isOpen, onClose, onSuccess, location, releaseNoteId }: EditReleaseNoteModalProps) {
  const dispatch = useAppDispatch();
  const [releaseVersion, setReleaseVersion] = useState("");
  const [subject, setSubject] = useState("");
  const [summary, setSummary] = useState("");
  const [notes, setNotes] = useState("");
  const [scheduleDate, setScheduleDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [releaseNote, setReleaseNote] = useState<ReleaseNoteRow | null>(null);

  // Fetch release note data when modal opens
  useEffect(() => {
    if (!isOpen || !releaseNoteId) {
      setReleaseNote(null);
      setError(null);
      return;
    }

    const fetchNote = async () => {
      setIsLoadingData(true);
      setError(null);

      try {
        const numericId = typeof releaseNoteId === 'string' ? parseInt(releaseNoteId, 10) : releaseNoteId;
        if (isNaN(numericId)) {
          setError("Invalid release note ID");
          setIsLoadingData(false);
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
          // Populate form fields
          setReleaseVersion(foundNote.releaseVersion || "");
          setSubject(foundNote.subject);
          setSummary(foundNote.summary);
          setNotes(foundNote.notes);
          const parsedDate = parseDisplayDate(foundNote.scheduleDate);
          setScheduleDate(parsedDate);
        } else {
          setError("Release note not found");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch release note";
        setError(errorMessage);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchNote();
  }, [isOpen, releaseNoteId, location]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReleaseVersion("");
      setSubject("");
      setSummary("");
      setNotes("");
      setScheduleDate(undefined);
      setErrors({});
      setError(null);
      setReleaseNote(null);
    }
  }, [isOpen]);

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

    // Notes is optional - no validation needed

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

    if (!releaseNote || !releaseNote.id) {
      toast.error("Release note ID not found");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!scheduleDate) {
        throw new Error("Schedule date is required");
      }

      const payload: UpdateReleaseNoteRequest = {
        subject: subject.trim(),
        summary: summary,
        scheduleDate: format(scheduleDate, "yyyy-MM-dd"),
        releaseVersion: releaseVersion.trim() || undefined,
      };

      // Only include notes if it has content (notes is optional)
      if (notes && notes.trim()) {
        payload.notes = notes;
      }

      // Call Redux action which will call API and update state
      await dispatch(updateReleaseNote({ location, id: releaseNote.id, data: payload })).unwrap();

      toast.success("Release note updated successfully!");
      onSuccess?.();
      onClose();
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Release Note</DialogTitle>
        </DialogHeader>

        {isLoadingData && (
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingAnimation size="lg" text="Loading release note..." className="text-center" />
          </div>
        )}

        {error && !isLoadingData && (
          <div className="py-4">
            <ErrorDisplay
              error={error}
              title="Unable to Load Release Note"
              fallbackMessage="An unexpected error occurred while loading the release note. Please try again later."
            />
          </div>
        )}

        {releaseNote && !isLoadingData && !error && (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                Notes
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
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
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

